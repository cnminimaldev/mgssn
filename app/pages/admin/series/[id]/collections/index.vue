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
        
        <div class="flex flex-col items-end gap-3">
          <div class="flex gap-3 text-xs">
            <NuxtLink
              :to="`/admin/series/${seriesId}`"
              class="text-zinc-400 hover:text-zinc-200"
            >
              &larr; シリーズ編集へ戻る
            </NuxtLink>
            <span class="text-zinc-700">|</span>
            <NuxtLink
              to="/admin/providers"
              class="text-zinc-400 hover:text-zinc-200"
            >
              プロバイダー管理
            </NuxtLink>
          </div>

          <NuxtLink 
            :to="`/admin/series/${seriesId}/episodes/bulk`" 
            class="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            エピソード一括登録 (Bulk)
          </NuxtLink>
        </div>
      </div>

      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <h2 class="mb-3 text-xs font-bold text-emerald-400 uppercase tracking-wider">新しいコレクション (Add New)</h2>

        <form class="flex flex-col gap-3" @submit.prevent="addCollection">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 space-y-1">
              <input
                v-model="createForm.name"
                type="text"
                required
                placeholder="名前 (Display Name)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div class="flex-1 space-y-1">
              <input
                v-model="createForm.name_ja"
                type="text"
                placeholder="名前 (Japanese - Optional)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="w-full sm:w-28 space-y-1">
              <select
                v-model="createForm.type"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="sub">字幕 (Sub)</option>
                <option value="dub">吹き替え</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            
            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="createForm.audio_language"
                type="text"
                placeholder="音声 (Audio)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="createForm.subtitle_language"
                type="text"
                placeholder="字幕 (Sub)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div class="flex-1 w-full space-y-1">
              <select
                v-model="createForm.provider_id"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option :value="null">Prov: 指定なし</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            
            <button
              type="submit"
              class="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition whitespace-nowrap"
            >
              追加
            </button>
          </div>
        </form>
      </div>

      <div v-if="pending" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="col in collections"
          :key="col.id"
          class="group flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-zinc-200 text-base truncate">
                {{ col.name }}
              </h3>
              
              <div class="flex gap-1">
                <span v-if="col.is_default" class="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-900/50">
                  DEF
                </span>
                <span v-if="col.type" class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400 border border-zinc-700/50">
                  {{ col.type }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs text-zinc-500 mt-1 truncate">
              <span v-if="col.name_ja">{{ col.name_ja }}</span>
              
              <span v-if="(col.audio_language || col.subtitle_language) && col.name_ja" class="text-zinc-700">|</span>
              <span v-if="col.audio_language" class="flex items-center gap-1" title="Audio">
                🔊 {{ col.audio_language }}
              </span>
              <span v-if="col.subtitle_language" class="flex items-center gap-1" title="Subtitle">
                💬 {{ col.subtitle_language }}
              </span>

              <span v-if="col.collection_providers" class="text-zinc-700">|</span>
              <span v-if="col.collection_providers" class="flex items-center gap-1 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                </svg>
                {{ col.collection_providers.name }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 shrink-0">
            <NuxtLink
              :to="`/admin/series/${seriesId}/collections/${col.id}/episodes`"
              class="flex items-center gap-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-xs transition group/btn"
              title="エピソード管理"
            >
              <span class="text-zinc-300 font-medium group-hover/btn:text-white">Episodes</span>
              <span class="bg-black text-emerald-500 font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {{ col.episodes ? col.episodes[0]?.count : 0 }}
              </span>
            </NuxtLink>

            <div class="flex gap-1">
              <button
                @click="openEditModal(col)"
                class="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition"
                title="編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button
                @click="deleteCollection(col.id)"
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
        <div>
          <label class="mb-1 block text-xs text-zinc-500">名前 (JA)</label>
          <input
            v-model="editForm.name_ja"
            type="text"
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
            <select
              v-model="editForm.type"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="sub">字幕 (Sub)</option>
              <option value="dub">吹き替え (Dub)</option>
              <option value="raw">Raw</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">プロバイダー</label>
            <select
              v-model="editForm.provider_id"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option :value="null">指定なし</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
           <input
            id="isDefault"
            v-model="editForm.is_default"
            type="checkbox"
            class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-900"
          />
          <label for="isDefault" class="text-sm text-zinc-300">
            デフォルトとして設定 (Default)
          </label>
        </div>

        <div class="flex justify-end pt-4">
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
import { ref, reactive } from 'vue'
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const seriesId = route.params.id
const supabase = useSupabaseClient<any>()

// 1. Fetch Providers
const { data: providers } = await useAsyncData('providers-list', async () => {
  const { data } = await supabase
    .from('collection_providers')
    .select('id, name')
    .eq('is_active', true)
  return data || []
})

// 2. Fetch Collections
const { data: collections, pending, refresh } = await useAsyncData(
  `collections-${seriesId}`,
  async () => {
    // Join Providers & Count Episodes
    const { data, error } = await supabase
      .from('episode_collections')
      .select(`
        *,
        collection_providers (name),
        episodes (count)
      `)
      .eq('series_id', seriesId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }
)

// 3. Create Logic
const createForm = reactive({
  name: '',
  name_ja: '',
  type: 'sub',
  audio_language: '',    // [ADDED]
  subtitle_language: '', // [ADDED]
  provider_id: null as number | null
})

const addCollection = async () => {
  try {
    const { error } = await supabase.from('episode_collections').insert({
      series_id: seriesId,
      name: createForm.name,
      name_ja: createForm.name_ja || null,
      type: createForm.type,
      audio_language: createForm.audio_language || null, // [ADDED]
      subtitle_language: createForm.subtitle_language || null, // [ADDED]
      provider_id: createForm.provider_id
    })
    if (error) throw error
    
    // Reset & Refresh
    createForm.name = ''
    createForm.name_ja = ''
    createForm.audio_language = ''
    createForm.subtitle_language = ''
    refresh()
  } catch (e: any) {
    alert(e.message)
  }
}

// 4. Edit Logic
const showEditModal = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  name_ja: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  provider_id: null as number | null,
  is_default: false
})

const openEditModal = (col: any) => {
  editForm.id = col.id
  editForm.name = col.name
  editForm.name_ja = col.name_ja || ''
  editForm.type = col.type || 'sub'
  editForm.audio_language = col.audio_language || ''
  editForm.subtitle_language = col.subtitle_language || ''
  editForm.is_default = col.is_default
  editForm.provider_id = col.provider_id
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    // Nếu sửa thành Default, reset tất cả collection khác về false
    if (editForm.is_default) {
      await supabase
        .from('episode_collections')
        .update({ is_default: false })
        .eq('series_id', seriesId)
    }

    const updatePayload = {
      name: editForm.name,
      name_ja: editForm.name_ja || null,
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
  if (!confirm('このコレクションを削除しますか？\n(含まれるエピソードも全て削除されます)')) return
  try {
    const { error } = await supabase
      .from('episode_collections')
      .delete()
      .eq('id', id)
    if (error) throw error
    refresh()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>