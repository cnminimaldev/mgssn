<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">新しいエピソードを追加</h1>
          <p class="mt-1 text-xs text-zinc-400">
            シリーズ：{{ seriesTitle || '...' }}<br />
            コレクション：{{ collectionName || '...' }}
          </p>
        </div>
        <NuxtLink
          :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes`"
          class="text-sm text-zinc-400 hover:text-zinc-200"
        >
          エピソード一覧へ戻る
        </NuxtLink>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
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
          <label class="mb-1 block text-sm">動画パス（HLS .m3u8 / 埋め込みURL）</label>
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
          {{ submitting ? '保存中…' : 'エピソードを作成する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter, useSupabaseClient } from '#imports'

type SeriesRow = { id: number; title: string }
type CollectionRow = { id: number; name: string; series_id: number }

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

const seriesId = computed(() => Number(route.params.id))
const collectionId = computed(() => Number(route.params.collectionId))

const seriesTitle = ref('')
const collectionName = ref('')
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

const loadMeta = async () => {
  // series
  const { data: sData, error: sError } = await supabase
    .from('series')
    .select('id, title')
    .eq('id', seriesId.value)
    .single()

  if (sError) {
    errorMessage.value = sError.message
    return
  }
  seriesTitle.value = (sData as SeriesRow).title

  // collection
  const { data: cData, error: cError } = await supabase
    .from('episode_collections')
    .select('id, name, series_id')
    .eq('id', collectionId.value)
    .single()

  if (cError) {
    errorMessage.value = cError.message
    return
  }
  const col = cData as CollectionRow
  if (col.series_id !== seriesId.value) {
    errorMessage.value = 'シリーズIDが一致しません。'
    return
  }
  collectionName.value = col.name
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      series_id: seriesId.value,
      collection_id: collectionId.value,
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

    const { error } = await supabase.from('episodes').insert(payload)

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value = 'エピソードを作成しました。'
    setTimeout(() => {
      router.push(
        `/admin/series/${seriesId.value}/collections/${collectionId.value}/episodes`,
      )
    }, 800)
  } finally {
    submitting.value = false
  }
}

await loadMeta()
</script>
