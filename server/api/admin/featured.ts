import { serverSupabaseClient } from '#supabase/server'

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
  poster_url: string | null
  banner_url: string | null // [THÊM]: Lấy thêm banner
  slug: string
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const method = event.method

  // --- GET: Lấy danh sách ---
  if (method === 'GET') {
    const { data: featuredList, error } = await client
      .from('featured_contents')
      .select('*')
      .order('created_at', { ascending: false }) as { data: FeaturedItem[] | null; error: any }

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    
    if (!featuredList || featuredList.length === 0) return []

    // [SỬA]: Thêm banner_url vào câu query
    const { data: details } = await client
      .from('all_contents')
      .select('id, type, title, poster_url, banner_url, slug') 
      .or(featuredList.map(i => `and(id.eq.${i.content_id},type.eq.${i.type})`).join(',')) as { data: ContentDetail[] | null; error: any }

    return featuredList.map((f) => {
      const detail = details?.find((d) => d.id === f.content_id && d.type === f.type)
      
      return {
        ...f,
        // [SỬA]: Trả về nguyên object detail để Frontend tự xử lý logic hiển thị ảnh
        detail: detail || { title: 'Unknown', poster_url: null, banner_url: null, slug: '' }
      }
    })
  }

  // --- POST: Thêm mới ---
  if (method === 'POST') {
    const body = await readBody(event)
    // Validate body
    if (!body.content_id || !body.type) {
       throw createError({ statusCode: 400, statusMessage: 'Missing content_id or type' })
    }

    const { error } = await client.from('featured_contents').insert({
        content_id: body.content_id,
        type: body.type
    }) // Chỉ insert các trường cần thiết

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