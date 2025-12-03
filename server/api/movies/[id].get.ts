// server/api/movies/[id].get.ts
import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

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

  const idParam = event.context.params?.id
  const id = Number(idParam)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid movie id',
    })
  }

  const { data, error } = await client
    .from('movies')
    .select('*, movie_genres(genre:genres(id, slug, name, name_ja))')
    .eq('id', id)
    .limit(1)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  const row = data?.[0]

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Movie not found',
    })
  }

  return mapDbMovieToApi(row)
})
