<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white">
    <section class="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      
      <!-- PHẦN 1: Tiêu đề trang (Header) -->
      <header class="mb-8 border-b border-white/10 pb-6">
        <h1 class="flex items-center gap-3 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          <img v-if="countryFlag" :src="countryFlag" class="w-8 object-cover rounded shadow-sm border border-white/10" :alt="countryName" />
          {{ countryName }}作品
        </h1>
        <p class="mt-3 text-sm text-zinc-400">
          {{ countryName }}の映画やドラマをすべて網羅。最新作から名作まで、お気に入りの作品を見つけましょう。
        </p>
      </header>

      <!-- PHẦN 2: Phim Đang Chiếu (Ongoing) - Tự động ẩn nếu rỗng -->
      <div v-if="ongoingMovies.length > 0" class="mb-12 border-b border-white/10 pb-10">
        <!-- Chú ý: Ở đây bạn import và dùng MovieRow theo chuẩn component bạn đang có -->
        <MovieRow 
          title="放送中のシリーズ" 
          :movies="ongoingMovies" 
          sub-label="現在最新エピソードが更新されている作品" 
        />
      </div>

      <!-- PHẦN 3: Thanh tìm kiếm nội bộ -->
      <div class="mb-8">
        <div class="relative max-w-xl mx-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-zinc-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text" 
            :placeholder="`${countryName}作品から検索...`"
            class="block w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-zinc-900 transition-all outline-none"
          >
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- PHẦN 4: Danh sách tổng (Grid) -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">すべての作品</h2>
          <p class="text-sm text-zinc-400">
            全 <span class="font-bold text-white">{{ total }}</span> 作品
          </p>
        </div>

        <!-- Trạng thái Đang tải -->
        <div v-if="pending" class="py-20 text-center text-sm text-zinc-400 flex flex-col items-center justify-center">
          <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500"></div>
          <p>データを読み込んでいます...</p>
        </div>

        <!-- Trạng thái Lỗi hoặc Trống -->
        <div v-else-if="!movies.length" class="flex flex-col items-center justify-center py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-zinc-700 mb-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-zinc-400">作品が見つかりませんでした。</p>
        </div>

        <!-- Grid Danh sách -->
        <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="movie in movies" :key="movie.id" class="card-wrapper">
            <MovieCard :item="movie" />
          </div>
        </div>

        <!-- Phân trang -->
        <div v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-4 text-sm">
          <button
            class="rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            前へ
          </button>
          <span class="text-xs text-zinc-400">
            <span class="font-bold text-white">{{ page }}</span>
            <span class="mx-1">/</span>
            <span class="text-white">{{ totalPages }}</span>
          </span>
          <button
            class="rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            次へ
          </button>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, useSeoMeta, useAsyncData } from '#imports'

const route = useRoute()
const router = useRouter()

// 1. Xác định Quốc gia
const code = computed(() => String(route.params.code).toLowerCase())

const countryInfoMap: Record<string, { name: string, flag: string, dbCode: string }> = {
  kr: { name: '韓国', flag: 'https://flagcdn.com/kr.svg', dbCode: 'KR' },
  jp: { name: '日本', flag: 'https://flagcdn.com/jp.svg', dbCode: 'JP' },
  us: { name: '米国', flag: 'https://flagcdn.com/us.svg', dbCode: 'US' },
  cn: { name: '中国', flag: 'https://flagcdn.com/cn.svg', dbCode: 'CN' }
}

const countryData = computed(() => countryInfoMap[code.value] || { name: 'その他', flag: '🌐', dbCode: '' })
const countryName = computed(() => countryData.value.name)
const countryFlag = computed(() => countryData.value.flag)
const dbCountryCode = computed(() => countryData.value.dbCode)

useSeoMeta({
  title: computed(() => `${countryName.value}作品 - NoriTV`),
  description: computed(() => `${countryName.value}の映画やドラマをすべて網羅。最新作から名作まで。`),
})

// 2. State chung
const searchQuery = ref(String(route.query.q || ''))
const page = ref(Number(route.query.page) || 1)
const pageSize = 24

// --- FETCH 1: LẤY DANH SÁCH PHIM ĐANG CHIẾU (ONGOING) ---
// Khối này chỉ cần load 1 lần, không bị ảnh hưởng bởi thanh tìm kiếm hay phân trang
const { data: ongoingData } = await useAsyncData(
  `ongoing-${dbCountryCode.value}`,
  () => $fetch('/api/movies', {
    params: {
      countries: dbCountryCode.value,
      ongoing: 'true',
      type: 'series',
      sort: 'updated_at_desc',
      pageSize: 15 // Lấy 15 bộ mới nhất cho thanh trượt
    }
  })
)
const ongoingMovies = computed(() => ongoingData.value?.items ?? [])

// --- FETCH 2: LẤY DANH SÁCH TỔNG (GRID) ---
const apiParams = computed(() => ({
  countries: dbCountryCode.value,
  q: searchQuery.value || undefined, // Nếu rỗng thì API tự bỏ qua
  page: page.value,
  pageSize
}))

const { data: gridData, pending, error } = await useAsyncData(
  `movies-${dbCountryCode.value}`,
  () => $fetch('/api/movies', { params: apiParams.value }),
  {
    watch: [apiParams], // Tự động fetch lại khi param thay đổi
  }
)

const movies = computed(() => gridData.value?.items ?? [])
const total = computed(() => gridData.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

// --- ACTIONS ---
const handleSearch = () => {
  router.push({ path: route.path, query: { ...route.query, q: searchQuery.value, page: '1' } })
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const changePage = (newPage: number) => {
  router.push({ path: route.path, query: { ...route.query, page: String(newPage) } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.query.page,
  (newPageStr) => {
    page.value = Number(newPageStr) || 1
  }
)
</script>