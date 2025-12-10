import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body // ID user cần xóa

  // 1. [FIX] Lấy User từ Token trong Header (Thay vì cookie)
  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) throw createError({ statusCode: 401, message: 'Missing Token' })

  // [FIX] Thêm <any> để tránh lỗi type
  const client = serverSupabaseServiceRole<any>(event)

  // Xác thực token
  const { data: { user }, error: userError } = await client.auth.getUser(token)

  if (userError || !user) throw createError({ statusCode: 401, message: 'Invalid Token' })

  // 2. Check quyền Admin của người thực hiện
  const { data: requesterProfile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (requesterProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // 3. Xóa User khỏi Auth System
  const { error } = await client.auth.admin.deleteUser(id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})