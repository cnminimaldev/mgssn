import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

// Helper Types
type GenreItem = {
  id: number
  slug: string
  name: string | null
  name_ja: string | null
}

// Mapper Function
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
    country: row.origin_country ?? row.country ?? 'JP',
    description: row.description ?? '',

    thumbnail: row.poster_url ?? '/images/fallback-poster.png',
    posterUrl: row.poster_url ?? null, // Thêm trường này cho form admin
    bannerUrl: row.banner_url ?? null, // Thêm trường này cho form admin
    videoUrl: row.video_path ?? '',
    
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
    durationMinutes: row.duration_minutes ?? 0, // Mapping cho admin form

    previousSlugs: row.previousSlugs ?? [],
    episodes: row.episodes ?? [],
  }
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  // Lấy param (có thể là slug text hoặc ID số)
  const slugOrId = event.context.params?.slug

  if (!slugOrId || typeof slugOrId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid parameter',
    })
  }

  let query = client
    .from('movies')
    .select('*, movie_genres(genre:genres(id, slug, name, name_ja))')

  // [SỬA ĐỔI QUAN TRỌNG]
  // Kiểm tra nếu chuỗi là số -> Tìm theo ID hoặc Slug
  // Nếu là chữ -> Chỉ tìm theo Slug
  if (/^\d+$/.test(slugOrId)) {
    // Dùng .or() để tìm: (id = 2 OR slug = "2")
    query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
  } else {
    query = query.eq('slug', slugOrId)
  }

  const { data, error } = await query.limit(1)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  const row = data?.[0]

  if (!row) {
    // Nếu không tìm thấy bằng query chính, Frontend có thể xử lý tiếp (ví dụ check bảng history)
    throw createError({
      statusCode: 404,
      statusMessage: 'Movie not found',
    })
  }

  return mapDbMovieToApi(row)
})