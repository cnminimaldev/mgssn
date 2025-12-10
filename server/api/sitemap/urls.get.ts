// import { serverSupabaseClient } from '#supabase/server'

// export default defineEventHandler(async (event) => {
//   // [FIX] Thêm <any> để bypass lỗi kiểm tra type
//   const client = await serverSupabaseClient<any>(event)

//   // 1. Lấy danh sách Movie
//   const { data: movies } = await client
//     .from('movies')
//     .select('slug, updated_at')

//   // 2. Lấy danh sách Series
//   const { data: series } = await client
//     .from('series')
//     .select('slug, updated_at')

//   // 3. Map dữ liệu sang chuẩn Sitemap
//   const movieUrls = (movies || []).map((m: any) => ({
//     loc: `/movie/${m.slug}`,
//     lastmod: m.updated_at,
//     changefreq: 'weekly',
//     priority: 0.8,
//   }))

//   const seriesUrls = (series || []).map((s: any) => ({
//     loc: `/series/${s.slug}`,
//     lastmod: s.updated_at,
//     changefreq: 'weekly',
//     priority: 0.8,
//   }))

//   const staticUrls = [
//     { loc: '/ranking', changefreq: 'daily', priority: 0.9 },
//     { loc: '/search', changefreq: 'monthly', priority: 0.7 },
//   ]

//   // 4. Trả về danh sách tổng hợp
//   return [...staticUrls, ...movieUrls, ...seriesUrls]
// })

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Dùng <any> để tránh lỗi type như lần trước
  const client = await serverSupabaseClient<any>(event)

  // 1. Lấy danh sách Movie
  const { data: movies } = await client
    .from('movies')
    .select('slug, updated_at')

  // 2. Lấy danh sách Series
  const { data: series } = await client
    .from('series')
    .select('slug, updated_at')

  // 3. [THÊM MỚI] Lấy danh sách Genres (Thể loại)
  // Chỉ lấy các genre đang active
  const { data: genres } = await client
    .from('genres')
    .select('slug')
    .eq('is_active', true)

  // --- MAPPING URLs ---

  const movieUrls = (movies || []).map((m: any) => ({
    loc: `/movie/${m.slug}`,
    lastmod: m.updated_at,
    changefreq: 'weekly',
    priority: 0.8,
  }))

  const seriesUrls = (series || []).map((s: any) => ({
    loc: `/series/${s.slug}`,
    lastmod: s.updated_at,
    changefreq: 'weekly',
    priority: 0.8,
  }))

  // [THÊM MỚI] Map Genre URLs
  const genreUrls = (genres || []).map((g: any) => ({
    loc: `/genres/${g.slug}`,
    changefreq: 'weekly',
    priority: 0.6, // Priority thấp hơn phim một chút
  }))

  const staticUrls = [
    { loc: '/ranking', changefreq: 'daily', priority: 0.9 },
    { loc: '/search', changefreq: 'monthly', priority: 0.7 },
  ]

  // 4. Trả về danh sách tổng hợp
  return [...staticUrls, ...genreUrls, ...movieUrls, ...seriesUrls]
})