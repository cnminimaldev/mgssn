import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  // 1. Cấu hình Header trả về định dạng XML và Cache
  setHeader(event, 'Content-Type', 'text/xml');
  // Cache 6 tiếng để giảm tải cho Supabase khi Googlebot liên tục vào cào
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=21600'); 

  const supabase = await serverSupabaseClient<any>(event);
  const siteUrl = 'https://noritv.com';

  // 2. Khởi tạo cấu trúc Video Sitemap chuẩn của Google
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  // Hàm Helper: Google XML rất khắt khe, bắt buộc phải escape các ký tự đặc biệt
  const escapeXml = (unsafe: string) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const getAbsoluteUrl = (path: string) => {
    if (!path) return `${siteUrl}/images/banner.jpg`;
    return path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // 3. FETCH EPISODES (Có phân trang để lấy đủ 8000+ tập)
  let hasMoreEpisodes = true;
  let epPage = 0;
  const pageSize = 1000;

  while (hasMoreEpisodes) {
    const { data: episodes } = await supabase
      .from('episodes')
      .select(`
        id, episode_number, title, thumbnail_url, duration_minutes, created_at,
        series:series_id ( slug, title, description, banner_url, poster_url )
      `)
      .order('created_at', { ascending: false })
      .range(epPage * pageSize, (epPage + 1) * pageSize - 1);

    if (!episodes || episodes.length === 0) {
      hasMoreEpisodes = false;
      break;
    }

    for (const ep of episodes) {
      const series = Array.isArray(ep.series) ? ep.series[0] : ep.series;
      if (!series?.slug) continue;

      const loc = `${siteUrl}/series/${series.slug}/episode/${ep.episode_number}`;
      const epLabel = ep.title ? ep.title : `第${ep.episode_number}話`;
      const title = `${series.title} ${epLabel} 無料動画 | NoriTV`;
      const desc = `【${epLabel}】${series.description || '映画やドラマをオンラインで楽しめるNoriTV。'}`;
      const thumb = getAbsoluteUrl(ep.thumbnail_url || series.banner_url || series.poster_url);

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <video:video>\n`;
      xml += `      <video:thumbnail_loc>${escapeXml(thumb)}</video:thumbnail_loc>\n`;
      xml += `      <video:title>${escapeXml(title)}</video:title>\n`;
      xml += `      <video:description>${escapeXml(desc)}</video:description>\n`;
      if (ep.created_at) xml += `      <video:publication_date>${new Date(ep.created_at).toISOString()}</video:publication_date>\n`;
      if (ep.duration_minutes) xml += `      <video:duration>${ep.duration_minutes * 60}</video:duration>\n`; // Google yêu cầu thời lượng tính bằng Giây
      xml += `    </video:video>\n`;
      xml += `  </url>\n`;
    }

    if (episodes.length < pageSize) hasMoreEpisodes = false;
    epPage++;
  }

  // 4. FETCH MOVIES (Tương tự như Episodes)
  let hasMoreMovies = true;
  let mvPage = 0;

  while (hasMoreMovies) {
    const { data: movies } = await supabase
      .from('movies')
      .select('slug, title, description, poster_url, banner_url, duration_minutes, created_at')
      .order('created_at', { ascending: false })
      .range(mvPage * pageSize, (mvPage + 1) * pageSize - 1);

    if (!movies || movies.length === 0) {
      hasMoreMovies = false;
      break;
    }

    for (const movie of movies) {
      const loc = `${siteUrl}/movie/${movie.slug}`;
      const title = `${movie.title} 無料動画 | NoriTV`;
      const desc = movie.description || `${movie.title}の無料動画`;
      const thumb = getAbsoluteUrl(movie.banner_url || movie.poster_url);

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <video:video>\n`;
      xml += `      <video:thumbnail_loc>${escapeXml(thumb)}</video:thumbnail_loc>\n`;
      xml += `      <video:title>${escapeXml(title)}</video:title>\n`;
      xml += `      <video:description>${escapeXml(desc)}</video:description>\n`;
      if (movie.created_at) xml += `      <video:publication_date>${new Date(movie.created_at).toISOString()}</video:publication_date>\n`;
      if (movie.duration_minutes) xml += `      <video:duration>${movie.duration_minutes * 60}</video:duration>\n`;
      xml += `    </video:video>\n`;
      xml += `  </url>\n`;
    }
    
    if (movies.length < pageSize) hasMoreMovies = false;
    mvPage++;
  }

  xml += `</urlset>`;
  return xml;
});