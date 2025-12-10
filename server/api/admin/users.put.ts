// server/api/admin/users.put.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, role } = body
  const client = serverSupabaseServiceRole<any>(event)

  // 1. [FIX] Lấy User từ Token
  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) throw createError({ statusCode: 401, message: 'Missing Token' })

  const { data: { user }, error: userError } = await client.auth.getUser(token)

  if (userError || !user) throw createError({ statusCode: 401, message: 'Invalid Token' })

  // 2. Check quyền Admin
  const { data: requesterProfile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (requesterProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // 3. Update Role (như cũ)
  const { error } = await client
    .from('profiles')
    .update({ role })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})