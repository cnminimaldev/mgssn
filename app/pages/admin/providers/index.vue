<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">プロバイダー管理 (Providers)</h1>
          <p class="mt-1 text-xs text-zinc-400">
            動画の提供元 (Fansub, Release Group, Source) を管理します
          </p>
        </div>
        <div class="flex gap-2">
          <NuxtLink to="/admin" class="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-800 text-zinc-300">
            &larr; Admin Top
          </NuxtLink>
        </div>
      </div>

      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-5">
        <h2 class="mb-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">新規登録 (Add New)</h2>

        <form class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start" @submit.prevent="handleAdd">
          <div class="md:col-span-4">
            <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">名前 (Name)</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="例: Netflix, Server VIP..."
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">コード (Code)</label>
            <input
              v-model="form.code"
              type="text"
              placeholder="NFLX"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono uppercase"
            />
          </div>

          <div class="md:col-span-6">
            <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">Web URL</label>
            <input
              v-model="form.website_url"
              type="url"
              placeholder="https://..."
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-emerald-500 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div class="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-white/5 pt-4 mt-2">
            <div class="md:col-span-3">
              <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">プレイヤータイプ (Type)</label>
              <select 
                v-model="form.player_type"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="direct">Direct Stream (.m3u8/mp4)</option>
                <option value="embed">Iframe Embed</option>
              </select>
            </div>

            <div class="md:col-span-9" v-if="form.player_type === 'embed'">
              <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">
                埋め込みパターン (Embed Pattern) 
                <span class="normal-case font-normal text-zinc-600">- URLの {id} がエピソードの動画パスに置換されます</span>
              </label>
              <input
                v-model="form.embed_pattern"
                type="text"
                placeholder="例: https://server.com/embed/{id} (空欄の場合は動画パスをそのまま使用)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-yellow-400 focus:border-yellow-500 focus:outline-none font-mono"
              />
            </div>
            <div class="md:col-span-9" v-else>
              <p class="text-[11px] text-zinc-600 mt-6">
                ※ Direct Stream は StreamingPlayer.vue (HLS/MP4) を使用します。
              </p>
            </div>
          </div>

          <div class="md:col-span-10">
            <label class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold">メモ (Note)</label>
            <textarea
              v-model="form.note"
              rows="1"
              placeholder="備考..."
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div class="md:col-span-2 self-end">
            <button
              type="submit"
              :disabled="loading"
              class="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-lg shadow-emerald-900/20"
            >
              <span v-if="loading">...</span>
              <span v-else>追加</span>
            </button>
          </div>
        </form>
        
        <p v-if="errorMsg" class="mt-2 text-xs text-red-400">{{ errorMsg }}</p>
      </div>

      <div v-if="pending" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>

      <div v-else>
        <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
          <table class="w-full text-left text-sm text-zinc-400">
            <thead class="bg-zinc-950 text-zinc-200 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-3 w-12 text-center">ID</th>
                <th class="px-4 py-3">名前</th>
                <th class="px-4 py-3">タイプ</th>
                <th class="px-4 py-3">設定</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr v-for="p in providers" :key="p.id" class="hover:bg-zinc-800/50 transition-colors group">
                <td class="px-4 py-3 text-center text-zinc-600 font-mono">{{ p.id }}</td>
                
                <td class="px-4 py-3">
                  <div class="font-medium text-zinc-200">{{ p.name }}</div>
                  <div v-if="p.code" class="text-xs font-mono text-zinc-500 mt-0.5">
                    {{ p.code }}
                  </div>
                </td>
                
                <td class="px-4 py-3">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                    :class="p.player_type === 'embed' 
                      ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' 
                      : 'bg-emerald-900/30 text-emerald-500 border-emerald-900/50'"
                  >
                    {{ p.player_type }}
                  </span>
                </td>

                <td class="px-4 py-3 text-xs">
                  <div v-if="p.player_type === 'embed' && p.embed_pattern" class="max-w-[200px] truncate text-zinc-500" :title="p.embed_pattern">
                    Pattern: <span class="font-mono text-zinc-400">{{ p.embed_pattern }}</span>
                  </div>
                  <div v-else-if="p.website_url" class="max-w-[200px] truncate text-zinc-500">
                    <a :href="p.website_url" target="_blank" class="hover:text-emerald-400 hover:underline">
                      {{ p.website_url }}
                    </a>
                  </div>
                  <div v-else class="text-zinc-600">-</div>
                </td>

                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="openEditModal(p)"
                      class="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition"
                      title="編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>

                    <button 
                      @click="deleteProvider(p.id)"
                      class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
                      title="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="providers?.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-zinc-600">データがありません</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <BaseModal v-model="showEditModal" title="プロバイダー編集 (Edit)">
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
            <label class="mb-1 block text-xs text-zinc-500">コード</label>
            <input
              v-model="editForm.code"
              type="text"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono uppercase"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">Website</label>
            <input
              v-model="editForm.website_url"
              type="text"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded p-3 border border-zinc-800">
          <label class="mb-1 block text-xs text-zinc-500">プレイヤータイプ</label>
          <select 
            v-model="editForm.player_type"
            class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none mb-3"
          >
            <option value="direct">Direct Stream (.m3u8/mp4)</option>
            <option value="embed">Iframe Embed</option>
          </select>

          <div v-if="editForm.player_type === 'embed'">
            <label class="mb-1 block text-xs text-zinc-500">Embed Pattern</label>
            <input
              v-model="editForm.embed_pattern"
              type="text"
              placeholder="https://server.com/embed/{id}"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-yellow-400 focus:border-yellow-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs text-zinc-500">メモ</label>
          <textarea
            v-model="editForm.note"
            rows="3"
            class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
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
import { ref, reactive } from 'vue'
import { useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient<any>()
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  name: '',
  code: '',
  website_url: '',
  note: '',
  player_type: 'direct',
  embed_pattern: ''
})

// Edit State
const showEditModal = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  code: '',
  website_url: '',
  note: '',
  player_type: 'direct',
  embed_pattern: ''
})

// Fetch Data
const { data: providers, pending, refresh } = await useAsyncData('admin-providers', async () => {
  const { data, error } = await supabase
    .from('collection_providers')
    .select('*')
    .order('id', { ascending: false })
  
  if (error) throw error
  return data || []
})

// Add
const handleAdd = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const { error } = await supabase.from('collection_providers').insert({
      name: form.name,
      code: form.code || null,
      website_url: form.website_url || null,
      note: form.note || null,
      player_type: form.player_type,
      embed_pattern: form.embed_pattern || null
    })

    if (error) throw error

    // Reset
    form.name = ''
    form.code = ''
    form.website_url = ''
    form.note = ''
    form.player_type = 'direct'
    form.embed_pattern = ''
    refresh()
  } catch (e: any) {
    errorMsg.value = 'Error: ' + e.message
  } finally {
    loading.value = false
  }
}

// Edit Action
const openEditModal = (p: any) => {
  editForm.id = p.id
  editForm.name = p.name
  editForm.code = p.code || ''
  editForm.website_url = p.website_url || ''
  editForm.note = p.note || ''
  editForm.player_type = p.player_type || 'direct'
  editForm.embed_pattern = p.embed_pattern || ''
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    const { error } = await supabase
      .from('collection_providers')
      .update({
        name: editForm.name,
        code: editForm.code || null,
        website_url: editForm.website_url || null,
        note: editForm.note || null,
        player_type: editForm.player_type,
        embed_pattern: editForm.embed_pattern || null
      })
      .eq('id', editForm.id)

    if (error) throw error

    showEditModal.value = false
    refresh()
  } catch (e: any) {
    alert('Update Error: ' + e.message)
  }
}

// Delete
const deleteProvider = async (id: number) => {
  if (!confirm(`このプロバイダー(ID:${id})を削除しますか？`)) return

  try {
    const { error } = await supabase
      .from('collection_providers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    refresh()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>