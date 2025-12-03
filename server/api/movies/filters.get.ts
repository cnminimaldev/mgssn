// server/api/movies/filters.get.ts
import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'

type GenreRow = {
  id: number
  slug: string
  name: string | null
  name_ja: string | null
}

type CountryRow = {
  code: string
  name: string
  name_ja: string
  sort_order: number | null
  is_active: boolean | null
}

type MovieRow = {
  origin_country?: string | null
  year?: number | null
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // 1) Genres
  const { data: genreRows, error: genreError } = await client
    .from('genres')
    .select('id, slug, name, name_ja, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name_ja', { ascending: true })

  if (genreError) {
    throw createError({
      statusCode: 500,
      statusMessage: genreError.message,
    })
  }

  const genres =
    (genreRows as GenreRow[] | null | undefined)?.map((g) => ({
      slug: g.slug,
      label: g.name_ja || g.name || g.slug,
    })) ?? []

  // 2) Countries (từ bảng countries)
  const { data: countryRows, error: countryError } = await client
    .from('countries')
    .select('code, name, name_ja, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name_ja', { ascending: true })

  if (countryError) {
    throw createError({
      statusCode: 500,
      statusMessage: countryError.message,
    })
  }

  const countries =
    (countryRows as CountryRow[] | null | undefined)?.map((c) => ({
      code: c.code,
      label: c.name_ja || c.name || c.code,
    })) ?? []

  // 3) Years từ movies
  const { data: movieRows, error: movieError } = await client
    .from('movies')
    .select('year')

  if (movieError) {
    throw createError({
      statusCode: 500,
      statusMessage: movieError.message,
    })
  }

  const yearSet = new Set<number>()
  for (const row of (movieRows ?? []) as MovieRow[]) {
    if (typeof row.year === 'number') {
      yearSet.add(row.year)
    }
  }

  const years = Array.from(yearSet).sort((a, b) => a - b)

  return {
    genres,
    countries,
    years,
  }
})
