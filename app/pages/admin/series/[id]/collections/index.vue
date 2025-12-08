<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">コレクション一覧</h1>
          <p class="mt-1 text-xs text-zinc-400">
            シリーズID：{{ seriesId }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2 text-xs">
          <NuxtLink
            :to="`/admin/series/${seriesId}`"
            class="text-zinc-400 hover:text-zinc-200"
          >
            &larr; シリーズ編集へ戻る
          </NuxtLink>
          <NuxtLink
            to="/admin/providers"
            class="text-zinc-400 hover:text-zinc-200"
          >
            プロバイダー管理
          </NuxtLink>
        </div>
      </div>

      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-5">
        <h2 class="mb-4 text-sm font-bold text-emerald-400 uppercase tracking-wider">新しいコレクションを追加</h2>

        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleCreate">
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-zinc-400">表示名 (Name)</label>
            <input
              v-model="newCollection.name"
              type="text"
              class="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              placeholder="例: Netflix, TV放送版, 4K Remaster..."
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-400">タイプ (Type)</label>
            <select
              v-model="newCollection.type"
              class="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
            >
              <option value="">指定なし</option>
              <option value="sub">字幕 (Sub)</option>
              <option value="dub">吹替 (Dub)</option>
              <option value="raw">RAW</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-400">プロバイダー (Provider)</label>
            <select
              v-model="newCollection.provider_id"
              class="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
            >
              <option :value="null">なし</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-400">音声言語 (Audio)</label>
            <input
              v-model="newCollection.audio_language"
              type="text"
              class="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              placeholder="例: ja, en..."
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-400">字幕言語 (Subtitle)</label>
            <input
              v-model="newCollection.subtitle_language"
              type="text"
              class="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
              placeholder="例: vi, en..."
            />
          </div>

          <div class="flex items-center gap-2 md:col-span-2 pt-2">
            <input
              id="new_is_default"
              v-model="newCollection.is_default"
              type="checkbox"
              class="rounded bg-zinc-700 border-zinc-600 accent-emerald-500 h-4 w-4"
            />
            <label for="new_is_default" class="text-sm text-zinc-300 select-none cursor-pointer">
              デフォルトに設定 (Is Default)
            </label>
          </div>

          <div class="md:col-span-2 pt-2">
            <button
              type="submit"
              :disabled="creating"
              class="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              {{ creating ? '作成中...' : '+ 追加する' }}
            </button>
            <p v-if="createError" class="mt-2 text-xs text-red-400">{{ createError }}</p>
          </div>
        </form>
      </div>

      <div>
        <div v-if="pending" class="py-8 text-center text-zinc-500">読み込み中...</div>
        
        <div v-else-if="!collections || collections?.length === 0" class="py-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
          コレクションがありません。
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="col in collections"
            :key="col.id"
            class="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white">{{ col.name }}</span>
                <span
                  v-if="col.is_default"
                  class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30"
                >
                  DEFAULT
                </span>
              </div>
              <div class="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
                <span v-if="col.type" class="bg-zinc-800 px-1.5 py-0.5 rounded">Type: {{ col.type }}</span>
                <span v-if="col.audio_language" class="bg-zinc-800 px-1.5 py-0.5 rounded">Audio: {{ col.audio_language }}</span>
                <span v-if="col.subtitle_language" class="bg-zinc-800 px-1.5 py-0.5 rounded">Sub: {{ col.subtitle_language }}</span>
                <span v-if="col.provider" class="bg-zinc-800 px-1.5 py-0.5 rounded">Provider: {{ col.provider.name }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 border-t border-zinc-800 pt-3 sm:border-0 sm:pt-0">
              <NuxtLink
                :to="`/admin/series/${seriesId}/collections/${col.id}/episodes`"
                class="rounded bg-zinc-100 px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-300 transition"
              >
                エピソード管理
              </NuxtLink>

              <button
                @click="openEditModal(col)"
                class="rounded border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                編集
              </button>

              <button
                @click="deleteCollection(col.id)"
                class="rounded bg-red-900/20 border border-red-900/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/50 hover:text-red-200 transition"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div class="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
          <h3 class="text-lg font-bold mb-4 text-white">コレクション編集</h3>
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div>
              <label class="block text-xs text-zinc-400 mb-1">表示名</label>
              <input v-model="editForm.name" type="text" required class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-zinc-400 mb-1">タイプ</label>
                <select v-model="editForm.type" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white outline-none">
                  <option value="">指定なし</option>
                  <option value="sub">字幕</option>
                  <option value="dub">吹替</option>
                  <option value="raw">RAW</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-zinc-400 mb-1">プロバイダー</label>
                <select v-model="editForm.provider_id" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white outline-none">
                  <option :value="null">なし</option>
                  <option v-for="p in providers" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-zinc-400 mb-1">音声言語</label>
                <input v-model="editForm.audio_language" type="text" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label class="block text-xs text-zinc-400 mb-1">字幕言語</label>
                <input v-model="editForm.subtitle_language" type="text" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white outline-none" />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input v-model="editForm.is_default" type="checkbox" id="edit_is_def" class="rounded bg-zinc-700 border-zinc-600 h-4 w-4 accent-emerald-500" />
              <label for="edit_is_def" class="text-sm text-zinc-300 select-none cursor-pointer">デフォルトに設定</label>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
              <button type="button" @click="showEditModal = false" class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">キャンセル</button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded font-medium transition">変更を保存</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin',
})

const route = useRoute()
const supabase = useSupabaseClient<any>()
const seriesId = route.params.id as string

// Types
type ProviderRow = {
  id: number
  name: string
}

type CollectionRow = {
  id: number
  name: string
  type: string | null
  audio_language: string | null
  subtitle_language: string | null
  provider_id: number | null
  is_default: boolean
  provider?: ProviderRow
}

// State
const providers = ref<ProviderRow[]>([])

// Create Form State
const creating = ref(false)
const createError = ref('')
const newCollection = reactive({
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  is_default: false,
  provider_id: null as number | null,
})

// Edit Form State
const showEditModal = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  is_default: false,
  provider_id: null as number | null,
})

// 1. Fetch Collections
const { data: collections, pending, refresh } = await useAsyncData<CollectionRow[]>(
  `admin-collections-${seriesId}`,
  async () => {
    const { data, error } = await supabase
      .from('episode_collections')
      .select('*, provider:collection_providers(id, name)')
      .eq('series_id', seriesId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) throw error
    return (data as unknown as CollectionRow[]) || []
  }
)

// 2. Fetch Providers
const fetchProviders = async () => {
  const { data } = await supabase
    .from('collection_providers')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  
  if (data) providers.value = data as ProviderRow[]
}
fetchProviders()

// 3. Create Logic
const handleCreate = async () => {
  creating.value = true
  createError.value = ''

  try {
    // SỬA: Nếu chọn Default, reset tất cả collection khác về false trước
    if (newCollection.is_default) {
      await supabase
        .from('episode_collections')
        .update({ is_default: false })
        .eq('series_id', seriesId)
    }

    const payload = {
      series_id: Number(seriesId), 
      name: newCollection.name,
      type: newCollection.type || null,
      audio_language: newCollection.audio_language || null,
      subtitle_language: newCollection.subtitle_language || null,
      provider_id: newCollection.provider_id || null,
      is_default: newCollection.is_default,
    } as any

    const { error } = await supabase.from('episode_collections').insert(payload)
    
    if (error) throw error

    // Reset Form
    newCollection.name = ''
    newCollection.type = ''
    newCollection.audio_language = ''
    newCollection.subtitle_language = ''
    newCollection.is_default = false
    newCollection.provider_id = null

    refresh()
  } catch (e: any) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

// 4. Edit Logic
const openEditModal = (col: CollectionRow) => {
  editForm.id = col.id
  editForm.name = col.name
  editForm.type = col.type || ''
  editForm.audio_language = col.audio_language || ''
  editForm.subtitle_language = col.subtitle_language || ''
  editForm.is_default = col.is_default
  editForm.provider_id = col.provider_id
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    // SỬA: Nếu sửa thành Default, reset tất cả collection khác về false
    if (editForm.is_default) {
      await supabase
        .from('episode_collections')
        .update({ is_default: false })
        .eq('series_id', seriesId)
    }

    const updatePayload = {
      name: editForm.name,
      type: editForm.type || null,
      audio_language: editForm.audio_language || null,
      subtitle_language: editForm.subtitle_language || null,
      provider_id: editForm.provider_id || null,
      is_default: editForm.is_default
    } as any

    const { error } = await supabase
      .from('episode_collections')
      .update(updatePayload)
      .eq('id', editForm.id)

    if (error) throw error

    showEditModal.value = false
    refresh()
  } catch (err: any) {
    alert('エラーが発生しました: ' + err.message)
  }
}

// 5. Delete Logic
const deleteCollection = async (id: number) => {
  if (!confirm('警告：このコレクションを削除してもよろしいですか？\n\n注意：含まれる全てのエピソードも自動的に削除されます。')) return

  try {
    const { error } = await supabase
      .from('episode_collections')
      .delete()
      .eq('id', id)

    if (error) throw error

    refresh()
  } catch (err: any) {
    alert('削除エラー: ' + err.message)
  }
}
</script>