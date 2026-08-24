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

      <div v-else>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <MovieCard v-for="movie in movies" :key="movie.id" :item="movie" />
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

// Gọi API linh hoạt tùy theo vai trò
const { data: moviesData, pending } = await useFetch('/api/movies', {
  params: {
    // Nếu là đạo diễn thì truyền param 'director', nếu không thì truyền 'cast'
    ...(isDirector ? { director: personName.value } : { cast: personName.value }),
    pageSize: 50,
    sort: 'year_desc'
  }
})

const movies = computed(() => moviesData.value?.items || [])

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