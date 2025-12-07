<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">映画を編集</h1>
          <p class="mt-1 text-xs text-zinc-400">
            作品情報やジャンル、製作国などを編集します。
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
            @click="showSmartPaste = true"
          >
            <span>⚡ スマートペースト</span>
          </button>

          <NuxtLink to="/admin" class="text-sm text-zinc-400 hover:text-zinc-200">
            管理トップへ戻る
          </NuxtLink>
        </div>
      </div>

      <SmartPasteModal
        :show="showSmartPaste"
        @close="showSmartPaste = false"
        @apply="onSmartPaste"
      />

      <div v-if="loading" class="py-10 text-center text-sm text-zinc-400">
        読み込み中…
      </div>

      <div v-else-if="loadError" class="py-10 text-center text-sm text-red-400">
        {{ loadError }}
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm">タイトル（日本向け）</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">原題</label>
          <input
            v-model="form.original_title"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: Frozen"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">タイトル（かな）</label>
          <input
            v-model="form.title_kana"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: あなとゆきのじょおう"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: frozen"
            required
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

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1 block text-sm">年</label>
            <input
              v-model.number="form.year"
              type="number"
              min="1900"
              max="2100"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
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
          <label class="mb-1 block text-sm">製作国</label>
          <div v-if="countryOptions.length">
            <select
              v-model="form.origin_country"
              class="w-40 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">選択してください</option>
              <option v-for="c in countryOptions" :key="c.code" :value="c.code">
                {{ c.name_ja }} ({{ c.code }})
              </option>
            </select>
          </div>
          <p class="mt-1 text-xs text-zinc-500">
            ISO 2文字コード（例: JP / US / KR）。国・地域は「国・地域管理」から追加してください。
          </p>
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="block text-sm">ジャンル（複数選択可）</label>
            <button
              v-if="genreOptions.length"
              type="button"
              class="text-xs text-emerald-300 hover:text-emerald-200"
              @click="selectedGenreIds = []"
            >
              クリア
            </button>
          </div>
          <div v-if="genreOptions.length" class="flex flex-wrap gap-2">
            <button
              v-for="g in genreOptions"
              :key="g.id"
              type="button"
              class="rounded-full border px-3 py-1 text-xs transition"
              :class="
                selectedGenreIds.includes(g.id)
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
              "
              @click="toggleGenre(g.id)"
            >
              {{ g.name_ja || g.name || g.slug }}
            </button>
          </div>
          <p v-else class="mt-1 text-xs text-zinc-500">
            ジャンルがまだ登録されていません。
          </p>
        </div>

        <div>
          <label class="mb-1 block text-sm">監督</label>
          <input
            v-model="form.director"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">主演</label>
          <input
            v-model="form.main_cast"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">動画パス（HLS .m3u8）</label>
          <input
            v-model="form.video_path"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormImageUpload
            label="ポスター画像"
            v-model="form.poster_url"
            folder="movies"
            ratio="poster"
          />
          <FormImageUpload
            label="バナー画像"
            v-model="form.banner_url"
            folder="movies"
            ratio="banner"
          />
        </div>

        <div>
          <label class="inline-flex items-center gap-2 text-sm">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="rounded border-zinc-600 bg-zinc-900"
            />
            注目作品（featured）
          </label>
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
          {{ submitting ? '保存中…' : '更新する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter, useSupabaseClient, useAsyncData } from '#imports'
import SmartPasteModal from '~/components/SmartPasteModal.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

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

const movieId = computed(() => Number(route.params.id))

const loading = ref(true)
const loadError = ref('')

// --- genres ---
const { data: genresData } = await useAsyncData<GenreRow[]>(
  'admin-genres-edit',
  async () => {
    const { data, error } = await supabase
      .from('genres')
      .select('id, slug, name, name_ja')
      .order('name_ja', { ascending: true })

    if (error) throw error
    return data ?? []
  }
)

const genreOptions = computed<GenreRow[]>(() => genresData.value ?? [])
const selectedGenreIds = ref<number[]>([])

const toggleGenre = (id: number) => {
  const idx = selectedGenreIds.value.indexOf(id)
  if (idx === -1) {
    selectedGenreIds.value.push(id)
  } else {
    selectedGenreIds.value.splice(idx, 1)
  }
}

// --- countries ---
const { data: countriesData } = await useAsyncData<CountryRow[]>(
  'admin-countries-edit',
  async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('code, name, name_ja, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name_ja', { ascending: true })

    if (error) throw error
    return data ?? []
  }
)

const countryOptions = computed<CountryRow[]>(() => countriesData.value ?? [])

// --- form ---
const form = reactive({
  title: '',
  original_title: '',
  title_kana: '',
  slug: '',
  description: '',
  year: undefined as number | undefined,
  duration_minutes: undefined as number | undefined,
  release_date: '' as string,
  origin_country: '',
  director: '',
  main_cast: '',
  video_path: '',
  poster_url: '',
  banner_url: '',
  is_featured: false,
})

const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// --- Smart Paste Logic ---
const showSmartPaste = ref(false)

const onSmartPaste = (data: any) => {
  if (data.title) form.title = data.title
  if (data.original_title) form.original_title = data.original_title
  if (data.title_kana) form.title_kana = data.title_kana
  if (data.slug) form.slug = data.slug
  if (data.description) form.description = data.description
  if (data.year) form.year = data.year
  if (data.duration_minutes) form.duration_minutes = data.duration_minutes
  if (data.release_date) form.release_date = data.release_date
  if (data.origin_country) {
    const exists = countryOptions.value.some(c => c.code === data.origin_country)
    if (exists) form.origin_country = data.origin_country
  }
  if (data.director) form.director = data.director
  if (data.main_cast) form.main_cast = data.main_cast
}

// load movie detail
const loadMovie = async () => {
  loading.value = true
  loadError.value = ''
  try {
    if (!movieId.value || Number.isNaN(movieId.value)) {
      loadError.value = '無効なIDです。'
      return
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*, movie_genres(genre_id)')
      .eq('id', movieId.value)
      .single()

    if (error) {
      loadError.value = error.message
      return
    }

    form.title = data.title ?? ''
    form.original_title = data.original_title ?? ''
    form.title_kana = data.title_kana ?? ''
    form.slug = data.slug ?? ''
    form.description = data.description ?? ''
    form.year = data.year ?? undefined
    form.duration_minutes = data.duration_minutes ?? undefined
    form.release_date = data.release_date ?? ''
    form.origin_country = data.origin_country ?? ''
    form.director = data.director ?? ''
    form.main_cast = data.main_cast ?? ''
    form.video_path = data.video_path ?? ''
    form.poster_url = data.poster_url ?? ''
    form.banner_url = data.banner_url ?? ''
    form.is_featured = data.is_featured ?? false

    const genreIds =
      (data.movie_genres ?? []).map((mg: any) => mg.genre_id as number) ?? []
    selectedGenreIds.value = genreIds
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
      title: form.title,
      original_title: form.original_title || null,
      title_kana: form.title_kana || null,
      slug: form.slug,
      description: form.description || null,
      year: form.year ?? null,
      duration_minutes: form.duration_minutes ?? null,
      release_date: form.release_date || null,
      origin_country: form.origin_country || null,
      director: form.director || null,
      main_cast: form.main_cast || null,
      video_path: form.video_path || null,
      poster_url: form.poster_url || null,
      banner_url: form.banner_url || null,
      is_featured: form.is_featured,
    }

    // 1) update movie
    const { error: movieError } = await supabase
      .from('movies')
      .update(payload)
      .eq('id', movieId.value)

    if (movieError) {
      errorMessage.value = movieError.message
      return
    }

    // 2) update movie_genres
    const { error: deleteError } = await supabase
      .from('movie_genres')
      .delete()
      .eq('movie_id', movieId.value)

    if (deleteError) {
      errorMessage.value =
        'ジャンルの更新に失敗しました: ' + deleteError.message
      return
    }

    if (selectedGenreIds.value.length > 0) {
      const mgPayload = selectedGenreIds.value.map((gid) => ({
        movie_id: movieId.value,
        genre_id: gid,
      }))

      const { error: insertError } = await supabase
        .from('movie_genres')
        .insert(mgPayload)

      if (insertError) {
        errorMessage.value =
          'ジャンルの更新に失敗しました: ' + insertError.message
        return
      }
    }

    successMessage.value = '映画を更新しました。'
    setTimeout(() => {
      router.push('/admin')
    }, 800)
  } finally {
    submitting.value = false
  }
}

await loadMovie()
</script>