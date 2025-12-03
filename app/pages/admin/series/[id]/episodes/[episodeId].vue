<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">エピソードを編集</h1>
          <p class="mt-1 text-xs text-zinc-400">
            シリーズ：{{ seriesTitle || '...' }}
          </p>
        </div>
        <NuxtLink
          :to="`/admin/series/${seriesId}/episodes`"
          class="text-sm text-zinc-400 hover:text-zinc-200"
        >
          エピソード一覧へ戻る
        </NuxtLink>
      </div>

      <div v-if="loading" class="py-10 text-center text-sm text-zinc-400">
        読み込み中…
      </div>

      <div v-else-if="loadError" class="py-10 text-center text-sm text-red-400">
        {{ loadError }}
      </div>

      <form
        v-else
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm">エピソード番号</label>
            <input
              v-model.number="form.episode_number"
              type="number"
              min="1"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">シーズン番号 (任意)</label>
            <input
              v-model.number="form.season_number"
              type="number"
              min="1"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm">タイトル</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">タイトル（かな）</label>
          <input
            v-model="form.title_kana"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">説明</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm">上映時間（分）</label>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="1"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">公開日</label>
            <input
              v-model="form.release_date"
              type="date"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm">動画パス（HLS .m3u8）</label>
          <input
            v-model="form.video_path"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">サムネイルURL</label>
          <input
            v-model="form.thumbnail_url"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-sm text-emerald-400">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="mt-2 inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? '保存中…' : 'エピソードを更新する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter, useSupabaseClient } from '#imports'

type SeriesRow = {
  id: number
  title: string
}

type EpisodeRowFull = {
  id: number
  series_id: number
  episode_number: number
  season_number: number | null
  title: string
  title_kana: string | null
  description: string | null
  duration_minutes: number | null
  release_date: string | null
  video_path: string | null
  thumbnail_url: string | null
}

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

const seriesId = computed(() => Number(route.params.id))
const episodeId = computed(() => Number(route.params.episodeId))

const seriesTitle = ref('')
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  episode_number: 1 as number,
  season_number: undefined as number | undefined,
  title: '',
  title_kana: '',
  description: '',
  duration_minutes: undefined as number | undefined,
  release_date: '' as string,
  video_path: '',
  thumbnail_url: '',
})

const loadData = async () => {
  loading.value = true
  loadError.value = ''

  try {
    // Series title
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('id, title')
      .eq('id', seriesId.value)
      .single()

    if (seriesError) {
      loadError.value = seriesError.message
      return
    }

    seriesTitle.value = (seriesData as SeriesRow).title

    // Episode
    const { data: epData, error: epError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId.value)
      .single()

    if (epError) {
      loadError.value = epError.message
      return
    }

    const ep = epData as EpisodeRowFull

    if (ep.series_id !== seriesId.value) {
      loadError.value = 'シリーズIDが一致しません。'
      return
    }

    form.episode_number = ep.episode_number
    form.season_number = ep.season_number ?? undefined
    form.title = ep.title
    form.title_kana = ep.title_kana ?? ''
    form.description = ep.description ?? ''
    form.duration_minutes = ep.duration_minutes ?? undefined
    form.release_date = ep.release_date ?? ''
    form.video_path = ep.video_path ?? ''
    form.thumbnail_url = ep.thumbnail_url ?? ''
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      episode_number: form.episode_number,
      season_number: form.season_number ?? null,
      title: form.title,
      title_kana: form.title_kana || null,
      description: form.description || null,
      duration_minutes: form.duration_minutes ?? null,
      release_date: form.release_date || null,
      video_path: form.video_path || null,
      thumbnail_url: form.thumbnail_url || null,
    }

    const { error } = await supabase
      .from('episodes')
      .update(payload)
      .eq('id', episodeId.value)

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value = 'エピソードを更新しました。'
    setTimeout(() => {
      router.push(`/admin/series/${seriesId.value}/episodes`)
    }, 800)
  } finally {
    submitting.value = false
  }
}

await loadData()
</script>
