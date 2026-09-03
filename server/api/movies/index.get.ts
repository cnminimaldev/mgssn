import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

// 1. Helper: Chuyển Katakana -> Hiragana
function toHiragana(input: string) {
  return input.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  )
}

// 2. Helper: Chuyển Hiragana -> Katakana
function toKatakana(input: string) {
  return input.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
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
  // Lấy nguyên bản từ khóa người dùng gõ
  const searchRaw = typeof query.q === 'string' ? query.q.trim() : ''

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

  // TÌM KIẾM BẰNG TỪ KHÓA ĐA BIẾN THỂ (MULTI-TERM PARALLEL SEARCH)
  let isCustomRelevanceSort = false
  let totalSearchResults = 0

  if (searchRaw) {
    isCustomRelevanceSort = sortParam === 'recommended'
    
    // Tạo mảng chứa 3 phiên bản từ khóa. 
    // Dùng Set() để tự động xóa trùng lặp (nếu gõ Romaji/Tiếng Anh thì cả 3 cái giống nhau)
    const searchTerms = Array.from(new Set([
      searchRaw,
      toHiragana(searchRaw),
      toKatakana(searchRaw)
    ]))

    // Tạo các lệnh gọi Database song song để tối ưu tốc độ
    const searchPromises = searchTerms.map(term => 
      client.rpc('search_japanese_media', { 
        search_term: term,
        p_limit: 1000, 
        p_offset: 0
      })
    )

    // Đợi tất cả truy vấn hoàn thành
    const results = await Promise.all(searchPromises)
    
    const movieIds: number[] = []
    const seriesIds: number[] = []
    const seenIds = new Set<string>() // Biến này để chống trùng lặp kết quả
    let orderIndex = 0

    // Gộp kết quả của cả 3 bản tìm kiếm lại
    results.forEach(({ data, error }) => {
      if (!error && data) {
        data.forEach((item: any) => {
          const key = `${item.type}-${item.id}`
          
          // Nếu phim này chưa có trong danh sách thì mới thêm vào
          if (!seenIds.has(key)) {
            seenIds.add(key)
            highlightMap[key] = item.highlighted_title
            
            // Từ khóa gốc (vị trí 0) sẽ luôn được ưu tiên đứng trên cùng nhờ logic này
            recommendedOrder[key] = orderIndex++
            
            if (item.type === 'movie') movieIds.push(item.id)
            if (item.type === 'series') seriesIds.push(item.id)
          }
        })
      }
    })

    if (seenIds.size === 0) {
      return { items: [], total: 0, page, pageSize }
    }

    totalSearchResults = seenIds.size

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
  let finalTotal = searchRaw ? totalSearchResults : (count ?? 0)

  if (isCustomRelevanceSort) {
    // Trả lại thứ tự chuẩn cho kết quả tìm kiếm (Ưu tiên từ khóa gốc -> Hiragana -> Katakana)
    items.sort((a, b) => {
      const orderA = recommendedOrder[`${a.type}-${a.id}`] ?? 9999
      const orderB = recommendedOrder[`${b.type}-${b.id}`] ?? 9999
      return orderA - orderB
    })
    
    finalTotal = items.length
    
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