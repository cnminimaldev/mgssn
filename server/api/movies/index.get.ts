// import { serverSupabaseClient } from '#supabase/server'
// import { getQuery, createError } from 'h3'

// function toHiragana(input: string) {
//   return input.replace(/[\u30A1-\u30F6]/g, (ch) =>
//     String.fromCharCode(ch.charCodeAt(0) - 0x60),
//   )
// }

// type ApiMediaItem = {
//   id: number
//   type: 'movie' | 'series'
//   slug: string
//   title: string
//   originalTitle: string | null
//   titleKana: string | null
//   year: number
//   country: string
//   description: string
//   thumbnail: string
//   posterUrl: string
//   bannerUrl: string
//   genre: string
//   episodeCount?: number
//   createdAt: string
// }

// export default defineEventHandler(async (event) => {
//   const client = await serverSupabaseClient(event)
//   const query = getQuery(event)

//   // --- PARAMS ---
//   const searchRaw = typeof query.q === 'string' ? query.q.trim() : ''
//   const search = searchRaw || ''

//   // [MỚI] Lấy tham số type
//   const typeParam = typeof query.type === 'string' ? query.type : ''

//   const genresParam = typeof query.genres === 'string' ? query.genres : ''
//   const genreSlugs = genresParam
//     ? genresParam.split(',').map((x) => x.trim()).filter(Boolean)
//     : []

//   const countriesParam = typeof query.countries === 'string' ? query.countries : ''
//   const countries = countriesParam
//     ? countriesParam.split(',').map((x) => x.trim()).filter(Boolean)
//     : []

//   const yearParam = typeof query.year === 'string' ? query.year : ''
//   const yearNum = yearParam ? Number(yearParam) : NaN

//   const sortParam = typeof query.sort === 'string' ? query.sort : 'recommended'
  
//   const pageParam = typeof query.page === 'string' ? Number(query.page) : 1
//   const pageSizeParam = typeof query.pageSize === 'string' ? Number(query.pageSize) : 24

//   const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
//   const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100 ? pageSizeParam : 24

//   // --- QUERY ---
//   let dbQuery = client
//     .from('all_contents')
//     .select('*', { count: 'exact' })

//   // --- FILTERS ---
  
//   // [MỚI] Lọc theo Type
//   if (typeParam === 'movie' || typeParam === 'series') {
//     dbQuery = dbQuery.eq('type', typeParam)
//   }

//   if (genreSlugs.length > 0) {
//     dbQuery = dbQuery.overlaps('genre_slugs', genreSlugs)
//   }

//   if (search) {
//     const kana = toHiragana(search)
//     dbQuery = dbQuery.or(
//       `title.ilike.%${search}%,title_kana.ilike.%${kana}%,original_title.ilike.%${search}%,director.ilike.%${search}%,main_cast.ilike.%${search}%`
//     )
//   }

//   if (countries.length > 0) {
//     dbQuery = dbQuery.in('origin_country', countries)
//   }

//   if (!Number.isNaN(yearNum)) {
//     dbQuery = dbQuery.eq('year', yearNum)
//   }

//   // --- SORT ---
//   if (sortParam === 'year_desc') {
//     dbQuery = dbQuery.order('year', { ascending: false })
//   } else if (sortParam === 'year_asc') {
//     dbQuery = dbQuery.order('year', { ascending: true })
//   } else if (sortParam === 'title_asc') {
//     dbQuery = dbQuery.order('title', { ascending: true })
//   } else {
//     dbQuery = dbQuery.order('created_at', { ascending: false })
//   }

//   // --- PAGINATION ---
//   const from = (page - 1) * pageSize
//   const to = from + pageSize - 1
//   dbQuery = dbQuery.range(from, to)

//   // --- EXECUTE ---
//   const { data, error, count } = await dbQuery

//   if (error) {
//     throw createError({ statusCode: 500, statusMessage: error.message })
//   }

//   // --- MAPPING ---
//   const items: ApiMediaItem[] = (data ?? []).map((row: any) => {
//     // Logic Thumbnail: Banner > Poster
//     const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
//     const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
//     const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''

//     return {
//       id: row.id,
//       type: row.type,
//       slug: row.slug ?? String(row.id),
//       title: row.title,
//       originalTitle: row.original_title,
//       titleKana: row.title_kana,
//       year: row.year,
//       country: row.origin_country,
//       description: row.description,
//       thumbnail,
//       posterUrl,
//       bannerUrl,
//       genre: row.genre_label || 'その他',
//       episodeCount: row.episode_count || 0,
//       createdAt: row.created_at
//     }
//   })

//   return {
//     items,
//     total: count ?? 0,
//     page,
//     pageSize,
//   }
// })

import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

// Helper chuyển đổi Katakana sang Hiragana
function toHiragana(input: string) {
  return input.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  )
}

type ApiMediaItem = {
  id: number
  type: 'movie' | 'series'
  slug: string
  title: string
  originalTitle: string | null
  titleKana: string | null
  year: number
  country: string
  description: string
  thumbnail: string
  posterUrl: string
  bannerUrl: string
  genre: string
  episodeCount?: number
  createdAt: string
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  // --- 1. Params (Lấy tham số từ URL) ---
  const searchRaw = typeof query.q === 'string' ? query.q.trim() : ''
  const search = searchRaw || ''

  // [THÊM MỚI] Tham số lọc theo Diễn viên và Đạo diễn
  const castParam = typeof query.cast === 'string' ? query.cast.trim() : ''
  const directorParam = typeof query.director === 'string' ? query.director.trim() : ''

  // [THÊM MỚI] Tham số lọc theo Type (Movie/Series) - Rất quan trọng cho trang search
  const typeParam = typeof query.type === 'string' ? query.type : ''

  const genresParam = typeof query.genres === 'string' ? query.genres : ''
  const genreSlugs = genresParam
    ? genresParam.split(',').map((x) => x.trim()).filter(Boolean)
    : []

  const countriesParam = typeof query.countries === 'string' ? query.countries : ''
  const countries = countriesParam
    ? countriesParam.split(',').map((x) => x.trim()).filter(Boolean)
    : []

  const yearParam = typeof query.year === 'string' ? query.year : ''
  const yearNum = yearParam ? Number(yearParam) : NaN

  const sortParam = typeof query.sort === 'string' ? query.sort : 'recommended'
  
  const pageParam = typeof query.page === 'string' ? Number(query.page) : 1
  const pageSizeParam = typeof query.pageSize === 'string' ? Number(query.pageSize) : 24

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100 ? pageSizeParam : 24

  // --- 2. Build Query ---
  // Sử dụng View "all_contents" để lấy cả Movie và Series
  let dbQuery = client
    .from('all_contents')
    .select('*', { count: 'exact' })

  // --- 3. Filter (Áp dụng bộ lọc) ---
  
  // [THÊM MỚI] Filter theo Type (movie / series)
  if (typeParam === 'movie' || typeParam === 'series') {
    dbQuery = dbQuery.eq('type', typeParam)
  }

  // Filter theo Genre
  if (genreSlugs.length > 0) {
    dbQuery = dbQuery.overlaps('genre_slugs', genreSlugs)
  }

  // Filter theo Search Text (Tìm chung chung)
  if (search) {
    const kana = toHiragana(search)
    dbQuery = dbQuery.or(
      `title.ilike.%${search}%,title_kana.ilike.%${kana}%,original_title.ilike.%${search}%,director.ilike.%${search}%,main_cast.ilike.%${search}%`
    )
  }

  // [THÊM MỚI] Filter chuyên biệt cho Cast (Tìm chính xác trong cột main_cast)
  if (castParam) {
    // Dùng ilike để tìm không phân biệt hoa thường (VD: "Tom" sẽ khớp "Tom Cruise")
    dbQuery = dbQuery.ilike('main_cast', `%${castParam}%`)
  }

  // [THÊM MỚI] Filter chuyên biệt cho Director
  if (directorParam) {
    dbQuery = dbQuery.ilike('director', `%${directorParam}%`)
  }

  // Filter theo Country
  if (countries.length > 0) {
    dbQuery = dbQuery.in('origin_country', countries)
  }

  // Filter theo Year
  if (!Number.isNaN(yearNum)) {
    dbQuery = dbQuery.eq('year', yearNum)
  }

  // --- 4. Sorting ---
  if (sortParam === 'year_desc') {
    dbQuery = dbQuery.order('year', { ascending: false })
  } else if (sortParam === 'year_asc') {
    dbQuery = dbQuery.order('year', { ascending: true })
  } else if (sortParam === 'title_asc') {
    dbQuery = dbQuery.order('title', { ascending: true })
  } else {
    // Default: Mới nhất lên đầu
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  // --- 5. Pagination ---
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  dbQuery = dbQuery.range(from, to)

  // --- 6. Execute ---
  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // --- 7. Mapping ---
  const items: ApiMediaItem[] = (data ?? []).map((row: any) => {
    // Logic Resize ảnh: Banner ưu tiên, fallback Poster
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''

    return {
      id: row.id,
      type: row.type, 
      slug: row.slug ?? String(row.id),
      title: row.title,
      originalTitle: row.original_title,
      titleKana: row.title_kana,
      year: row.year,
      country: row.origin_country,
      description: row.description,
      thumbnail,
      posterUrl,
      bannerUrl,
      genre: row.genre_label || 'その他',
      episodeCount: row.episode_count || 0,
      createdAt: row.created_at
    }
  })

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
  }
})