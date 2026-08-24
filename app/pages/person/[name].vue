<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white pt-20 px-4 pb-12 sm:px-8">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8 flex items-center gap-4">
        <div class="h-16 w-16 flex items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-zinc-500 shadow-inner">
          {{ personName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <div class="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <NuxtLink to="/" class="hover:text-white">ホーム</NuxtLink>
            <span>/</span>
            <span>人物</span>
          </div>
          <h1 class="text-3xl font-bold sm:text-4xl text-zinc-100">
            {{ personName }}
          </h1>
          <p class="mt-1 text-zinc-400 text-sm">
            出演・監督作品
          </p>
        </div>
      </header>

      <div v-if="pending" class="py-20 text-center text-zinc-400">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <div v-else-if="!movies.length" class="py-20 text-center text-zinc-400">
        関連作品は見つかりませんでした。
      </div>

      <!-- Danh sách phim -->
      <div v-else>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <MovieCard v-for="movie in movies" :key="movie.id" :item="movie" />
        </div>

        <!-- [THÊM MỚI] Khu vực hiển thị nút phân trang nếu tổng số trang > 1 -->
        <div v-if="totalPages > 1" class="mt-10 flex justify-center gap-2">
          <NuxtLink
            v-for="p in totalPages"
            :key="p"
            :to="{ query: { ...route.query, page: p } }"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="p === currentPage ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'"
          >
            {{ p }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useFetch, useSeoMeta, useHead, useRequestURL } from '#imports'
import MovieCard from '~/components/MovieCard.vue'

const route = useRoute()
const url = useRequestURL()

// Kiểm tra xem trang này đang xem với tư cách là đạo diễn hay diễn viên
const isDirector = route.query.role === 'director'

// Decode tên từ URL (vd: Tom%20Cruise -> Tom Cruise)
const personName = computed(() => decodeURIComponent(String(route.params.name)))

// Lấy số trang hiện tại từ URL query (mặc định là 1)
const currentPage = computed(() => {
  const p = Number(route.query.page)
  return Number.isFinite(p) && p > 0 ? p : 1
})

const pageSize = 24 // Đồng bộ pageSize giống các trang khác cho đẹp mắt

// Gọi API có truyền page và pageSize động
const { data: moviesData, pending } = await useFetch('/api/movies', {
  params: {
    ...(isDirector ? { director: personName.value } : { cast: personName.value }),
    page: currentPage.value,
    pageSize: pageSize,
    sort: 'year_desc'
  },
  watch: [currentPage] // Tự động gọi lại API khi người dùng đổi trang
})

const movies = computed(() => moviesData.value?.items || [])
const totalItems = computed(() => moviesData.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))

// SEO Meta & Schema
const title = computed(() => `${personName.value} 出演・監督作品 (映画・ドラマ) | MugenTV`)
const desc = computed(() => `${personName.value}が出演、監督する映画やドラマの一覧。`)

useSeoMeta({
  title,
  description: desc,
  ogTitle: title,
  ogDescription: desc
})

useHead({
  link: [{ rel: 'canonical', href: `${url.origin}/person/${encodeURIComponent(personName.value)}` }],
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": personName.value,
      "url": `${url.origin}/person/${encodeURIComponent(personName.value)}`
    }))
  }]
})
</script>