<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 block">&larr; 管理画面に戻る</NuxtLink>
          <h1 class="text-2xl font-bold text-white">注目作品管理 (Featured Manager)</h1>
          <p class="text-xs text-zinc-500 mt-1">トップページの「注目の作品」を管理します</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6 h-fit">
          <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
            作品を追加 (Add Content)
          </h2>
          
          <div class="relative mb-4">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="タイトルで検索... (Search by title)"
              class="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 outline-none text-white pl-10"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div v-if="searching" class="text-center py-4 text-xs text-zinc-500">Searching...</div>
          
          <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="item in searchResults" 
              :key="`${item.type}-${item.id}`"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10"
            >
              <img :src="item.thumbnail || '/images/fallback-poster.png'" class="w-10 h-14 object-cover rounded bg-zinc-800" />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-white truncate">{{ item.title }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span 
                    class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    :class="item.type === 'series' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'"
                  >
                    {{ item.type === 'series' ? 'SERIES' : 'MOVIE' }}
                  </span>
                  <span class="text-xs text-zinc-500">{{ item.year }}</span>
                </div>
              </div>
              <button 
                @click="addToFeatured(item)"
                class="bg-white/10 hover:bg-emerald-600 hover:text-white text-zinc-400 p-2 rounded-lg transition"
                :disabled="isAlreadyFeatured(item.id, item.type)"
                :class="{'opacity-50 cursor-not-allowed': isAlreadyFeatured(item.id, item.type)}"
              >
                <span v-if="isAlreadyFeatured(item.id, item.type)">✔</span>
                <span v-else>＋</span>
              </button>
            </div>
            
            <div v-if="searchResults.length === 0 && searchQuery" class="text-center py-8 text-zinc-500 text-xs">
              見つかりませんでした
            </div>
          </div>
        </div>

        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6 h-fit">
          <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider">
              現在の注目作品 (Current Featured)
            </h2>
            <span class="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
              {{ featuredList.length }} items
            </span>
          </div>

          <div v-if="loadingFeatured" class="text-center py-10">Loading...</div>

          <div v-else class="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="item in featuredList" 
              :key="item.id"
              class="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5 group"
            >
              <img :src="item.detail?.thumbnail || '/images/fallback-poster.png'" class="w-10 h-14 object-cover rounded bg-zinc-800" />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-white truncate">{{ item.detail?.title }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] uppercase text-zinc-500">{{ item.type }}</span>
                  <span class="text-[10px] text-zinc-600 font-mono">{{ new Date(item.created_at).toLocaleDateString() }}</span>
                </div>
              </div>
              <button 
                @click="removeFromFeatured(item.id)"
                class="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition"
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
            
            <div v-if="featuredList.length === 0" class="text-center py-10 text-zinc-500 text-sm border-2 border-dashed border-zinc-800 rounded-lg">
              まだ登録されていません
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin'
})

// --- State ---
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
let searchTimeout: any = null

const featuredList = ref<any[]>([])
const loadingFeatured = ref(true)

// --- Methods ---

// 1. Fetch Featured List
const fetchFeatured = async () => {
  loadingFeatured.value = true
  try {
    // [FIX] Thêm <any[]> để ép kiểu dữ liệu trả về, tránh lỗi "missing properties"
    const data = await $fetch<any[]>('/api/admin/featured', { method: 'GET' })
    featuredList.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingFeatured.value = false
  }
}

// 2. Search Contents (Reuse existing search API)
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  searching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      // Gọi API search có sẵn
      const data: any = await $fetch('/api/movies', {
        params: { q: searchQuery.value, pageSize: 10 }
      })
      searchResults.value = data.items || []
    } catch (e) {
      console.error(e)
    } finally {
      searching.value = false
    }
  }, 500)
}

// 3. Add to Featured
const addToFeatured = async (item: any) => {
  try {
    await $fetch('/api/admin/featured', {
      method: 'POST',
      body: { content_id: item.id, type: item.type }
    })
    await fetchFeatured() // Refresh list
  } catch (e) {
    alert('エラーが発生しました')
  }
}

// 4. Remove from Featured
const removeFromFeatured = async (id: number) => {
  if(!confirm('本当に削除しますか？')) return
  try {
    await $fetch('/api/admin/featured', {
      method: 'DELETE',
      body: { id }
    })
    await fetchFeatured() // Refresh list
  } catch (e) {
    alert('エラーが発生しました')
  }
}

// Helper: Check if item is already featured
const isAlreadyFeatured = (contentId: number, type: string) => {
  return featuredList.value.some(f => f.content_id === contentId && f.type === type)
}

// Init
onMounted(() => {
  fetchFeatured()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>