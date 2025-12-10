// server/api/admin/users.get.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<any>(event)

  // 1. [FIX] Lấy User thủ công từ Header Authorization
  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Missing Authorization Header' })
  }

  // Xác thực token và lấy User ID
  const { data: { user }, error: userError } = await client.auth.getUser(token)

  if (userError || !user) {
    throw createError({ statusCode: 401, message: 'Invalid User Token' })
  }

  // 2. Check quyền Admin (như cũ, nhưng dùng user.id vừa lấy được)
  const { data: requesterProfile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (requesterProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // 3. Logic lấy danh sách User (như cũ)
  const { data: authUsers, error: authError } = await client.auth.admin.listUsers()
  if (authError) throw createError({ statusCode: 500, message: authError.message })

  const { data: profiles, error: profileError } = await client
    .from('profiles')
    .select('id, role, created_at')
  if (profileError) throw createError({ statusCode: 500, message: profileError.message })

  const mergedUsers = authUsers.users.map((u: any) => {
    const profile = profiles?.find((p: any) => p.id === u.id)
    return {
      id: u.id,
      email: u.email,
      role: profile?.role || 'user',
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at
    }
  })

  return mergedUsers.sort((a: any, b: any) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})