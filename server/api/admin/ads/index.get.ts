import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})