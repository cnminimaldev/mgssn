<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white pt-20 px-4 pb-12 sm:px-8">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8">
        <div class="flex items-center gap-2 text-xs text-zinc-400 mb-2">
          <NuxtLink to="/" class="hover:text-white">ホーム</NuxtLink>
          <span>/</span>
          <span>ジャンル</span>
        </div>
        <h1 class="text-3xl font-bold capitalize sm:text-4xl text-emerald-400">
          {{ genreLabel }}
        </h1>
        <p class="mt-2 text-zinc-400 text-sm">
          {{ genreLabel }}の映画・ドラマ一覧
        </p>
      </header>

      <div v-if="pending" class="py-20 text-center text-zinc-400">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <div v-else-if="!movies.length" class="py-20 text-center text-zinc-400">
        このジャンルの作品はまだありません。
      </div>

      <div v-else>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <MovieCard v-for="movie in movies" :key="movie.id" :item="movie" />
        </div>
        
        <div v-if="movies.length >= 24" class="mt-10 text-center">
           <NuxtLink :to="`/search?genres=${currentSlug}`" class="inline-block rounded-full border border-zinc-700 px-6 py-2 text-sm hover:bg-zinc-800 transition">
             もっと見る
           </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useFetch, useSeoMeta, useHead, useAsyncData, useRequestURL } from '#imports'
import MovieCard from '~/components/MovieCard.vue'

const route = useRoute()
const url = useRequestURL()
const currentSlug = computed(() => String(route.params.slug))

// 1. Lấy tên hiển thị của Genre (Map từ Slug -> Label)
// Gọi API filters để lấy danh sách genre map ra tên đẹp (VD: action -> アクション)
const { data: filterData } = await useAsyncData('genres-list', () => $fetch('/api/movies/filters'))

const genreLabel = computed(() => {
  const g = filterData.value?.genres.find((x: any) => x.slug === currentSlug.value)
  return g ? g.label : currentSlug.value // Fallback về slug nếu không tìm thấy
})

// 2. Fetch Movies theo Genre
const { data: moviesData, pending } = await useFetch('/api/movies', {
  params: {
    genres: currentSlug.value,
    pageSize: 24,
    sort: 'recommended' // Hoặc 'created_at' để lấy phim mới nhất
  }
})

const movies = computed(() => moviesData.value?.items || [])

// 3. SEO Meta & Schema
const title = computed(() => `${genreLabel.value} 映画・ドラマ 無料視聴 | MugenTV`)
const desc = computed(() => `${genreLabel.value}の最新・人気映画やドラマを無料で視聴。`)

useSeoMeta({
  title,
  description: desc,
  ogTitle: title,
  ogDescription: desc
})

useHead({
  link: [{ rel: 'canonical', href: `${url.origin}/genres/${currentSlug.value}` }],
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title.value,
      "description": desc.value,
      "url": `${url.origin}/genres/${currentSlug.value}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": url.origin },
          { "@type": "ListItem", "position": 2, "name": genreLabel.value, "item": `${url.origin}/genres/${currentSlug.value}` }
        ]
      }
    }))
  }]
})
</script>