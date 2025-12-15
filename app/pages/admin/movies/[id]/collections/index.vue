<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">ムービーコレクション一覧</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画：{{ movieTitle || '...' }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2 text-xs">
          <NuxtLink
            :to="`/admin/movies/${movieId}`"
            class="text-zinc-400 hover:text-zinc-200"
          >
            &larr; 映画編集へ戻る
          </NuxtLink>
          <NuxtLink
            to="/admin/providers"
            class="text-zinc-400 hover:text-zinc-200"
          >
            プロバイダー管理
          </NuxtLink>
        </div>
      </div>

      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <h2 class="mb-3 text-xs font-bold text-emerald-400 uppercase tracking-wider">新しいコレクション (Add New)</h2>

        <form class="flex flex-col gap-3" @submit.prevent="handleCreate">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 space-y-1">
              <input
                v-model="newCollection.name"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="名前 (Display Name)"
                required
              />
            </div>
            <div class="flex-1 space-y-1">
              <select
                v-model.number="newCollection.provider_id"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option :value="0">Provider: 指定なし</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="newCollection.type"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Type (sub/dub)"
              />
            </div>
            
            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="newCollection.audio_language"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="音声 (Audio)"
              />
            </div>

            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="newCollection.subtitle_language"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="字幕 (Sub)"
              />
            </div>

            <div class="flex items-center gap-2 mb-2 px-2">
              <input
                id="chkDefault"
                v-model="newCollection.is_default"
                type="checkbox"
                class="rounded border-zinc-600 bg-zinc-900"
              />
              <label for="chkDefault" class="text-xs text-zinc-400 cursor-pointer">Default</label>
            </div>

            <div class="flex-1 flex justify-end">
              <button
                type="submit"
                :disabled="creating"
                class="rounded bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 transition whitespace-nowrap"
              >
                {{ creating ? '...' : '追加' }}
              </button>
            </div>
          </div>
          
          <p v-if="createError" class="text-xs text-red-400 mt-1">
            {{ createError }}
          </p>
        </form>
      </div>

      <div v-if="loading" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>

      <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-400">
        {{ errorMessage }}
      </div>

      <div v-else>
        <div v-if="!collections.length" class="py-12 text-center text-zinc-500 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30">
          <p class="mb-2 text-lg">📭 コレクションがありません</p>
          <p class="text-sm">上のフォームから追加してください。</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="c in collections"
            :key="c.id"
            class="group flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3">
                <h3 class="font-bold text-zinc-200 text-base truncate">
                  {{ c.name }}
                </h3>
                
                <div class="flex gap-1">
                  <span v-if="c.is_default" class="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-900/50">
                    DEF
                  </span>
                  <span v-if="c.type" class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400 border border-zinc-700/50">
                    {{ c.type }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3 text-xs text-zinc-500 mt-1 truncate">
                <span v-if="c.audio_language" class="flex items-center gap-1" title="Audio">
                  🔊 {{ c.audio_language }}
                </span>
                <span v-if="c.subtitle_language" class="flex items-center gap-1" title="Subtitle">
                  💬 {{ c.subtitle_language }}
                </span>

                <span v-if="(c.audio_language || c.subtitle_language) && getProviderLabel(c)" class="text-zinc-700">|</span>
                
                <span v-if="getProviderLabel(c)" class="flex items-center gap-1 text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                  </svg>
                  {{ getProviderLabel(c) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-4 shrink-0">
              <NuxtLink
                :to="`/admin/movies/${movieId}/collections/${c.id}/parts`"
                class="flex items-center gap-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-xs transition group/btn"
              >
                <span class="text-zinc-300 font-medium group-hover/btn:text-white">パート管理 (Parts)</span>
                <span class="bg-black text-emerald-500 font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center text-[10px]">
                  &rarr;
                </span>
              </NuxtLink>

              <button
                @click="openEditModal(c)"
                class="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition"
                title="編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>

              <button
                @click="deleteCollection(c.id)"
                class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="showEditModal" title="コレクション編集">
      <form class="space-y-4" @submit.prevent="handleUpdate">
        <div>
          <label class="mb-1 block text-xs text-zinc-500">名前</label>
          <input
            v-model="editForm.name"
            type="text"
            required
            class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs text-zinc-500">音声 (Audio)</label>
            <input
              v-model="editForm.audio_language"
              type="text"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">字幕 (Subtitle)</label>
            <input
              v-model="editForm.subtitle_language"
              type="text"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs text-zinc-500">タイプ</label>
            <input
              v-model="editForm.type"
              type="text"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. sub"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">プロバイダー</label>
            <select
              v-model.number="editForm.provider_id"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option :value="0">指定なし</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
           <input
            id="editDefault"
            v-model="editForm.is_default"
            type="checkbox"
            class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-900"
          />
          <label for="editDefault" class="text-sm text-zinc-300">
            デフォルトとして設定 (Default)
          </label>
        </div>

        <div class="flex justify-end pt-4 gap-2">
          <button
            type="button"
            @click="showEditModal = false"
            class="rounded border border-zinc-700 bg-transparent px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
          >
            保存する
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useSupabaseClient } from '#imports'

// Types
type MovieRow = { id: number; title: string }
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

const movieId = computed(() => Number(route.params.id))

const movieTitle = ref('')
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
  provider_id: 0 as number,
})

// Edit State
const showEditModal = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  provider_id: 0 as number | null,
  is_default: false
})

// Load Data
const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // 1. Movie Info
    const { data: mData, error: mError } = await supabase
      .from('movies')
      .select('id, title')
      .eq('id', movieId.value)
      .single()

    if (mError) throw mError
    movieTitle.value = (mData as MovieRow).title

    // 2. Collections
    const { data: cData, error: cError } = await supabase
      .from('movie_collections')
      .select('id, name, type, audio_language, subtitle_language, provider_id, is_default')
      .eq('movie_id', movieId.value)
      .order('is_default', { ascending: false }) // Default lên đầu
      .order('created_at', { ascending: true })

    if (cError) throw cError
    collections.value = (cData ?? []) as CollectionRow[]

    // 3. Providers
    const { data: pData, error: pError } = await supabase
      .from('collection_providers')
      .select('id, name, website_url, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (!pError && pData) {
      providers.value = pData as ProviderRow[]
    }
  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

// Create Action
const handleCreate = async () => {
  creating.value = true
  createError.value = ''

  try {
    // Nếu set default, bỏ default các cái cũ
    if (newCollection.is_default) {
      await supabase
        .from('movie_collections')
        .update({ is_default: false })
        .eq('movie_id', movieId.value)
    }

    const payload = {
      movie_id: movieId.value,
      name: newCollection.name,
      type: newCollection.type || null,
      audio_language: newCollection.audio_language || null,
      subtitle_language: newCollection.subtitle_language || null,
      provider_id: newCollection.provider_id || null,
      is_default: newCollection.is_default,
    }

    const { error } = await supabase.from('movie_collections').insert(payload)
    if (error) throw error

    // Reset Form
    newCollection.name = ''
    newCollection.type = ''
    newCollection.audio_language = ''
    newCollection.subtitle_language = ''
    newCollection.is_default = false
    newCollection.provider_id = 0

    await loadData()
  } catch (err: any) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

// Edit Action
const openEditModal = (c: CollectionRow) => {
  editForm.id = c.id
  editForm.name = c.name
  editForm.type = c.type || ''
  editForm.audio_language = c.audio_language || ''
  editForm.subtitle_language = c.subtitle_language || ''
  editForm.provider_id = c.provider_id || 0
  editForm.is_default = c.is_default || false
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    // Nếu sửa thành Default, reset tất cả collection khác về false
    if (editForm.is_default) {
      await supabase
        .from('movie_collections')
        .update({ is_default: false })
        .eq('movie_id', movieId.value)
    }

    const payload = {
      name: editForm.name,
      type: editForm.type || null,
      audio_language: editForm.audio_language || null,
      subtitle_language: editForm.subtitle_language || null,
      provider_id: editForm.provider_id || null,
      is_default: editForm.is_default
    }

    const { error } = await supabase
      .from('movie_collections')
      .update(payload)
      .eq('id', editForm.id)

    if (error) throw error

    showEditModal.value = false
    await loadData()
  } catch (err: any) {
    alert('エラーが発生しました: ' + err.message)
  }
}

// Delete Action
const deleteCollection = async (id: number) => {
  if (!confirm('このコレクションを削除しますか？\n(含まれる動画パートも全て削除されます)')) return

  try {
    const { error } = await supabase
      .from('movie_collections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    await loadData() // Refresh list
  } catch (err: any) {
    alert('エラーが発生しました: ' + err.message)
  }
}

// Helper
const getProviderLabel = (c: CollectionRow) => {
  if (!c.provider_id) return ''
  const p = providers.value.find((pp) => pp.id === c.provider_id)
  return p ? p.name : ''
}

// Init
loadData()
</script>