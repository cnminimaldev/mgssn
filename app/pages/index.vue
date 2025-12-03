<template>
  <div class="min-h-screen bg-black text-white">
    <main>
      <!-- HERO -->
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
          <div class="max-w-xl">
            <p class="text-xs text-emerald-300 sm:text-sm">
              日本向けオンライン動画配信サービス
            </p>
            <h1
              class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              観たい作品が、<br class="hidden sm:block" />
              すぐそこに。
            </h1>
            <p class="mt-3 text-sm text-zinc-200 sm:text-base">
              話題の映画やドラマ、アニメを、シンプルで見やすいUIでいつでもどこでも視聴できます。
            </p>

            <div class="mt-5 flex flex-wrap gap-3">
              <NuxtLink
                to="/search"
                class="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                作品を探す
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="rounded-full bg-zinc-800/80 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700/80"
              >
                ログイン / 新規登録
              </NuxtLink>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 text-[11px] text-zinc-300">
              <span class="rounded-full bg-white/5 px-2 py-0.5">
                高画質ストリーミング
              </span>
              <span class="rounded-full bg-white/5 px-2 py-0.5">
                広告なし（プランによる）
              </span>
              <span class="rounded-full bg-white/5 px-2 py-0.5">
                マルチデバイス対応
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ERROR BOX (nếu fetch lỗi) -->
      <section
        v-if="hasError"
        class="px-4 pt-4 sm:px-8 lg:px-12"
      >
        <div
          class="mx-auto max-w-6xl rounded-2xl border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-100"
        >
          作品データの取得中に問題が発生しました。<br />
          お手数ですが、しばらく時間をおいてから再度お試しください。
        </div>
      </section>

      <!-- CONTINUE WATCHING -->
      <section
        v-if="!hasError && hasContinueWatching"
        class="px-4 pt-6 sm:px-8 lg:px-12"
      >
        <MovieRow
          title="視聴中の作品"
          :movies="continueMovies"
        />
      </section>

      <!-- GENRE CHIPS -->
      <section class="px-4 pt-6 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-zinc-100 sm:text-base">
              ジャンルで探す
            </h2>
          </div>
          <p class="mt-1 text-[11px] text-zinc-400">
            気分にあわせて、おすすめの作品をチェック
          </p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              v-for="genre in genreChips"
              :key="genre"
              type="button"
              class="rounded-full bg-white/5 px-3 py-1 text-zinc-100 hover:bg-white/10"
            >
              {{ genre }}
            </button>
          </div>
        </div>
      </section>

      <!-- NEW RELEASES -->
      <section class="px-4 pt-6 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
          <SkeletonMovieRow
            v-if="pending && !hasError"
            title="新着の作品"
          />
          <MovieRow
            v-else-if="!hasError && newMovies.length"
            title="新着の作品"
            :movies="newMovies"
          />
        </div>
      </section>

      <!-- POPULAR -->
      <section class="px-4 pb-10 pt-4 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-6xl">
          <SkeletonMovieRow
            v-if="pending && !hasError"
            title="人気の作品"
          />
          <MovieRow
            v-else-if="!hasError && popularMovies.length"
            title="人気の作品"
            :movies="popularMovies"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'
import MovieRow from '~/components/MovieRow.vue'
import SkeletonMovieRow from '~/components/SkeletonMovieRow.vue'
import type { Movie } from '~/data/movies'
import { useContinueWatching } from '~/composables/useContinueWatching'

// SEO cho trang Home (tiếng Nhật)
useSeoMeta({
  title: 'ホーム - MyStream',
  description:
    'MyStream（マイストリーム）は、日本向けのオンライン動画配信サービスです。人気映画やドラマ、アニメをシンプルで見やすいUIでお楽しみいただけます。',
  ogTitle: 'MyStream - オンライン動画配信サービス',
  ogDescription:
    '日本向けのオンライン動画配信サービスMyStream。映画・ドラマ・アニメを高画質で視聴できます。',
})

type MoviesResponse = {
  items: Movie[]
  total: number
  page: number
  pageSize: number
}

// Lấy danh sách phim
const {
  data: moviesData,
  pending,
  error,
} = await useFetch<MoviesResponse>('/api/movies')

const hasError = computed(() => !!error.value)

const movies = computed<Movie[]>(() => moviesData.value?.items ?? [])

// Phim hero (lấy phim đầu tiên, hoặc undefined)
const heroMovie = computed<Movie | undefined>(() => movies.value[0])

const heroBackgroundStyle = computed(() => {
  if (!heroMovie.value) {
    return { backgroundImage: 'linear-gradient(to bottom, #000, #000)' }
  }
  return {
    backgroundImage: `url(${heroMovie.value.thumbnail})`,
  }
})

// New releases: năm >= 2023
const newMovies = computed<Movie[]>(() =>
  movies.value.filter((m) => m.year >= 2023).slice(0, 12),
)

// Popular: tạm thời lấy top N
const popularMovies = computed<Movie[]>(() => movies.value.slice(0, 12))

// Continue Watching → map sang Movie
const { sorted: continueList } = useContinueWatching()

const continueMovies = computed<Movie[]>(() => {
  if (!continueList.value.length || !movies.value.length) return []
  const map = new Map<number, Movie>()
  for (const m of movies.value) {
    map.set(m.id, m)
  }
  return continueList.value
    .map((item) => map.get(item.movieId))
    .filter((m): m is Movie => !!m)
})

const hasContinueWatching = computed(
  () => continueMovies.value.length > 0,
)

// Genre chips (hiển thị UI, chưa cần logic filter thật)
const genreChips = [
  'すべて',
  'アクション',
  'サスペンス',
  'SF',
  'ミステリー',
  'ドラマ',
  'ラブストーリー',
  'ホラー',
  'サイバーパンク',
  'アニメ',
]
</script>
