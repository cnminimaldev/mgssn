<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">ジャンル管理</h1>
          <p class="mt-1 text-xs text-zinc-400">
            検索フィルターや作品詳細で使うジャンルを管理します。
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="text-sm text-zinc-400 hover:text-zinc-200"
        >
          管理トップへ戻る
        </NuxtLink>
      </div>

      <div class="grid gap-6 md:grid-cols-[2fr,3fr]">
        <!-- 左: 一覧 -->
        <div>
          <div
            class="mb-3 flex items-center justify-between text-xs text-zinc-400"
          >
            <span>登録済みジャンル</span>
            <span v-if="genres.length">{{ genres.length }} 件</span>
          </div>

          <div
            class="overflow-hidden rounded-lg border border-white/5 bg-zinc-950/70"
          >
            <div
              v-if="loading"
              class="px-3 py-6 text-center text-sm text-zinc-400"
            >
              読み込み中…
            </div>

            <div
              v-else-if="errorMessage"
              class="px-3 py-6 text-center text-sm text-red-400"
            >
              {{ errorMessage }}
            </div>

            <div v-else>
              <div
                v-if="!genres.length"
                class="px-3 py-6 text-center text-sm text-zinc-400"
              >
                ジャンルがまだ登録されていません。
              </div>

              <ul v-else class="divide-y divide-white/5 text-sm">
                <li
                  v-for="g in genresSorted"
                  :key="g.id"
                  class="flex items-center justify-between px-3 py-2.5"
                >
                  <button
                    type="button"
                    class="flex flex-1 flex-col items-start text-left"
                    @click="editFromGenre(g)"
                  >
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-zinc-50">
                        {{ g.name_ja || g.name || g.slug }}
                      </span>
                      <span
                        class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                      >
                        {{ g.slug }}
                      </span>
                      <span
                        v-if="!g.is_active"
                        class="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] text-red-200"
                      >
                        無効
                      </span>
                    </div>
                    <div class="mt-0.5 text-[11px] text-zinc-400">
                      sort_order: {{ g.sort_order ?? 0 }}
                    </div>
                  </button>

                  <div class="flex items-center gap-2 pl-2">
                    <button
                      type="button"
                      class="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 hover:border-zinc-400"
                      @click="toggleActive(g)"
                    >
                      {{ g.is_active ? '無効にする' : '有効にする' }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右: フォーム（新規 / 編集） -->
        <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
          <h2 class="mb-3 text-sm font-semibold text-zinc-100">
            {{ isEditing ? 'ジャンルを編集' : '新しいジャンルを追加' }}
          </h2>

          <form class="space-y-3" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                スラッグ (slug)
              </label>
              <input
                v-model="form.slug"
                :disabled="isEditing"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-900/60"
                placeholder="例: anime, drama, romance"
                required
              />
              <p class="mt-1 text-[11px] text-zinc-500">
                URL やフィルターに使う英小文字スラッグ。編集時は変更できません。
              </p>
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                名前 (日本語表示)
              </label>
              <input
                v-model="form.name_ja"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
                placeholder="例: アニメ"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                名前 (英語)
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
                placeholder="例: Anime"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                表示順 (sort_order)
              </label>
              <input
                v-model.number="form.sort_order"
                type="number"
                class="w-32 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                id="genre-active"
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
              />
              <label
                for="genre-active"
                class="text-xs text-zinc-300"
              >
                有効（検索フィルターなどに表示）
              </label>
            </div>

            <div
              v-if="formMessage"
              class="text-xs"
              :class="formError ? 'text-red-400' : 'text-emerald-400'"
            >
              {{ formMessage }}
            </div>

            <div class="flex gap-2 pt-1">
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ submitting ? '保存中…' : isEditing ? '更新する' : '追加する' }}
              </button>
              <button
                v-if="isEditing"
                type="button"
                class="inline-flex items-center rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-300"
                @click="resetForm"
              >
                新規作成モードに戻る
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSupabaseClient } from '#imports'

type GenreRow = {
  id: number
  slug: string
  name: string | null
  name_ja: string | null
  sort_order: number | null
  is_active: boolean | null
}

const supabase = useSupabaseClient<any>()

const genres = ref<GenreRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const form = reactive({
  id: null as number | null,
  slug: '',
  name: '',
  name_ja: '',
  sort_order: 0 as number | null,
  is_active: true,
})

const isEditing = computed(() => form.id !== null)
const submitting = ref(false)
const formMessage = ref('')
const formError = ref(false)

const loadGenres = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase
      .from('genres')
      .select('id, slug, name, name_ja, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name_ja', { ascending: true })

    if (error) {
      errorMessage.value = error.message
      return
    }

    genres.value = data ?? []
  } finally {
    loading.value = false
  }
}

const genresSorted = computed(() => genres.value ?? [])

const resetForm = () => {
  form.id = null
  form.slug = ''
  form.name = ''
  form.name_ja = ''
  form.sort_order = 0
  form.is_active = true
  formMessage.value = ''
  formError.value = false
}

const editFromGenre = (g: GenreRow) => {
  form.id = g.id
  form.slug = g.slug
  form.name = g.name ?? ''
  form.name_ja = g.name_ja ?? ''
  form.sort_order = g.sort_order ?? 0
  form.is_active = g.is_active ?? true
  formMessage.value = ''
  formError.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  formMessage.value = ''
  formError.value = false

  try {
    if (!form.slug.trim()) {
      formMessage.value = 'slug は必須です。'
      formError.value = true
      return
    }

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim() || null,
      name_ja: form.name_ja.trim() || null,
      sort_order: form.sort_order ?? 0,
      is_active: form.is_active,
    }

    if (isEditing.value && form.id !== null) {
      const { error } = await supabase
        .from('genres')
        .update(payload)
        .eq('id', form.id)

      if (error) {
        formMessage.value = error.message
        formError.value = true
        return
      }

      formMessage.value = 'ジャンルを更新しました。'
    } else {
      const { error } = await supabase.from('genres').insert(payload)

      if (error) {
        formMessage.value = error.message
        formError.value = true
        return
      }

      formMessage.value = 'ジャンルを追加しました。'
    }

    await loadGenres()
    // Sau khi lưu xong, giữ lại edit mode; nếu muốn về new mode thì gọi resetForm()
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (g: GenreRow) => {
  const newActive = !(g.is_active ?? true)
  const { error } = await supabase
    .from('genres')
    .update({ is_active: newActive })
    .eq('id', g.id)

  if (error) {
    alert('更新に失敗しました: ' + error.message)
    return
  }
  await loadGenres()
}

// load lần đầu
loadGenres()
</script>
