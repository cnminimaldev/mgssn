import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event) // Lấy user nếu có
  const body = await readBody(event)
  let { content_id, type } = body

  // Validate cơ bản
  if (!content_id || !type) {
    return { success: false, message: 'Missing content_id or type' }
  }

  // ====================================================================
  // [MỚI] LOGIC TRUY NGƯỢC VIEW TỪ TẬP PHIM LÊN SERIES GỐC
  // ====================================================================
  if (type === 'series' || type === 'episode') {
    // Thử chọc vào bảng episodes xem cái content_id này có phải là ID của tập phim không
    const { data, error: epError } = await client
      .from('episodes')
      .select('series_id')
      .eq('id', content_id)
      .single()
      
    // Ép kiểu sang any để vượt qua lỗi cảnh báo của TypeScript
    const epData = data as any

    // Nếu tìm thấy, nghĩa là user đang xem 1 tập phim -> Đổi content_id thành ID của Series
    if (epData && epData.series_id) {
      content_id = epData.series_id
      type = 'series' // Ép kiểu chuẩn để bảng xếp hạng nhận diện
    }
  }
  // ====================================================================

  // Insert view log với content_id đã được chuẩn hóa (ví dụ: gán chuẩn ID 291)
  const { error } = await client.from('content_views').insert({
    content_id,
    type,
    user_id: user?.id || null // Nếu user chưa login thì null
  })

  if (error) {
    console.error('View log error:', error)
    return { success: false }
  }

  return { success: true }
})