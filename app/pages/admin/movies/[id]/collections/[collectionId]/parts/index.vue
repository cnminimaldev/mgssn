<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">パート一覧</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画：{{ movieTitle || '...' }}<br />
            コレクション：{{ collectionName || '...' }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2 text-xs">
          <NuxtLink
            :to="`/admin/movies/${movieId}/collections`"
            class="text-zinc-400 hover:text-zinc-200"
          >
            コレクション一覧へ戻る
          </NuxtLink>
          <NuxtLink
            :to="`/admin/movies/${movieId}/collections/${collectionId}/parts/new`"
            class="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400"
          >
            新しいパートを追加
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div class="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>登録済みパート</span>
          <span v-if="parts.length">{{ parts.length }} 件</span>
        </div>

        <div v-if="loading" class="py-8 text-center text-sm text-zinc-400">
          読み込み中…
        </div>

        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-400">
          {{ errorMessage }}
        </div>

        <div v-else>
          <div v-if="!parts.length" class="py-8 text-center text-sm text-zinc-400">
            パートがまだ登録されていません。「新しいパートを追加」から登録してください。
          </div>

          <ul v-else class="divide-y divide-white/5 text-sm">
            <li
              v-for="p in parts"
              :key="p.id"
              class="flex items-center justify-between gap-3 py-3"
            >
              <div class="flex flex-1 flex-col gap-1.5">
                <div class="flex items-center gap-2">
                  <span class="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-200 border border-zinc-700">
                    パート {{ p.part_number }}
                  </span>
                  <span class="truncate text-sm text-zinc-50 font-medium">
                    {{ p.title }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <div 
                    class="font-mono text-xs text-emerald-500/80 bg-black/30 px-2 py-0.5 rounded select-all truncate max-w-md border border-white/5" 
                    :title="p.video_path || ''"
                  >
                    {{ p.video_path || 'No Video Source' }}
                  </div>

                  <div v-if="p.subtitles && p.subtitles.length > 0" class="flex gap-1 shrink-0">
                    <span 
                      v-for="(sub, sIdx) in p.subtitles" 
                      :key="sIdx" 
                      class="text-[10px] font-bold bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-900/50 uppercase tracking-wider"
                    >
                      {{ sub.lang || 'sub' }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                  <span v-if="p.duration_minutes" class="flex items-center gap-1">
                    ⏱ {{ p.duration_minutes }}分
                  </span>
                  <span v-if="p.release_date" class="flex items-center gap-1">
                    📅 {{ p.release_date }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 text-xs">
                <NuxtLink
                  :to="`/admin/movies/${movieId}/collections/${collectionId}/parts/${p.id}`"
                  class="rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                >
                  編集
                </NuxtLink>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useSupabaseClient } from '#imports'

type MovieRow = { id: number; title: string }
type CollectionRow = { id: number; name: string; movie_id: number }
type PartRow = {
  id: number
  part_number: number
  title: string
  duration_minutes: number | null
  release_date: string | null
  video_path: string | null // [ADDED]
  subtitles: any[]          // [ADDED]
}

const route = useRoute()
const supabase = useSupabaseClient<any>()

const movieId = computed(() => Number(route.params.id))
const collectionId = computed(() => Number(route.params.collectionId))

const movieTitle = ref('')
const collectionName = ref('')
const parts = ref<PartRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // Movie
    const { data: mData, error: mError } = await supabase
      .from('movies')
      .select('id, title')
      .eq('id', movieId.value)
      .single()

    if (mError) {
      errorMessage.value = mError.message
      return
    }
    movieTitle.value = (mData as MovieRow).title

    // Collection
    const { data: cData, error: cError } = await supabase
      .from('movie_collections')
      .select('id, name, movie_id')
      .eq('id', collectionId.value)
      .single()

    if (cError) {
      errorMessage.value = cError.message
      return
    }
    const col = cData as CollectionRow
    if (col.movie_id !== movieId.value) {
      errorMessage.value = '映画IDが一致しません。'
      return
    }
    collectionName.value = col.name

    // Parts - [UPDATED] Select subtitles & video_path
    const { data: pData, error: pError } = await supabase
      .from('movie_parts')
      .select('id, part_number, title, duration_minutes, release_date, video_path, subtitles')
      .eq('collection_id', collectionId.value)
      .order('part_number', { ascending: true })

    if (pError) {
      errorMessage.value = pError.message
      return
    }

    parts.value = (pData ?? []) as PartRow[]
  } finally {
    loading.value = false
  }
}

await loadData()
</script>