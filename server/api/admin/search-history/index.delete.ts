import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Xóa toàn bộ dữ liệu (bằng cách filter ID >= 0)
  const { error } = await client.from('search_history').delete().gte('id', 0)
  
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})