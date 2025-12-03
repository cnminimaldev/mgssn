<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">
            エピソード一覧
          </h1>
          <p class="mt-1 text-xs text-zinc-400">
            シリーズ：{{ seriesTitle || '...' }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2 text-xs">
          <NuxtLink
            :to="`/admin/series/${seriesId}`"
            class="text-zinc-400 hover:text-zinc-200"
          >
            シリーズ編集へ戻る
          </NuxtLink>
          <NuxtLink
            :to="`/admin/series/${seriesId}/episodes/new`"
            class="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400"
          >
            新しいエピソードを追加
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div class="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>登録済みエピソード</span>
          <span v-if="episodes.length">{{ episodes.length }} 件</span>
        </div>

        <div v-if="loading" class="py-8 text-center text-sm text-zinc-400">
          読み込み中…
        </div>

        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-400">
          {{ errorMessage }}
        </div>

        <div v-else>
          <div v-if="!episodes.length" class="py-8 text-center text-sm text-zinc-400">
            エピソードがまだ登録されていません。「新しいエピソードを追加」から登録してください。
          </div>

          <ul v-else class="divide-y divide-white/5 text-sm">
            <li
              v-for="ep in episodes"
              :key="ep.id"
              class="flex items-center justify-between gap-3 py-2.5"
            >
              <div class="flex flex-1 flex-col">
                <div class="flex items-center gap-2">
                  <span class="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-200">
                    第{{ ep.episode_number }}話
                  </span>
                  <span class="truncate text-sm text-zinc-50">
                    {{ ep.title }}
                  </span>
                </div>
                <div class="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                  <span v-if="ep.duration_minutes">
                    {{ ep.duration_minutes }}分
                  </span>
                  <span v-if="ep.release_date">
                    公開日: {{ ep.release_date }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 text-xs">
                <NuxtLink
                  :to="`/admin/series/${seriesId}/episodes/${ep.id}`"
                  class="text-emerald-300 hover:text-emerald-200"
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

type EpisodeRow = {
  id: number
  episode_number: number
  title: string
  duration_minutes: number | null
  release_date: string | null
}

type SeriesRow = {
  id: number
  title: string
}

const route = useRoute()
const supabase = useSupabaseClient<any>()

const seriesId = computed(() => Number(route.params.id))

const seriesTitle = ref('')
const episodes = ref<EpisodeRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // series title
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('id, title')
      .eq('id', seriesId.value)
      .single()

    if (seriesError) {
      errorMessage.value = seriesError.message
      return
    }

    seriesTitle.value = (seriesData as SeriesRow).title

    // episodes
    const { data: episodesData, error: episodesError } = await supabase
      .from('episodes')
      .select('id, episode_number, title, duration_minutes, release_date')
      .eq('series_id', seriesId.value)
      .order('episode_number', { ascending: true })

    if (episodesError) {
      errorMessage.value = episodesError.message
      return
    }

    episodes.value = (episodesData ?? []) as EpisodeRow[]
  } finally {
    loading.value = false
  }
}

await loadData()
</script>
