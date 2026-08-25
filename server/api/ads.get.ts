import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

export default defineCachedEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { data, error } = await supabase
    .from('advertisements')
    .select('position, code')
    .eq('is_active', true)

  if (error) {
    console.error('Lỗi khi fetch quảng cáo:', error)
    return []
  }

  return data || []
}, {
  maxAge: 60 * 5, // Cache 5 phút (300 giây)
  name: 'public-advertisements',
  getKey: () => 'all-active-ads'
})