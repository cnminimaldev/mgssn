<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">新しいパートを追加</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画：{{ movieTitle || '...' }}<br />
            コレクション：{{ collectionName || '...' }}
          </p>
        </div>
        <NuxtLink
          :to="`/admin/movies/${movieId}/collections/${collectionId}/parts`"
          class="text-sm text-zinc-400 hover:text-zinc-200"
        >
          パート一覧へ戻る
        </NuxtLink>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm">パート番号</label>
            <input
              v-model.number="form.part_number"
              type="number"
              min="1"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              required
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
          {{ submitting ? '保存中…' : 'パートを作成する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter, useSupabaseClient } from '#imports'

type MovieRow = { id: number; title: string }
type CollectionRow = { id: number; name: string; movie_id: number }

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

const movieId = computed(() => Number(route.params.id))
const collectionId = computed(() => Number(route.params.collectionId))

const movieTitle = ref('')
const collectionName = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  part_number: 1 as number,
  title: '',
  title_kana: '',
  description: '',
  duration_minutes: undefined as number | undefined,
  release_date: '' as string,
  video_path: '',
  thumbnail_url: '',
})

const loadMeta = async () => {
  // movie
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

  // collection
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
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      movie_id: movieId.value,
      collection_id: collectionId.value,
      part_number: form.part_number,
      title: form.title,
      title_kana: form.title_kana || null,
      description: form.description || null,
      duration_minutes: form.duration_minutes ?? null,
      release_date: form.release_date || null,
      video_path: form.video_path || null,
      thumbnail_url: form.thumbnail_url || null,
    }

    const { error } = await supabase.from('movie_parts').insert(payload)

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value = 'パートを作成しました。'
    setTimeout(() => {
      router.push(
        `/admin/movies/${movieId.value}/collections/${collectionId.value}/parts`,
      )
    }, 800)
  } finally {
    submitting.value = false
  }
}

await loadMeta()
</script>
