import { serverSupabaseClient } from '#supabase/server'

// Định nghĩa Interface để code sạch hơn và tái sử dụng
interface FeaturedItem {
  id: number
  content_id: number
  type: string
  created_at: string
}

interface ContentDetail {
  id: number
  type: string
  title: string
  thumbnail: string | null
  slug: string
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const method = event.method

  // --- GET: Lấy danh sách ---
  if (method === 'GET') {
    // 1. Lấy danh sách featured (Ép kiểu rõ ràng)
    const { data: featuredList, error } = await client
      .from('featured_contents')
      .select('*')
      .order('created_at', { ascending: false }) as { data: FeaturedItem[] | null; error: any }

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    
    // Nếu không có dữ liệu hoặc null, trả về mảng rỗng ngay
    if (!featuredList || featuredList.length === 0) return []

    // 2. Lấy thông tin chi tiết từ view 'all_contents' (Ép kiểu rõ ràng)
    const { data: details } = await client
      .from('all_contents')
      .select('id, type, title, thumbnail, slug')
      .or(featuredList.map(i => `and(id.eq.${i.content_id},type.eq.${i.type})`).join(',')) as { data: ContentDetail[] | null; error: any }

    // 3. Map dữ liệu
    return featuredList.map((f) => {
      // Tìm detail tương ứng (check null cho details)
      const detail = details?.find((d) => d.id === f.content_id && d.type === f.type)
      
      return {
        ...f, // Spread OK vì f đã được định nghĩa kiểu FeaturedItem
        detail: detail || { title: 'Unknown', thumbnail: null, slug: '' }
      }
    })
  }

  // --- POST: Thêm mới ---
  if (method === 'POST') {
    const body = await readBody(event)
    const { error } = await client.from('featured_contents').insert(body)
    if (error) {
        if (error.code === '23505') return { status: 'exists' }
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return { status: 'success' }
  }

  // --- DELETE: Xóa ---
  if (method === 'DELETE') {
    const body = await readBody(event)
    const { error } = await client.from('featured_contents').delete().eq('id', body.id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { status: 'deleted' }
  }
})