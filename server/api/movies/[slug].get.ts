// server/api/movies/[slug].get.ts
import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

// Định nghĩa lại các type helper nếu cần (hoặc import từ utils nếu bạn đã tách ra)
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
  
  // Lấy slug từ params
  const slug = event.context.params?.slug

  // 1. Kiểm tra kỹ: nếu không có slug thì báo lỗi ngay lập tức
  if (!slug || typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid slug',
    })
  }

  // 2. Tìm phim theo slug (lúc này TypeScript đã biết slug là string)
  const { data, error } = await client
    .from('movies')
    .select('*, movie_genres(genre:genres(id, slug, name, name_ja))')
    .eq('slug', slug)
    .limit(1) // Dùng limit(1) thay vì single() để tránh lỗi nếu không tìm thấy, ta sẽ xử lý thủ công bên dưới

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  // Lấy phần tử đầu tiên (nếu có)
  const row = data?.[0]

  // Nếu không tìm thấy phim, trả về null hoặc báo lỗi 404 tùy logic frontend
  // Ở đây ta trả về 404 để frontend biết đường xử lý (ví dụ check history để redirect)
  if (!row) {
    // Frontend sẽ bắt lỗi 404 này để tiếp tục check bảng history
    throw createError({
      statusCode: 404,
      statusMessage: 'Movie not found',
    })
  }

  return mapDbMovieToApi(row)
})