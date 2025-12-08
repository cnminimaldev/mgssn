<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <main class="px-4 py-6 sm:px-8 lg:px-12">
      <header class="max-w-6xl">
        <div class="flex items-end justify-between">
          <div>
            <h1 class="text-xl font-bold tracking-tight sm:text-2xl">
              マイリスト
            </h1>
            <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
              あとで観たい作品や、お気に入りの作品をここにまとめておけます。
              <span class="ml-2 text-zinc-500">({{ totalItems }}/50)</span>
            </p>
          </div>
        </div>
      </header>

      <div
        v-if="pending"
        class="mt-6 text-sm text-zinc-300"
      >
        読み込み中です…
      </div>

      <div
        v-else-if="error"
        class="mt-6 max-w-6xl rounded-2xl border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-100"
      >
        マイリストの情報を取得中に問題が発生しました。<br />
        お手数ですが、しばらく時間をおいてから再度お試しください。
      </div>

      <div
        v-else-if="myListItems.length === 0"
        class="mt-8 max-w-6xl rounded-2xl bg-zinc-900/70 px-5 py-8 text-center text-sm text-zinc-300"
      >
        マイリストに登録されている作品はありません。<br class="hidden sm:block" />
        作品ページの「マイリスト」ボタンから追加できます。
      </div>

      <div
        v-else
        class="mt-6 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="item in myListItems"
          :key="`${item.type}-${item.id}`"
          class="group relative"
        >
          <button
            class="absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-zinc-400 shadow-sm ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-red-500 hover:text-white hover:scale-110 sm:h-8 sm:w-8"
            title="リストから削除"
            @click.prevent="handleRemove(item.id, item.type)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          <NuxtLink
            :to="item.type === 'series' ? `/series/${item.slug}` : `/movie/${item.slug}`"
            class="block relative overflow-hidden rounded-2xl bg-zinc-900/80 ring-1 ring-white/5 transition group-hover:ring-emerald-400/70"
          >
            <div class="aspect-[2/3] w-full overflow-hidden">
              <img
                :src="item.posterUrl || item.thumbnail || '/images/fallback-poster.webp'"
                :alt="item.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              <div class="absolute top-2 left-2 flex flex-col items-start gap-1">
                <span 
                  v-if="item.type === 'series'"
                  class="rounded bg-indigo-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm"
                >
                  SERIES
                </span>
                <span 
                  v-else
                  class="rounded bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm"
                >
                  MOVIE
                </span>
              </div>
            </div>

            <div class="p-2">
              <p class="truncate text-xs text-zinc-100 sm:text-sm">
                {{ item.title }}
              </p>
              <p class="mt-0.5 text-[10px] text-zinc-400">
                {{ item.year }}年・{{ item.genre }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta, useFetch } from '#imports'
import { useMyList } from '~/composables/useMyList'

// Type khớp với API movies.get.ts
type ApiItem = {
  id: number
  type: 'movie' | 'series'
  slug: string
  title: string
  thumbnail: string
  posterUrl: string
  year: number
  genre: string
}

type MoviesResponse = {
  items: ApiItem[]
}

useSeoMeta({
  title: 'マイリスト - MugenTV.com',
  description: 'MyStreamのマイリストページ。',
})

const { movieIds, seriesIds, toggleMyList } = useMyList()

// Lấy toàn bộ phim để filter client-side
const { data: moviesData, pending, error } = await useFetch<MoviesResponse>('/api/movies', {
  params: { pageSize: 1000 }
})

const myListItems = computed(() => {
  const allItems = moviesData.value?.items ?? []
  
  return allItems.filter((item) => {
    if (item.type === 'series') {
      return seriesIds.value.includes(item.id)
    } else {
      return movieIds.value.includes(item.id)
    }
  })
})

const totalItems = computed(() => myListItems.value.length)

const handleRemove = async (id: number, type: 'movie' | 'series') => {
  if (confirm('この作品をマイリストから削除しますか？')) { // "Bạn có chắc muốn xóa phim này khỏi danh sách?"
    await toggleMyList(id, type)
  }
}
</script>