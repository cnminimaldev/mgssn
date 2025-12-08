import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  // Validate
  if (!body.series_id || !body.episodes || !Array.isArray(body.episodes)) {
    throw createError({ statusCode: 400, statusMessage: 'Dữ liệu không hợp lệ' })
  }

  // Chuẩn bị data insert
  const insertPayload = body.episodes.map((ep: any) => {
    // Logic tạo JSON subtitles
    let subtitles = []
    if (ep.subtitle_path && ep.subtitle_path.trim() !== '') {
      subtitles.push({
        src: ep.subtitle_path,
        label: 'Default', // Bạn có thể sửa label này sau ở trang Edit chi tiết
        lang: 'vi'        // Mặc định là tiếng Việt
      })
    }

    return {
      series_id: body.series_id,
      collection_id: body.collection_id || null,
      episode_number: ep.episode_number,
      title: ep.title,
      video_path: ep.video_path,
      subtitles: subtitles, // Lưu mảng JSON
      duration_minutes: 0,
      season_number: 1
    }
  })

  // Insert
  const { data, error } = await client
    .from('episodes')
    .insert(insertPayload)
    .select()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, count: data.length }
})