import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

// Helper chuyển đổi Katakana sang Hiragana (vẫn giữ lại cho các bộ lọc cũ nếu cần)
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
  highlightedTitle?: string // [THÊM MỚI] Chứa thẻ HTML bôi đen
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

  // --- 1. Params ---
  const searchRaw = typeof query.q === 'string' ? query.q.trim() : ''
  const search = searchRaw || ''

  const castParam = typeof query.cast === 'string' ? query.cast.trim() : ''
  const directorParam = typeof query.director === 'string' ? query.director.trim() : ''
  const typeParam = typeof query.type === 'string' ? query.type : ''

  const genresParam = typeof query.genres === 'string' ? query.genres : ''
  const genreSlugs = genresParam ? genresParam.split(',').map((x) => x.trim()).filter(Boolean) : []

  const countriesParam = typeof query.countries === 'string' ? query.countries : ''
  const countries = countriesParam ? countriesParam.split(',').map((x) => x.trim()).filter(Boolean) : []

  const yearParam = typeof query.year === 'string' ? query.year : ''
  const yearNum = yearParam ? Number(yearParam) : NaN

  const sortParam = typeof query.sort === 'string' ? query.sort : 'recommended'
  
  const pageParam = typeof query.page === 'string' ? Number(query.page) : 1
  const pageSizeParam = typeof query.pageSize === 'string' ? Number(query.pageSize) : 24

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100 ? pageSizeParam : 24

  // --- 2. Build Query ---
  let dbQuery = client.from('all_contents').select('*', { count: 'exact' })
  
  // Biến lưu trữ dữ liệu Highlight và Xếp hạng từ PGroonga
  const highlightMap: Record<string, string> = {}
  const recommendedOrder: Record<string, number> = {}

  // --- 3. Filter (Áp dụng bộ lọc) ---
  
  if (typeParam === 'movie' || typeParam === 'series') {
    dbQuery = dbQuery.eq('type', typeParam)
  }
  if (genreSlugs.length > 0) {
    dbQuery = dbQuery.overlaps('genre_slugs', genreSlugs)
  }

  // [TÍCH HỢP PGROONGA]
  if (search) {
    const { data: searchResults, error: searchError } = await client
      .rpc('search_japanese_media', { search_term: search })
    
    if (searchError) {
      throw createError({ statusCode: 500, statusMessage: searchError.message })
    }

    if (!searchResults || searchResults.length === 0) {
      // Tìm không thấy -> Trả về rỗng ngay lập tức
      return { items: [], total: 0, page, pageSize }
    }

    const movieIds: number[] = []
    const seriesIds: number[] = []
    
    searchResults.forEach((item: any, index: number) => {
      const key = `${item.type}-${item.id}`
      highlightMap[key] = item.highlighted_title
      recommendedOrder[key] = index // Lưu lại vị trí để sort relevance
      
      if (item.type === 'movie') movieIds.push(item.id)
      if (item.type === 'series') seriesIds.push(item.id)
    })

    // Ép dbQuery chỉ lấy những phim nằm trong kết quả PGroonga
    const orFilters = []
    if (movieIds.length > 0) orFilters.push(`and(type.eq.movie,id.in.(${movieIds.join(',')}))`)
    if (seriesIds.length > 0) orFilters.push(`and(type.eq.series,id.in.(${seriesIds.join(',')}))`)
    
    dbQuery = dbQuery.or(orFilters.join(','))
  }

  if (castParam) {
    dbQuery = dbQuery.ilike('main_cast', `%${castParam}%`)
  }
  if (directorParam) {
    dbQuery = dbQuery.ilike('director', `%${directorParam}%`)
  }
  if (countries.length > 0) {
    dbQuery = dbQuery.in('origin_country', countries)
  }
  if (!Number.isNaN(yearNum)) {
    dbQuery = dbQuery.eq('year', yearNum)
  }

  // --- 4. Sorting & Pagination ---
  // ĐIỂM CHÚ Ý: Nếu đang search và sort="recommended", ta sẽ không phân trang/sort ở DB 
  // mà lấy toàn bộ data ra để Javascript tự sort theo độ chính xác của PGroonga.
  const isCustomRelevanceSort = search && sortParam === 'recommended'

  if (!isCustomRelevanceSort) {
    if (sortParam === 'year_desc') {
      dbQuery = dbQuery.order('year', { ascending: false })
    } else if (sortParam === 'year_asc') {
      dbQuery = dbQuery.order('year', { ascending: true })
    } else if (sortParam === 'title_asc') {
      dbQuery = dbQuery.order('title', { ascending: true })
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }
    
    // DB Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    dbQuery = dbQuery.range(from, to)
  }

  // --- 5. Execute ---
  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // --- 6. Mapping ---
  let items: ApiMediaItem[] = (data ?? []).map((row: any) => {
    // Lưu ý: Đảm bảo getResizedUrl đã được import hoặc auto-import trong dự án của bạn
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''
    
    const key = `${row.type}-${row.id}`

    return {
      id: row.id,
      type: row.type, 
      slug: row.slug ?? String(row.id),
      title: row.title,
      highlightedTitle: highlightMap[key] || row.title, // Nạp thẻ bôi đen vào
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

  // --- 7. Sắp xếp và Phân trang Bằng Javascript (Cho trường hợp Relevance) ---
  let finalTotal = count ?? 0

  if (isCustomRelevanceSort) {
    // Xếp theo đúng thứ tự mảng trả về của PGroonga
    items.sort((a, b) => {
      const orderA = recommendedOrder[`${a.type}-${a.id}`] ?? 9999
      const orderB = recommendedOrder[`${b.type}-${b.id}`] ?? 9999
      return orderA - orderB
    })
    
    finalTotal = items.length
    
    // Cắt mảng lấy đúng số lượng trang
    const from = (page - 1) * pageSize
    items = items.slice(from, from + pageSize)
  }

  return {
    items,
    total: finalTotal,
    page,
    pageSize,
  }
})