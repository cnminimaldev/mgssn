<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <main class="px-4 py-6 sm:px-8 lg:px-12">
      <header class="max-w-6xl">
        <h1 class="text-xl font-bold tracking-tight sm:text-2xl">
          マイリスト
        </h1>
        <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
          あとで観たい作品や、お気に入りの作品をここにまとめておけます。
        </p>
      </header>

      <!-- Loading -->
      <div
        v-if="pending"
        class="mt-6 text-sm text-zinc-300"
      >
        読み込み中です…
      </div>

      <!-- Error -->
      <div
        v-else-if="hasError"
        class="mt-6 max-w-6xl rounded-2xl border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-100"
      >
        マイリストの情報を取得中に問題が発生しました。<br />
        お手数ですが、しばらく時間をおいてから再度お試しください。
      </div>

      <!-- Empty state -->
      <div
        v-else-if="myListMovies.length === 0"
        class="mt-8 max-w-6xl rounded-2xl bg-zinc-900/70 px-5 py-8 text-center text-sm text-zinc-300"
      >
        マイリストに登録されている作品はありません。<br class="hidden sm:block" />
        作品ページの「マイリスト」ボタンから追加できます。
      </div>

      <!-- Grid -->
      <div
        v-else
        class="mt-6 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <NuxtLink
          v-for="movie in myListMovies"
          :key="movie.id"
          :to="`/movie/${movie.id}`"
          class="group block overflow-hidden rounded-2xl bg-zinc-900/80 ring-1 ring-white/5 transition hover:ring-emerald-400/70"
        >
          <div class="aspect-[2/3] w-full overflow-hidden">
            <img
              :src="movie.thumbnail"
              :alt="movie.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div class="p-2">
            <p
              class="truncate text-xs text-zinc-100 sm:text-sm"
            >
              {{ movie.title }}
            </p>
            <p class="mt-0.5 text-[10px] text-zinc-400">
              {{ movie.year }}年・{{ movie.genre }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'
import type { Movie } from '~/data/movies'
import { useMyList } from '~/composables/useMyList'

// SEO cho trang My List
useSeoMeta({
  title: 'マイリスト - MyStream',
  description:
    'MyStreamのマイリストページ。あとで観たい作品やお気に入りの映画・ドラマ・アニメを一覧で確認できます。',
  ogTitle: 'マイリスト - MyStream',
  ogDescription:
    'MyStreamのマイリストで、お気に入りや視聴予定の作品をまとめて管理できます。',
})

const { myList } = useMyList()

// Lấy toàn bộ movies
const {
  data: moviesData,
  pending,
  error,
} = await useFetch<Movie[]>('/api/movies')

const hasError = computed(() => !!error.value)
const movies = computed<Movie[]>(() => moviesData.value ?? [])

// Filter theo ID trong myList
const myListMovies = computed<Movie[]>(() => {
  if (!myList.value.length || !movies.value.length) return []
  const idSet = new Set(myList.value)
  return movies.value.filter((m) => idSet.has(m.id))
})
</script>
