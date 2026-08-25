import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)

  const { data, error } = await supabase
    .from('advertisements')
    .upsert({
      ...(body.id ? { id: body.id } : {}),
      position: body.position,
      code: body.code,
      is_active: body.is_active
    }, { 
      onConflict: 'position' 
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})