import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event) // Lấy user nếu có
  const body = await readBody(event)
  const { content_id, type } = body

  // Validate cơ bản
  if (!content_id || !type) {
    return { success: false, message: 'Missing content_id or type' }
  }

  // Insert view log
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