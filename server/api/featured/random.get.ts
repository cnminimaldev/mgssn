// server/api/featured/random.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // 1. Lấy danh sách ID từ bảng featured_contents
  const { data: featuredRefs, error: refError } = await client
    .from('featured_contents')
    .select('content_id, type')

  if (refError || !featuredRefs || featuredRefs.length === 0) {
    return []
  }

  // 2. Query chi tiết từ view 'all_contents' dựa trên ID và Type
  // [FIX] Thêm "as any[]" để TypeScript hiểu đây là mảng và không báo lỗi content_id
  const orConditions = (featuredRefs as any[])
    .map(ref => `and(id.eq.${ref.content_id},type.eq.${ref.type})`)
    .join(',')

  const { data: contents, error: contentError } = await client
    .from('all_contents')
    .select('*')
    .or(orConditions)

  if (contentError) return []

  // 3. Map dữ liệu chuẩn format
  const items = (contents || []).map((row: any) => {
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const posterUrl = getResizedUrl(row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.png'
    const bannerUrl = getResizedUrl(row.banner_url, 1920, 1080, 'contain') || ''

    return {
      id: row.id,
      type: row.type,
      slug: row.slug ?? String(row.id),
      title: row.title,
      originalTitle: row.original_title,
      titleKana: row.title_kana,
      
      year: row.year,
      country: row.origin_country,
      description: row.description,
      genre: row.genre_label || 'その他',
      
      thumbnail,
      posterUrl,
      bannerUrl,
      episodeCount: row.episode_count || 0,
      createdAt: row.created_at
    }
  })

  // 4. Xáo trộn danh sách (Fisher-Yates Shuffle)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items
})