<template>
  <div class="min-h-screen bg-black text-white">
    <main>
      <section
        class="relative h-[60vh] bg-cover bg-center sm:h-[65vh] lg:h-[70vh]"
        :style="heroBackgroundStyle"
      >
        <div
          class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
        ></div>

        <div
          class="relative flex h-full flex-col justify-center px-4 sm:px-8 lg:px-12"
        >
          <div class="max-w-xl" v-if="heroMovie">
            <p class="text-xs text-emerald-300 sm:text-sm font-bold tracking-wider mb-2">
              PICK UP
            </p>
            
            <h1
              class="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight drop-shadow-lg"
            >
              {{ heroMovie.title }}
            </h1>

            <div class="mt-3 flex items-center gap-3 text-xs sm:text-sm text-zinc-200">
              <span class="font-semibold">{{ heroMovie.year }}</span>
              <span class="border border-zinc-500 px-1 rounded text-[10px]">HD</span>
              <span>{{ heroMovie.genre }}</span>
            </div>

            <p class="mt-4 line-clamp-3 text-sm text-zinc-200 sm:text-base text-shadow-sm">
              {{ heroMovie.description }}
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink
                :to="heroMovie.type === 'series' ? `/series/${heroMovie.slug}` : `/movie/${heroMovie.slug}`"
                class="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 transition"
              >
                <span>▶</span> 再生
              </NuxtLink>

               <button
                type="button"
                class="flex items-center gap-2 rounded-full bg-zinc-800/80 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700/80 transition"
                @click="toggleHeroList"
              >
                <span v-if="isInMyList(heroMovie.id, heroMovie.type)">✔ マイリスト</span>
                <span v-else>+ マイリスト</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="error" class="px-4 pt-4 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl rounded-2xl border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">
          データの取得に失敗しました。
        </div>
      </section>

      <section class="px-4 pt-8 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-zinc-100 sm:text-base">
              ジャンルで探す
            </h2>
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <NuxtLink
              v-for="g in genreList"
              :key="g.slug"
              :to="`/search?genres=${g.slug}`"
              class="rounded-full bg-white/10 px-4 py-2 text-zinc-100 hover:bg-white/20 hover:text-white transition"
            >
              {{ g.label }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <ClientOnly>
        <section
          v-if="!hasError && hasContinueWatching"
          class="px-4 pt-8 sm:px-8 lg:px-12"
        >
          <div class="mx-auto max-w-6xl">
             <MovieRow
              title="視聴中の作品"
              :movies="continueMovies"
              sub-label="続きから再生"
              view-all-link="/my-list"
            />
          </div>
        </section>
      </ClientOnly>

      <section class="px-4 pt-8 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
          <SkeletonMovieRow v-if="pending" title="注目の作品" />
          <MovieRow
            v-else-if="featuredMovies.length"
            title="注目の作品"
            :movies="featuredMovies"
            sub-label="MugenTVのおすすめ"
            view-all-link="/search"
          />
        </div>
      </section>

      <section class="px-4 pb-12 pt-2 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
           <SkeletonMovieRow v-if="pending" title="新着の作品" />
          <MovieRow
            v-else-if="newMovies.length"
            title="新着の作品"
            :movies="newMovies"
            sub-label="最近追加された作品"
            view-all-link="/search?sort=year_desc"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSeoMeta, useFetch, useAsyncData } from '#imports'
import MovieRow from '~/components/MovieRow.vue'
import SkeletonMovieRow from '~/components/SkeletonMovieRow.vue'
import { useContinueWatching } from '~/composables/useContinueWatching'
import { useMyList } from '~/composables/useMyList'

// -- Types --
type ApiMovie = {
  id: number
  type: 'movie' | 'series'
  slug: string
  title: string
  description?: string
  thumbnail: string 
  bannerUrl?: string 
  posterUrl?: string
  year: number
  genre: string
  episodeCount?: number
}

type MoviesResponse = {
  items: ApiMovie[]
}

type FiltersResponse = {
  genres: { slug: string; label: string }[]
}

// -- SEO --
useSeoMeta({
  title: '無限TV 無料動画 - MugenTV.com',
  description: 'MugenTVで映画、ドラマ、アニメを見放題。',
})

// -- 1. Fetch Genres --
const { data: filterData } = await useAsyncData<FiltersResponse>('home-filters', () => 
  $fetch('/api/movies/filters')
)
const genreList = computed(() => filterData.value?.genres || [])

// -- 2. Fetch Movies --
const { data: moviesData, pending, error } = await useFetch<MoviesResponse>('/api/movies', {
  params: { 
    sort: 'recommended', 
    pageSize: 50
  }
})

// SỬA LỖI: Thêm định nghĩa hasError
const hasError = computed(() => !!error.value)

const allMovies = computed(() => moviesData.value?.items ?? [])

// A. Featured
const featuredMovies = computed(() => {
  return allMovies.value.slice(0, 12) 
})

// B. New Releases
const newMovies = computed(() => {
  return [...allMovies.value]
    .sort((a, b) => b.year - a.year)
    .slice(0, 12)
})

// -- Logic Hero Banner --
const heroMovie = ref<ApiMovie | undefined>(undefined)

onMounted(() => {
  if (allMovies.value.length > 0) {
    const randomIdx = Math.floor(Math.random() * Math.min(10, allMovies.value.length))
    heroMovie.value = allMovies.value[randomIdx]
  }
})

const heroBackgroundStyle = computed(() => {
  if (!heroMovie.value) return { backgroundImage: 'linear-gradient(to bottom, #000, #000)' }
  const bg = heroMovie.value.bannerUrl || heroMovie.value.thumbnail
  return { backgroundImage: `url(${bg})` }
})

// -- Logic My List --
const { isInMyList, toggleMyList } = useMyList()
const toggleHeroList = () => {
  if (heroMovie.value) {
    toggleMyList(heroMovie.value.id, heroMovie.value.type)
  }
}

// -- Logic Continue Watching --
const { sorted: continueList } = useContinueWatching()
const continueMovies = computed<ApiMovie[]>(() => {
  if (!continueList.value.length || !allMovies.value.length) return []
  
  const map = new Map<number, ApiMovie>()
  for (const m of allMovies.value) {
    map.set(m.id, m)
  }
  
  return continueList.value
    .map((item) => map.get(item.movieId))
    .filter((m): m is ApiMovie => !!m)
})

const hasContinueWatching = computed(() => continueMovies.value.length > 0)
</script>