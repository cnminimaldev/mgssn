<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">エピソード一覧</h1>
          <p class="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <span class="bg-zinc-800 px-2 py-0.5 rounded text-xs">シリーズID: {{ seriesId }}</span>
            <span class="text-zinc-600">/</span>
            <span class="bg-zinc-800 px-2 py-0.5 rounded text-xs">コレクションID: {{ collectionId }}</span>
          </p>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/admin/series/${seriesId}/collections`" class="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 text-zinc-300">
            &larr; 戻る
          </NuxtLink>
          
          <button 
            v-if="episodes && episodes.length > 0"
            @click="deleteAllEpisodes"
            class="rounded-md bg-red-900/80 border border-red-700 px-3 py-2 text-sm text-red-100 hover:bg-red-800 transition"
          >
            🗑 全て削除 ({{ episodes.length }})
          </button>

          <NuxtLink :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes/new`" class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">
            + エピソード追加
          </NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="py-12 text-center text-zinc-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
        <p>エピソード一覧を読み込み中...</p>
      </div>
      
      <div v-else>
        <div v-if="!episodes || episodes.length === 0" class="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-500">
          <p class="text-lg mb-2">📭 エピソードがありません</p>
          <p class="text-sm">「エピソード追加」ボタンまたはシリーズ管理ページの一括インポート機能を使用してください。</p>
        </div>

        <div v-else class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
          <table class="w-full text-left text-sm text-zinc-400">
            <thead class="bg-zinc-950 text-zinc-200 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-3 text-center w-16">#</th>
                <th class="px-4 py-3">タイトル</th>
                <th class="px-4 py-3">動画パス (M3U8)</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr v-for="ep in episodes" :key="ep.id" class="hover:bg-zinc-800/50 transition-colors group">
                <td class="px-4 py-3 text-center font-bold text-white bg-zinc-900/50">{{ ep.episode_number }}</td>
                <td class="px-4 py-3 font-medium text-zinc-200">{{ ep.title }}</td>
                <td class="px-4 py-3">
                  <div class="font-mono text-xs text-emerald-500/80 max-w-md truncate bg-black/30 px-2 py-1 rounded select-all" :title="ep.video_path || ''">
                    {{ ep.video_path }}
                  </div>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <NuxtLink 
                      :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes/${ep.id}`" 
                      class="px-2 py-1 rounded hover:bg-indigo-900/30 text-indigo-400 hover:text-indigo-300 transition"
                    >
                      編集
                    </NuxtLink>
                    
                    <button 
                      @click="deleteEpisode(ep.id)"
                      class="px-2 py-1 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition"
                      title="このエピソードを削除"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

// 1. Định nghĩa Type rõ ràng để TS không báo lỗi 'never'
type Episode = {
  id: number
  episode_number: number
  title: string | null
  video_path: string | null
  collection_id: number
}

const route = useRoute()
const supabase = useSupabaseClient()

// 2. Ép kiểu route.params thành string để tránh lỗi (string | string[])
const seriesId = route.params.id as string
const collectionId = route.params.collectionId as string

// 3. Fetch Episodes
// Thêm generic <Episode[]> vào useAsyncData để TS hiểu kiểu dữ liệu trả về
const { data: episodes, pending, refresh } = await useAsyncData<Episode[]>(
  `admin-episodes-${collectionId}`,
  async () => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('collection_id', collectionId)
      .order('episode_number', { ascending: true }) 
    
    if (error) throw error
    
    // Ép kiểu kết quả trả về từ Supabase
    return (data as unknown as Episode[]) || []
  }
)

// 4. Delete Single Episode
const deleteEpisode = async (id: number) => {
  if (!confirm('このエピソードを削除してもよろしいですか？')) return

  try {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    
    refresh()
  } catch (e: any) {
    alert('エラーが発生しました: ' + e.message)
  }
}

// 5. Delete ALL Episodes
const deleteAllEpisodes = async () => {
  // Thêm optional chaining ?.length
  if (!confirm(`警告：このコレクション内の全 ${episodes.value?.length || 0} エピソードを削除しようとしています。\n\nこの操作は取り消せません。本当によろしいですか？`)) return

  try {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('collection_id', collectionId)
    
    if (error) throw error
    
    alert('全てのエピソードを削除しました。')
    refresh()
  } catch (e: any) {
    alert('エラーが発生しました: ' + e.message)
  }
}
</script>