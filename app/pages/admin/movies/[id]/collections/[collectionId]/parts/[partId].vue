<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">パートを編集 (Edit Part)</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画：{{ movieTitle || '...' }}<br />
            コレクション：{{ collectionName || '...' }}
          </p>
        </div>
        <NuxtLink
          :to="`/admin/movies/${movieId}/collections/${collectionId}/parts`"
          class="text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded px-3 py-2 transition"
        >
          &larr; パート一覧へ戻る
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
        class="space-y-8"
        @submit.prevent="handleSubmit"
      >
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 class="text-lg font-semibold text-emerald-400 border-b border-zinc-800 pb-2 mb-4">基本情報 (Basic Info)</h2>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-zinc-400">パート番号 (Part No.)</label>
              <input
                v-model.number="form.part_number"
                type="number"
                min="1"
                class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none text-center font-bold"
                required
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-zinc-400">上映時間 (分)</label>
              <input
                v-model.number="form.duration_minutes"
                type="number"
                min="1"
                class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">タイトル (Title)</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">タイトル（かな）</label>
            <input
              v-model="form.title_kana"
              type="text"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">説明 (Description)</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">公開日 (Release Date)</label>
            <input
              v-model="form.release_date"
              type="date"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">動画パス (HLS .m3u8)</label>
            <input
              v-model="form.video_path"
              type="text"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-zinc-400">サムネイルURL</label>
            <input
              v-model="form.thumbnail_url"
              type="text"
              class="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 focus:border-emerald-500 outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
            <h2 class="text-lg font-semibold text-yellow-400">字幕管理 (Subtitles)</h2>
            <button type="button" @click="addSubtitle" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded transition">
              + 追加
            </button>
          </div>

          <div v-if="form.subtitles.length === 0" class="text-center text-zinc-600 text-sm py-4 italic">
            字幕は登録されていません。
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(sub, index) in form.subtitles" 
              :key="index"
              class="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-black/40 p-3 rounded border border-zinc-800"
            >
              <div class="w-full sm:w-32">
                <input 
                  v-model="sub.label" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                  placeholder="Label (Ex: 日本語)"
                />
              </div>

              <div class="w-full sm:w-20">
                <input 
                  v-model="sub.lang" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-center text-zinc-300 focus:border-yellow-500 outline-none"
                  placeholder="Lang (ja)"
                />
              </div>

              <div class="flex-1 w-full">
                <input 
                  v-model="sub.src" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono text-zinc-300 focus:border-yellow-500 outline-none"
                  placeholder="https://.../sub.vtt"
                />
              </div>

              <button 
                type="button" 
                @click="removeSubtitle(index)"
                class="text-zinc-500 hover:text-red-400 p-1 transition"
                title="削除"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="text-sm text-red-400 p-4 bg-red-900/10 border border-red-800 rounded">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-sm text-emerald-400 p-4 bg-emerald-900/10 border border-emerald-800 rounded">
          {{ successMessage }}
        </div>

        <div class="flex justify-end pt-4">
          <button
            type="submit"
            :disabled="submitting"
            class="rounded-md bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-emerald-900/20 transition transform active:scale-95"
          >
            <span v-if="submitting" class="animate-spin mr-2">⏳</span>
            {{ submitting ? '保存中...' : '変更を保存 (Save Changes)' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter, useSupabaseClient } from '#imports'

// Types
type MovieRow = { id: number; title: string }
type CollectionRow = { id: number; name: string; movie_id: number }
type SubtitleItem = { src: string; label: string; lang: string }

type PartRowFull = {
  id: number
  movie_id: number
  collection_id: number
  part_number: number
  title: string
  title_kana: string | null
  description: string | null
  duration_minutes: number | null
  release_date: string | null
  video_path: string | null
  thumbnail_url: string | null
  subtitles: SubtitleItem[] | null // JSONB column
}

const route = useRoute()
const router = useRouter()
// Use <any> to allow JSONB updates without strict type errors
const supabase = useSupabaseClient<any>()

const movieId = computed(() => Number(route.params.id))
const collectionId = computed(() => Number(route.params.collectionId))
const partId = computed(() => Number(route.params.partId))

const movieTitle = ref('')
const collectionName = ref('')
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form State
const form = reactive({
  part_number: 1 as number,
  title: '',
  title_kana: '',
  description: '',
  duration_minutes: undefined as number | undefined,
  release_date: '' as string,
  video_path: '',
  thumbnail_url: '',
  subtitles: [] as SubtitleItem[] // Subtitles array
})

const loadData = async () => {
  loading.value = true
  loadError.value = ''

  try {
    // 1. Get Movie Title
    const { data: mData, error: mError } = await supabase
      .from('movies')
      .select('id, title')
      .eq('id', movieId.value)
      .single()

    if (mError) {
      loadError.value = mError.message
      return
    }
    movieTitle.value = (mData as MovieRow).title

    // 2. Get Collection Name
    const { data: cData, error: cError } = await supabase
      .from('movie_collections')
      .select('id, name, movie_id')
      .eq('id', collectionId.value)
      .single()

    if (cError) {
      loadError.value = cError.message
      return
    }
    const col = cData as CollectionRow
    if (col.movie_id !== movieId.value) {
      loadError.value = '映画IDが一致しません。'
      return
    }
    collectionName.value = col.name

    // 3. Get Part Data
    const { data: pData, error: pError } = await supabase
      .from('movie_parts')
      .select('*')
      .eq('id', partId.value)
      .single()

    if (pError) {
      loadError.value = pError.message
      return
    }

    const part = pData as PartRowFull
    if (part.movie_id !== movieId.value || part.collection_id !== collectionId.value) {
      loadError.value = '映画IDまたはコレクションIDが一致しません。'
      return
    }

    // Populate Form
    form.part_number = part.part_number
    form.title = part.title
    form.title_kana = part.title_kana ?? ''
    form.description = part.description ?? ''
    form.duration_minutes = part.duration_minutes ?? undefined
    form.release_date = part.release_date ?? ''
    form.video_path = part.video_path ?? ''
    form.thumbnail_url = part.thumbnail_url ?? ''
    // Handle Subtitles (ensure array)
    form.subtitles = Array.isArray(part.subtitles) ? part.subtitles : []

  } finally {
    loading.value = false
  }
}

// Subtitle Actions
const addSubtitle = () => {
  form.subtitles.push({
    src: '',
    label: '日本語',
    lang: 'ja'
  })
}

const removeSubtitle = (index: number) => {
  form.subtitles.splice(index, 1)
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Filter empty subtitles
    const validSubtitles = form.subtitles.filter(sub => sub.src && sub.src.trim() !== '')

    const payload = {
      part_number: form.part_number,
      title: form.title,
      title_kana: form.title_kana || null,
      description: form.description || null,
      duration_minutes: form.duration_minutes ?? null,
      release_date: form.release_date || null,
      video_path: form.video_path || null,
      thumbnail_url: form.thumbnail_url || null,
      subtitles: validSubtitles // Save JSON array
    }

    const { error } = await supabase
      .from('movie_parts')
      .update(payload)
      .eq('id', partId.value)

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value = 'パートを更新しました。'
    // Optional: Redirect back after delay
    setTimeout(() => {
      router.push(
        `/admin/movies/${movieId.value}/collections/${collectionId.value}/parts`,
      )
    }, 800)
  } finally {
    submitting.value = false
  }
}

await loadData()
</script>