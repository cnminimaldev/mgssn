import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Gọi 2 hàm RPC song song để lấy dữ liệu
  const [topSearchesRes, zeroResultsRes, totalRes] = await Promise.all([
    client.rpc('get_top_searches', { limit_count: 50 }),
    client.rpc('get_zero_result_searches', { limit_count: 50 }),
    client.from('search_history').select('*', { count: 'exact', head: true })
  ])

  if (topSearchesRes.error) throw createError({ statusCode: 500, message: topSearchesRes.error.message })

  return {
    topSearches: topSearchesRes.data || [],
    zeroResults: zeroResultsRes.data || [],
    totalSearches: totalRes.count || 0
  }
})