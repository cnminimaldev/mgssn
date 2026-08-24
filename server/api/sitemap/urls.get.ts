import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<any>(event)

  // 1. Lấy danh sách Movie (Thêm created_at để dự phòng)
  const { data: movies } = await client
    .from('movies')
    .select('slug, updated_at, created_at')

  // 2. Lấy danh sách Series (Thêm created_at)
  const { data: series } = await client
    .from('series')
    .select('slug, updated_at, created_at')
    
  // 3. Lấy danh sách Tập phim (Episodes) kèm theo slug của Series cha
  const { data: episodes } = await client
    .from('episodes')
    .select('episode_number, created_at, series!inner(slug)')

  // 4. Lấy danh sách Genres (Thể loại)
  const { data: genres } = await client
    .from('genres')
    .select('slug')
    .eq('is_active', true)

  // --- MAPPING URLs ---

  const movieUrls = (movies || []).map((m: any) => ({
    loc: `/movie/${m.slug}`,
    // CHUẨN SEO: Ưu tiên updated_at -> created_at -> giờ hiện tại
    lastmod: m.updated_at || m.created_at || new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  }))

  const seriesUrls = (series || []).map((s: any) => ({
    loc: `/series/${s.slug}`,
    lastmod: s.updated_at || s.created_at || new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }))
  
  // Bơm trực tiếp link từng tập phim vào mâm cho Googlebot xơi
  const episodeUrls = (episodes || []).map((ep: any) => ({
    loc: `/series/${ep.series.slug}/episode/${ep.episode_number}`,
    lastmod: ep.created_at || new Date().toISOString(),
    changefreq: 'yearly', // Tập phim phát rồi thì ít khi sửa lại
    priority: 0.7,
  }))

  const genreUrls = (genres || []).map((g: any) => ({
    loc: `/genres/${g.slug}`,
    changefreq: 'weekly',
    priority: 0.6, 
  }))

  const staticUrls = [
    { loc: '/ranking', changefreq: 'daily', priority: 0.9 },
    { loc: '/search', changefreq: 'monthly', priority: 0.7 },
  ]

  // 5. Trả về danh sách tổng hợp
  return [...staticUrls, ...genreUrls, ...movieUrls, ...seriesUrls, ...episodeUrls]
})