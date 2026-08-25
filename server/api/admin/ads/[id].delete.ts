import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient<Database>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID quảng cáo'
    })
  }

  const { error } = await supabase
    .from('advertisements')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return { success: true }
})