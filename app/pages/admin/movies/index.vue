<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 block">
            &larr; 管理画面に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">映画管理 (Movies)</h1>
        </div>
        <NuxtLink 
          to="/admin/movies/new" 
          class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
        >
          <span>＋</span> 新規登録
        </NuxtLink>
      </div>

      <div class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
        <div class="p-4 border-b border-white/5">
          <input 
            v-model="keyword" 
            @keydown.enter="handleSearch"
            type="text" 
            placeholder="タイトルで検索..." 
            class="w-full max-w-sm bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 outline-none"
          >
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <th class="px-6 py-4 font-medium w-16">Image</th>
                <th class="px-6 py-4 font-medium">Title</th>
                <th class="px-6 py-4 font-medium">Year</th>
                <th class="px-6 py-4 font-medium">Country</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-if="pending" class="bg-black/20">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
              <tr v-else-if="movies.length === 0" class="bg-black/20">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">
                  データがありません (No Data)
                </td>
              </tr>
              <tr 
                v-for="movie in movies" 
                :key="movie.id" 
                class="hover:bg-white/5 transition-colors group"
              >
                <td class="px-6 py-3">
                  <div class="h-10 w-7 overflow-hidden rounded bg-zinc-800">
                    <img 
                      v-if="movie.thumbnail" 
                      :src="movie.thumbnail" 
                      class="h-full w-full object-cover"
                      loading="lazy"
                    >
                  </div>
                </td>
                <td class="px-6 py-3 font-medium text-white">
                  <div class="truncate max-w-xs">{{ movie.title }}</div>
                  <div class="text-[10px] text-zinc-500 truncate max-w-xs">{{ movie.originalTitle }}</div>
                </td>
                <td class="px-6 py-3 text-zinc-400">
                  {{ movie.year }}
                </td>
                <td class="px-6 py-3 text-zinc-400">
                  {{ movie.country }}
                </td>
                <td class="px-6 py-3 text-right">
                  <NuxtLink 
                    :to="`/admin/movies/${movie.id}`"
                    class="inline-flex items-center gap-1 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-emerald-600 hover:text-white transition"
                  >
                    編集 (Edit)
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-center gap-4 p-4 border-t border-white/5" v-if="total > 20">
          <button 
            @click="page--" 
            :disabled="page <= 1"
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50"
          >
            Prev
          </button>
          <span class="text-xs text-zinc-500">Page {{ page }}</span>
          <button 
            @click="page++" 
            :disabled="movies.length < 20" 
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFetch, definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin'
})

const page = ref(1)
const keyword = ref('')

// Tận dụng API public search để lấy list phim
// Lưu ý: API này đang filter type=movie/series. 
// Ta cần truyền type='movie' để chỉ lấy phim lẻ.
const { data, pending, refresh } = await useFetch('/api/movies', {
  params: {
    page,
    q: keyword,
    type: 'movie', // Chỉ lấy Movie
    sort: 'created_at', // Mới nhất lên đầu
    pageSize: 20
  },
  watch: [page] // Tự động fetch lại khi đổi trang
})

const movies = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

const handleSearch = () => {
  page.value = 1
  refresh()
}
</script>