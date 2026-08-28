import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<any>(event)

  // [TUYỆT CHIÊU CUỐI]: Khai báo cứng tên miền ở đây để vô hiệu hóa mọi cơ chế cache của Nuxt
  const baseUrl = 'https://noritv.com'

  // 1. Lấy danh sách Movie
  const { data: movies } = await client
    .from('movies')
    .select('slug, updated_at, created_at')

  // 2. Lấy danh sách Series
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

  // --- MAPPING URLs (Ép ghép baseUrl vào từng link) ---

  const movieUrls = (movies || []).map((m: any) => ({
    loc: `${baseUrl}/movie/${m.slug}`,
    lastmod: m.updated_at || m.created_at || new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  }))

  const seriesUrls = (series || []).map((s: any) => ({
    loc: `${baseUrl}/series/${s.slug}`,
    lastmod: s.updated_at || s.created_at || new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }))
  
  const episodeUrls = (episodes || []).map((ep: any) => ({
    loc: `${baseUrl}/series/${ep.series.slug}/episode/${ep.episode_number}`,
    lastmod: ep.created_at || new Date().toISOString(),
    changefreq: 'yearly',
    priority: 0.7,
  }))

  const genreUrls = (genres || []).map((g: any) => ({
    loc: `${baseUrl}/genres/${g.slug}`,
    changefreq: 'weekly',
    priority: 0.6, 
  }))

  // const staticUrls = [
  //   { loc: `${baseUrl}/ranking`, changefreq: 'daily', priority: 0.9 },
  //   { loc: `${baseUrl}/search`, changefreq: 'monthly', priority: 0.7 },
  // ]

  // 5. Trả về danh sách tổng hợp
  //return [...staticUrls, ...genreUrls, ...movieUrls, ...seriesUrls, ...episodeUrls]
  return [...genreUrls, ...movieUrls, ...seriesUrls, ...episodeUrls]
})