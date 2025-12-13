import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // 1. Lấy tất cả ID từ bảng featured
  // [SỬA LỖI] Ép kiểu kết quả trả về để TypeScript không báo lỗi thiếu Type
  const { data: allFeatured, error } = await client
    .from('featured_contents')
    .select('content_id, type') as { data: { content_id: number; type: string }[] | null; error: any }
  
  if (error || !allFeatured || allFeatured.length === 0) {
    return { items: [] }
  }

  // 2. Thuật toán Random: Shuffle mảng và lấy 12 item đầu tiên
  const shuffled = allFeatured.sort(() => 0.5 - Math.random()).slice(0, 12)

  // 3. Lấy chi tiết thông tin phim từ view 'all_contents'
  const { data: details } = await client
    .from('all_contents')
    .select('id, type, title, slug, thumbnail, poster_url, year, genre, view_count')
    .or(
      // Bây giờ 'item' đã được hiểu đúng kiểu, lỗi sẽ biến mất
      shuffled.map(item => `and(id.eq.${item.content_id},type.eq.${item.type})`).join(',')
    )

  return { items: details || [] }
})