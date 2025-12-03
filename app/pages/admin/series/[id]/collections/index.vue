<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">コレクション一覧</h1>
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
            to="/admin/providers"
            class="text-zinc-400 hover:text-zinc-200"
          >
            プロバイダー管理
          </NuxtLink>
        </div>
      </div>

      <!-- Form tạo collection -->
      <div class="mb-6 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <h2 class="mb-3 text-sm font-medium">新しいコレクションを追加</h2>

        <form class="grid gap-3 md:grid-cols-2" @submit.prevent="handleCreate">
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-zinc-300">名前</label>
            <input
              v-model="newCollection.name"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: ベトナム語字幕版"
              required
            />
          </div>

          <!-- chọn provider -->
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-zinc-300">
              プロバイダー（任意）
            </label>
            <select
              v-model.number="newCollection.provider_id"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            >
              <option :value="0">（未指定）</option>
              <option
                v-for="p in providers"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </select>
            <p class="mt-1 text-[11px] text-zinc-500">
              ※ プロバイダー情報（名前・URL）はプロバイダーテーブルで管理します。
            </p>
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-300">type (任意)</label>
            <input
              v-model="newCollection.type"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: sub / dub / host / backup"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-300">音声言語 (任意)</label>
            <input
              v-model="newCollection.audio_language"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: ja / vi / en"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-300">字幕言語 (任意)</label>
            <input
              v-model="newCollection.subtitle_language"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: vi / ja / en / multi"
            />
          </div>

          <div class="md:col-span-2 flex items-center justify-between pt-1">
            <label class="inline-flex items-center gap-2 text-xs text-zinc-300">
              <input
                v-model="newCollection.is_default"
                type="checkbox"
                class="rounded border-zinc-600 bg-zinc-900"
              />
              既定のコレクションに設定
            </label>

            <button
              type="submit"
              :disabled="creating"
              class="inline-flex items-center rounded-md bg-emerald-500 px-4 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ creating ? '作成中…' : '追加する' }}
            </button>
          </div>

          <p v-if="createError" class="md:col-span-2 text-xs text-red-400">
            {{ createError }}
          </p>
        </form>
      </div>

      <!-- List collections -->
      <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div class="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>コレクション一覧</span>
          <span v-if="collections.length">{{ collections.length }} 件</span>
        </div>

        <div v-if="loading" class="py-8 text-center text-sm text-zinc-400">
          読み込み中…
        </div>

        <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-400">
          {{ errorMessage }}
        </div>

        <div v-else>
          <div v-if="!collections.length" class="py-8 text-center text-sm text-zinc-400">
            コレクションがまだ登録されていません。上のフォームから追加してください。
          </div>

          <ul v-else class="divide-y divide-white/5 text-sm">
            <li
              v-for="c in collections"
              :key="c.id"
              class="flex items-center justify-between gap-3 py-2.5"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-zinc-50">
                    {{ c.name }}
                  </p>
                  <span
                    v-if="c.type"
                    class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                  >
                    {{ c.type }}
                  </span>
                  <span
                    v-if="c.is_default"
                    class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
                  >
                    default
                  </span>
                </div>

                <div class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  <span v-if="c.audio_language">
                    音声: {{ c.audio_language }}
                  </span>
                  <span v-if="c.subtitle_language">
                    字幕: {{ c.subtitle_language }}
                  </span>

                  <!-- Provider label -->
                  <span v-if="getProviderLabel(c)">
                    Provider: {{ getProviderLabel(c) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 text-xs">
                <NuxtLink
                  :to="`/admin/series/${seriesId}/collections/${c.id}/episodes`"
                  class="text-zinc-300 hover:text-zinc-100"
                >
                  エピソードを編集
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
import { ref, computed, reactive } from 'vue'
import { useRoute, useSupabaseClient } from '#imports'

type SeriesRow = {
  id: number
  title: string
}

type CollectionRow = {
  id: number
  name: string
  type: string | null
  audio_language: string | null
  subtitle_language: string | null
  provider_id: number | null
  is_default: boolean | null
}

type ProviderRow = {
  id: number
  name: string
  website_url: string | null
  is_active: boolean | null
}

const route = useRoute()
const supabase = useSupabaseClient<any>()

const seriesId = computed(() => Number(route.params.id))

const seriesTitle = ref('')
const collections = ref<CollectionRow[]>([])
const providers = ref<ProviderRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const creating = ref(false)
const createError = ref('')

const newCollection = reactive({
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  is_default: false,
  provider_id: 0 as number, // 0 = 未指定
})

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // Series title
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

    // Collections
    const { data: cData, error: cError } = await supabase
      .from('episode_collections')
      .select(
        'id, name, type, audio_language, subtitle_language, provider_id, is_default',
      )
      .eq('series_id', seriesId.value)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (cError) {
      errorMessage.value = cError.message
      return
    }

    collections.value = (cData ?? []) as CollectionRow[]

    // Providers (active)
    const { data: pData, error: pError } = await supabase
      .from('collection_providers')
      .select('id, name, website_url, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (!pError && pData) {
      providers.value = pData as ProviderRow[]
    }
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  creating.value = true
  createError.value = ''

  try {
    const payload = {
      series_id: seriesId.value,
      name: newCollection.name,
      type: newCollection.type || null,
      audio_language: newCollection.audio_language || null,
      subtitle_language: newCollection.subtitle_language || null,
      provider_id: newCollection.provider_id || null,
      is_default: newCollection.is_default,
    }

    const { error } = await supabase
      .from('episode_collections')
      .insert(payload)

    if (error) {
      createError.value = error.message
      return
    }

    // Clear form
    newCollection.name = ''
    newCollection.type = ''
    newCollection.audio_language = ''
    newCollection.subtitle_language = ''
    newCollection.is_default = false
    newCollection.provider_id = 0

    await loadData()
  } finally {
    creating.value = false
  }
}

const getProviderLabel = (c: CollectionRow) => {
  if (!c.provider_id) return ''
  const p = providers.value.find((pp) => pp.id === c.provider_id)
  return p ? p.name : ''
}

await loadData()
</script>
