import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

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
  thumbnail: string   // 450x450 (contain) từ Banner - Dùng cho Grid/Search
  posterUrl: string   // 450x450 (contain) từ Poster - Dùng cho My List
  bannerUrl: string   // 1920x1080 (contain) từ Banner - Dùng cho Hero
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

  const genresParam = typeof query.genres === 'string' ? query.genres : ''
  const genreSlugs = genresParam
    ? genresParam.split(',').map((x) => x.trim()).filter(Boolean)
    : []

  const countriesParam =
    typeof query.countries === 'string' ? query.countries : ''
  const countries = countriesParam
    ? countriesParam.split(',').map((x) => x.trim()).filter(Boolean)
    : []

  const yearParam = typeof query.year === 'string' ? query.year : ''
  const yearNum = yearParam ? Number(yearParam) : NaN

  const sortParam = typeof query.sort === 'string' ? query.sort : 'recommended'
  
  const pageParam = typeof query.page === 'string' ? Number(query.page) : 1
  const pageSizeParam =
    typeof query.pageSize === 'string' ? Number(query.pageSize) : 24

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize =
    Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100
      ? pageSizeParam
      : 24

  // --- 2. Genre Filter ---
  let validMovieIds: number[] | null = null
  let validSeriesIds: number[] | null = null

  if (genreSlugs.length > 0) {
    const { data: genreRows } = await client
      .from('genres')
      .select('id, slug')
      .in('slug', genreSlugs)

    // Cast any[] để tránh lỗi typescript 'never'
    const genreIds = ((genreRows as any[]) ?? []).map((g) => g.id)

    if (genreIds.length === 0) {
      return { items: [], total: 0, page, pageSize }
    }

    const { data: mGenres } = await client
      .from('movie_genres')
      .select('movie_id')
      .in('genre_id', genreIds)
    
    validMovieIds = Array.from(new Set(((mGenres as any[]) ?? []).map((x) => x.movie_id)))

    const { data: sGenres } = await client
      .from('series_genres')
      .select('series_id')
      .in('genre_id', genreIds)

    validSeriesIds = Array.from(new Set(((sGenres as any[]) ?? []).map((x) => x.series_id)))

    if (validMovieIds.length === 0 && validSeriesIds.length === 0) {
      return { items: [], total: 0, page, pageSize }
    }
  }

  // --- 3. Movies Query ---
  let movieBuilder = client
    .from('movies')
    .select('*, movie_genres(genre:genres(name, name_ja, slug))')

  if (validMovieIds !== null) {
    movieBuilder = movieBuilder.in('id', validMovieIds)
  }
  if (search) {
    const kana = toHiragana(search)
    movieBuilder = movieBuilder.or(
      `title.ilike.%${search}%,title_kana.ilike.%${kana}%,original_title.ilike.%${search}%`
    )
  }
  if (countries.length > 0) {
    movieBuilder = movieBuilder.in('origin_country', countries)
  }
  if (!Number.isNaN(yearNum)) {
    movieBuilder = movieBuilder.eq('year', yearNum)
  }

  // --- 4. Series Query ---
  let seriesBuilder = client
    .from('series')
    .select('*, series_genres(genre:genres(name, name_ja, slug)), episodes(id)')

  if (validSeriesIds !== null) {
    seriesBuilder = seriesBuilder.in('id', validSeriesIds)
  }
  if (search) {
    const kana = toHiragana(search)
    seriesBuilder = seriesBuilder.or(
      `title.ilike.%${search}%,title_kana.ilike.%${kana}%,original_title.ilike.%${search}%`
    )
  }
  if (countries.length > 0) {
    seriesBuilder = seriesBuilder.in('origin_country', countries)
  }
  if (!Number.isNaN(yearNum)) {
    seriesBuilder = seriesBuilder.eq('year', yearNum)
  }

  const [movieRes, seriesRes] = await Promise.all([
    movieBuilder,
    seriesBuilder
  ])

  if (movieRes.error) throw createError({ statusCode: 500, statusMessage: movieRes.error.message })
  if (seriesRes.error) throw createError({ statusCode: 500, statusMessage: seriesRes.error.message })

  // --- 5. Mapping ---
  const moviesMapped: ApiMediaItem[] = (movieRes.data ?? []).map((row: any) => {
    const g = row.movie_genres?.[0]?.genre
    const genreLabel = g ? (g.name_ja || g.name || g.slug) : 'その他'

    // Logic Resize ảnh:
    // Thumbnail (List): Banner 450x450 contain
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    
    // PosterUrl (MyList): Poster 450x450 contain
    const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'

    // BannerUrl (Hero): Banner 1920x1080 contain
    const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''

    return {
      id: row.id,
      type: 'movie',
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
      genre: genreLabel,
      createdAt: row.created_at
    }
  })

  const seriesMapped: ApiMediaItem[] = (seriesRes.data ?? []).map((row: any) => {
    const g = row.series_genres?.[0]?.genre
    const genreLabel = g ? (g.name_ja || g.name || g.slug) : 'その他'
    const epCount = Array.isArray(row.episodes) ? row.episodes.length : 0

    // Logic Resize ảnh tương tự
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''

    return {
      id: row.id,
      type: 'series',
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
      genre: genreLabel,
      episodeCount: epCount,
      createdAt: row.created_at
    }
  })

  // --- 6. Merge & Sort ---
  let combined = [...moviesMapped, ...seriesMapped]

  combined.sort((a, b) => {
    if (sortParam === 'year_desc') return b.year - a.year
    if (sortParam === 'year_asc') return a.year - b.year
    if (sortParam === 'title_asc') return a.title.localeCompare(b.title, 'ja')
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // --- 7. Pagination ---
  const total = combined.length
  const from = (page - 1) * pageSize
  const to = from + pageSize
  const pagedItems = combined.slice(from, to)

  return {
    items: pagedItems,
    total,
    page,
    pageSize,
  }
})