// server/api/movies/index.get.ts
import { serverSupabaseClient } from '#supabase/server'
import { getQuery, createError } from 'h3'

function toHiragana(input: string) {
  return input.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  )
}

type GenreItem = {
  id: number
  slug: string
  name: string | null
  name_ja: string | null
}

function mapDbMovieToApi(row: any) {
  if (!row) return null

  const genreItems: GenreItem[] =
    (row.movie_genres ?? [])
      .map((mg: any) => {
        const g = mg.genre
        if (!g) return null
        return {
          id: g.id,
          slug: g.slug,
          name: g.name ?? null,
          name_ja: g.name_ja ?? null,
        }
      })
      .filter(Boolean) ?? []

  const primaryGenre =
    genreItems.length > 0
      ? genreItems[0].name_ja || genreItems[0].name || genreItems[0].slug
      : null

  return {
    ...row,
    id: row.id,
    title: row.title ?? '',
    originalTitle: row.original_title ?? null,
    titleKana: row.title_kana ?? null,

    year: row.year ?? 0,
    country: row.origin_country ?? row.country ?? '日本',
    description: row.description ?? '',

    thumbnail: row.poster_url ?? '/images/fallback-poster.png',
    videoUrl: row.video_path ?? '/videos/demo.mp4',
    genre: primaryGenre ?? 'その他',
    genres: genreItems.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      nameJa: g.name_ja,
    })),

    type: (row.type === 'series' ? 'series' : 'movie') as 'movie' | 'series',
    slug: row.slug ?? String(row.id),

    releaseDate: row.release_date ?? null,
    director: row.director ?? null,
    mainCast: row.main_cast ?? null,

    previousSlugs: row.previousSlugs ?? [],
    episodes: row.episodes ?? [],
  }
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

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
  const sortKey =
    sortParam === 'year_desc' ||
    sortParam === 'year_asc' ||
    sortParam === 'title_asc'
      ? sortParam
      : 'recommended'

  const pageParam = typeof query.page === 'string' ? Number(query.page) : 1
  const pageSizeParam =
    typeof query.pageSize === 'string' ? Number(query.pageSize) : 24

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize =
    Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100
      ? pageSizeParam
      : 24

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let genreMovieIds: number[] | null = null

  if (genreSlugs.length > 0) {
    const { data: genreRows, error: genreError } = await client
      .from('genres')
      .select('id, slug')
      .in('slug', genreSlugs)

    if (genreError) {
      throw createError({
        statusCode: 500,
        statusMessage: genreError.message,
      })
    }

    const genreIds =
      (genreRows ?? [])
        .map((g: any) => g.id as number | null)
        .filter((id): id is number => id != null) ?? []

    if (genreIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      }
    }

    const { data: mgRows, error: mgError } = await client
      .from('movie_genres')
      .select('movie_id')
      .in('genre_id', genreIds)

    if (mgError) {
      throw createError({
        statusCode: 500,
        statusMessage: mgError.message,
      })
    }

    const idSet = new Set<number>()
    for (const row of mgRows ?? []) {
      const id = (row as any).movie_id as number | null
      if (id != null) idSet.add(id)
    }

    genreMovieIds = Array.from(idSet)

    if (genreMovieIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      }
    }
  }

  let builder = client
    .from('movies')
    .select('*, movie_genres(genre:genres(id, slug, name, name_ja))', {
      count: 'exact',
    })

  if (genreMovieIds && genreMovieIds.length > 0) {
    builder = builder.in('id', genreMovieIds)
  }

  if (search) {
    const kanaSearch = toHiragana(search)
    builder = builder.or(
      [
        `title.ilike.%${search}%`,
        `title_kana.ilike.%${kanaSearch}%`,
        `original_title.ilike.%${search}%`,
      ].join(','),
    )
  }

  if (countries.length > 0) {
    builder = builder.in('origin_country', countries)
  }

  if (!Number.isNaN(yearNum)) {
    builder = builder.eq('year', yearNum)
  }

  switch (sortKey) {
    case 'year_desc':
      builder = builder.order('year', { ascending: false })
      break
    case 'year_asc':
      builder = builder.order('year', { ascending: true })
      break
    case 'title_asc':
      builder = builder.order('title', { ascending: true })
      break
    case 'recommended':
    default:
      builder = builder.order('created_at', { ascending: false })
      break
  }

  const { data, count, error } = await builder.range(from, to)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  const rows = data ?? []
  const items = rows.map((row) => mapDbMovieToApi(row))

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
  }
})
