<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 block">
            &larr; 管理画面に戻る
          </NuxtLink>
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
              placeholder="タイトルまたはスラッグで検索... (Title or Slug)"
              class="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 outline-none text-white pl-10 transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div v-if="searching" class="text-center py-4 text-xs text-zinc-500">
            <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500 mr-2"></div>
            Searching...
          </div>
          
          <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="item in searchResults" 
              :key="`${item.type}-${item.id}`"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10 group"
            >
              <div class="relative shrink-0">
                <img 
                  :src="resolveImage(item)" 
                  class="w-10 h-14 object-cover rounded bg-zinc-800" 
                  loading="lazy"
                  alt=""
                />
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-white truncate" :title="item.title">
                  {{ item.title }}
                </h4>
                <div class="flex flex-col gap-0.5 mt-1">
                  <div class="flex items-center gap-2">
                    <span 
                      class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                      :class="item.type === 'series' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'"
                    >
                      {{ item.type }}
                    </span>
                    <span class="text-xs text-zinc-500">{{ item.year }}</span>
                  </div>
                  <span class="text-[10px] text-zinc-600 font-mono truncate max-w-[200px]" :title="item.slug">
                    /{{ item.slug }}
                  </span>
                </div>
              </div>

              <button 
                @click="addToFeatured(item)"
                class="bg-white/10 hover:bg-emerald-600 hover:text-white text-zinc-400 p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-zinc-400"
                :disabled="isAlreadyFeatured(item.id, item.type)"
                title="リストに追加"
              >
                <span v-if="isAlreadyFeatured(item.id, item.type)" class="text-emerald-500 font-bold">✔</span>
                <span v-else>＋</span>
              </button>
            </div>
            
            <div v-if="searchResults.length === 0 && searchQuery" class="text-center py-8 text-zinc-500 text-xs">
              一致する作品が見つかりませんでした
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

          <div v-if="loadingFeatured" class="text-center py-10 text-zinc-500 text-xs">
            Loading...
          </div>

          <div v-else class="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="item in featuredList" 
              :key="item.id"
              class="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5 group hover:border-white/10 transition"
            >
              <img 
                :src="resolveImage(item.detail)" 
                class="w-10 h-14 object-cover rounded bg-zinc-800" 
                loading="lazy"
                alt=""
              />

              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-white truncate">
                  {{ item.detail?.title || 'Unknown Title' }}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                    {{ item.type }}
                  </span>
                  <span class="text-[10px] text-zinc-600 font-mono">
                    {{ item.created_at ? new Date(item.created_at).toLocaleDateString() : '-' }}
                  </span>
                </div>
              </div>

              <button 
                @click="removeFromFeatured(item.id)"
                class="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-white/5"
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
import { definePageMeta, useFetch } from '#imports'
import { getResizedUrl } from '~/utils/image'

definePageMeta({
  middleware: 'admin'
})

// --- Type Definitions ---
interface SearchItem {
  id: number
  type: string
  title: string
  slug: string
  year: number
  posterUrl?: string
  bannerUrl?: string
  poster_url?: string // Fallback cho trường hợp API trả về snake_case
  banner_url?: string // Fallback cho trường hợp API trả về snake_case
}

interface FeaturedItem {
  id: number
  content_id: number
  type: string
  created_at: string
  detail?: SearchItem
}

// --- State ---
const searchQuery = ref('')
const searchResults = ref<SearchItem[]>([])
const searching = ref(false)
let searchTimeout: any = null

const featuredList = ref<FeaturedItem[]>([])
const loadingFeatured = ref(true)

// --- Helper: Xử lý hiển thị ảnh (Poster -> Banner -> Fallback) ---
const resolveImage = (item: any) => {
  if (!item) return '/images/fallback-poster.png'
  
  // Xử lý cả 2 trường hợp camelCase (API search) và snake_case (DB/Featured API)
  const poster = item.posterUrl || item.poster_url
  const banner = item.bannerUrl || item.banner_url
  
  // 1. Ưu tiên Poster, sau đó đến Banner
  const path = poster || banner
  
  // 2. Nếu không có ảnh nào -> Dùng Fallback
  if (!path) return '/images/fallback-poster.png'
  
  // 3. Sử dụng getResizedUrl để tối ưu (Supabase Transformation)
  // Thumbnail list chỉ cần nhỏ gọn, width=100, height=150, crop cover
  return getResizedUrl(path, 100, 150, 'cover')
}

// --- Methods ---

// 1. Fetch Featured List
const fetchFeatured = async () => {
  loadingFeatured.value = true
  try {
    const data = await $fetch<FeaturedItem[]>('/api/admin/featured', { method: 'GET' })
    featuredList.value = data || []
  } catch (e) {
    console.error(e)
    alert('注目作品リストの取得に失敗しました')
  } finally {
    loadingFeatured.value = false
  }
}

// 2. Search Contents (Sử dụng API /api/movies chung)
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  searching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      // Gọi API Search chung của hệ thống
      const data: any = await $fetch('/api/movies', {
        params: { 
          q: searchQuery.value, 
          pageSize: 10 // Chỉ lấy 10 kết quả cho nhẹ
        }
      })
      
      // Map dữ liệu từ response (API /api/movies trả về object { items: [], ... })
      searchResults.value = data.items || []
    } catch (e) {
      console.error(e)
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 500) // Debounce 500ms
}

// 3. Add to Featured
const addToFeatured = async (item: SearchItem) => {
  try {
    await $fetch('/api/admin/featured', {
      method: 'POST',
      body: { content_id: item.id, type: item.type }
    })
    
    // Refresh danh sách sau khi thêm thành công
    await fetchFeatured()
    
    // (Optional) Reset search sau khi thêm
    // searchQuery.value = ''
    // searchResults.value = []
  } catch (e: any) {
    // Xử lý lỗi (ví dụ: duplicate key)
    if (e.data?.status === 'exists') {
      alert('この作品は既に追加されています (Already exists)')
    } else {
      alert('エラーが発生しました: ' + (e.message || 'Unknown error'))
    }
  }
}

// 4. Remove from Featured
const removeFromFeatured = async (id: number) => {
  if(!confirm('本当に削除しますか？ (Are you sure?)')) return
  try {
    await $fetch('/api/admin/featured', {
      method: 'DELETE',
      body: { id }
    })
    await fetchFeatured() // Refresh list
  } catch (e) {
    alert('削除中にエラーが発生しました')
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
/* Scrollbar tùy chỉnh cho đẹp trên nền tối */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46; /* zinc-700 */
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b; /* zinc-600 */
}
</style>