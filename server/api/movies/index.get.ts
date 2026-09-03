import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

// Helper chuyển đổi toàn bộ Katakana sang Hiragana
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
  highlightedTitle?: string 
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
  isPublic: boolean
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  // --- 1. Params ---
  const searchRaw = typeof query.q === 'string' ? query.q.trim() : ''
  // Bỏ const search = searchRaw ? toHiragana(searchRaw) : ''
  const search = searchRaw

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

  const isAdmin = query.isAdmin === 'true'

  // --- 2. Build Query ---
  let dbQuery = client.from('all_contents').select('*', { count: 'exact' })
  
  const highlightMap: Record<string, string> = {}
  const recommendedOrder: Record<string, number> = {}

  // --- 3. Filter (Áp dụng bộ lọc) ---
  if (!isAdmin) {
    dbQuery = dbQuery.eq('is_public', true)
  }

  if (typeParam === 'movie' || typeParam === 'series') {
    dbQuery = dbQuery.eq('type', typeParam)
  }
  if (genreSlugs.length > 0) {
    dbQuery = dbQuery.overlaps('genre_slugs', genreSlugs)
  }
  if (countries.length > 0) {
    dbQuery = dbQuery.in('origin_country', countries)
  }
  if (!Number.isNaN(yearNum)) {
    dbQuery = dbQuery.eq('year', yearNum)
  }

  // TÌM KIẾM DIỄN VIÊN / ĐẠO DIỄN
  if (castParam || directorParam) {
    const roleFilter = castParam ? 'cast' : 'director';
    const searchName = castParam || directorParam;

    const { data: crewMatches, error: crewErr } = await client
      .from('content_crew')
      .select('content_id, type, persons!inner(name)')
      .eq('role', roleFilter)
      .ilike('persons.name', `%${searchName}%`);

    if (!crewErr && crewMatches && crewMatches.length > 0) {
      const movieIds = crewMatches.filter((c: any) => c.type === 'movie').map((c: any) => c.content_id);
      const seriesIds = crewMatches.filter((c: any) => c.type === 'series').map((c: any) => c.content_id);

      const orFilters = [];
      if (movieIds.length > 0) orFilters.push(`and(type.eq.movie,id.in.(${movieIds.join(',')}))`);
      if (seriesIds.length > 0) orFilters.push(`and(type.eq.series,id.in.(${seriesIds.join(',')}))`);

      if (orFilters.length > 0) {
         dbQuery = dbQuery.or(orFilters.join(','));
      } else {
         dbQuery = dbQuery.eq('id', -1); 
      }
    } else {
      dbQuery = dbQuery.eq('id', -1); 
    }
  }

  // TÌM KIẾM BẰNG TỪ KHÓA (SỬ DỤNG RPC)
  let isCustomRelevanceSort = false

  if (search) {
    isCustomRelevanceSort = sortParam === 'recommended'
    
    // [ĐÃ SỬA] Tắt phân trang ở RPC. Lấy tối đa 1000 ID khớp từ khóa để DB tự đếm số Public
    const { data: searchResults, error: searchError } = await client
      .rpc('search_japanese_media', { 
        search_term: search,
        p_limit: 1000, 
        p_offset: 0
      })
    
    if (searchError) {
      throw createError({ statusCode: 500, statusMessage: searchError.message })
    }

    if (!searchResults || searchResults.length === 0) {
      return { items: [], total: 0, page, pageSize }
    }

    const movieIds: number[] = []
    const seriesIds: number[] = []
    
    searchResults.forEach((item: any, index: number) => {
      const key = `${item.type}-${item.id}`
      highlightMap[key] = item.highlighted_title
      recommendedOrder[key] = index // Lưu lại thứ tự ưu tiên của thuật toán tìm kiếm
      
      if (item.type === 'movie') movieIds.push(item.id)
      if (item.type === 'series') seriesIds.push(item.id)
    })

    const orFilters = []
    if (movieIds.length > 0) orFilters.push(`and(type.eq.movie,id.in.(${movieIds.join(',')}))`)
    if (seriesIds.length > 0) orFilters.push(`and(type.eq.series,id.in.(${seriesIds.join(',')}))`)
    
    if (orFilters.length > 0) {
      dbQuery = dbQuery.or(orFilters.join(','))
    } else {
      dbQuery = dbQuery.eq('id', -1)
    }
  }

  // --- 4. Sorting & Pagination (DB Side) ---
  // Chỉ phân trang bằng Database nếu không dùng bộ lọc Recommended
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
    const thumbnail = row.banner_url || row.poster_url 
      ? `${row.banner_url || row.poster_url}` 
      : '/images/fallback-poster.png'
    
    const posterUrl = row.poster_url || '/images/fallback-poster.png'
    const bannerUrl = row.banner_url || ''
    
    const key = `${row.type}-${row.id}`

    return {
      id: row.id,
      type: row.type, 
      slug: row.slug ?? String(row.id),
      title: row.title,
      highlightedTitle: highlightMap[key] || row.title,
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
      createdAt: row.created_at,
      isPublic: row.is_public !== false
    }
  })

  // --- 7. Sắp xếp và Phân trang Bằng Javascript ---
  // [ĐÃ SỬA] count bây giờ là số lượng chính xác 100% của các phim đang Public
  let finalTotal = count ?? 0

  // [ĐÃ SỬA] Sửa lỗi if logic bị sai (!search -> search)
  if (isCustomRelevanceSort) {
    // Trả lại thứ tự chuẩn cho kết quả tìm kiếm
    items.sort((a, b) => {
      const orderA = recommendedOrder[`${a.type}-${a.id}`] ?? 9999
      const orderB = recommendedOrder[`${b.type}-${b.id}`] ?? 9999
      return orderA - orderB
    })
    
    finalTotal = items.length
    
    // Áp dụng phân trang thủ công do nãy ta đã ngắt phân trang của DB
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