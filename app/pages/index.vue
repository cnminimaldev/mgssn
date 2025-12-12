<template>
  <div class="min-h-screen bg-[#05060a] text-white overflow-x-hidden">
    <main>
      <section class="relative h-[85vh] w-full overflow-hidden">
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-105"
          :style="heroBackgroundStyle"
        ></div>

        <div
          class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/20 to-transparent"
        ></div>

        <div
          class="relative flex h-full flex-col justify-center px-4 sm:px-12 lg:px-20 pt-20"
        >
          <div class="max-w-2xl animate-fade-up" v-if="heroMovie">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg shadow-emerald-900/50 backdrop-blur-md"
              >
                PICK UP
              </span>
              <span
                v-if="heroMovie.type === 'series'"
                class="bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg"
              >
                SERIES
              </span>
            </div>

            <h1
              class="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400"
            >
              {{ heroMovie.title }}
            </h1>

            <div
              class="mt-6 flex items-center gap-4 text-sm font-medium text-zinc-300"
            >
              <span class="text-emerald-400 font-bold">{{
                heroMovie.year
              }}</span>
              <span class="w-1 h-1 rounded-full bg-zinc-600"></span>
              <span>{{ heroMovie.genre }}</span>
              <span class="w-1 h-1 rounded-full bg-zinc-600"></span>
              <span
                class="border border-zinc-500 px-1.5 rounded text-[10px] tracking-wider"
                >HD</span
              >
            </div>

            <p
              class="mt-6 line-clamp-3 text-sm text-zinc-300 sm:text-lg sm:leading-relaxed max-w-xl drop-shadow-md"
            >
              {{ heroMovie.description }}
            </p>

            <div class="mt-8 flex flex-wrap gap-4">
              <NuxtLink
                :to="
                  heroMovie.type === 'series'
                    ? `/series/${heroMovie.slug}`
                    : `/movie/${heroMovie.slug}`
                "
                class="group flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-base font-bold text-black hover:bg-zinc-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-6 h-6 transition-transform group-hover:scale-110"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clip-rule="evenodd"
                  />
                </svg>
                再生
              </NuxtLink>

              <button
                type="button"
                class="group flex items-center gap-3 rounded-full bg-white/10 px-8 py-3.5 text-base font-bold text-white hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
                @click="toggleHeroList"
              >
                <span
                  v-if="isInMyList(heroMovie.id, heroMovie.type)"
                  class="text-emerald-400"
                  >✔</span
                >
                <span v-else class="text-xl leading-none font-light">＋</span>
                <span>マイリスト</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="relative z-20 -mt-16 px-4 sm:px-12 lg:px-20 mb-12">
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="g in genreList"
            :key="g.slug"
            :to="`/search?genres=${g.slug}`"
            class="rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/30 transition shadow-lg"
          >
            {{ g.label }}
          </NuxtLink>
        </div>
      </section>

      <section v-if="error" class="px-4 sm:px-12 lg:px-20 mb-8">
        <div
          class="rounded-xl border border-red-500/20 bg-red-900/10 p-4 text-sm text-red-400 text-center"
        >
          データの読み込みに失敗しました。再読み込みしてください。
        </div>
      </section>

      <div class="space-y-12 pb-20">
        <ClientOnly>
          <section
            v-if="!hasError && hasContinueWatching"
            class="px-4 sm:px-12 lg:px-20"
          >
            <MovieRow
              title="視聴中の作品"
              :movies="continueMovies"
              sub-label="続きから再生"
              view-all-link="/my-list"
            />
          </section>
        </ClientOnly>

        <section class="px-4 sm:px-12 lg:px-20">
          <SkeletonMovieRow v-if="pending" title="注目の作品" />
          <MovieRow
            v-else-if="featuredMovies.length"
            title="注目の作品"
            :movies="featuredMovies"
            sub-label="MugenTVのおすすめ"
            view-all-link="/search"
          />
        </section>

        <section class="px-4 sm:px-12 lg:px-20">
          <SkeletonMovieRow v-if="pending" title="新着の作品" />
          <MovieRow
            v-else-if="newMovies.length"
            title="新着の作品"
            :movies="newMovies"
            sub-label="最近追加された作品"
            view-all-link="/search?sort=year_desc"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useSeoMeta, useFetch, useAsyncData } from "#imports";
import MovieRow from "~/components/MovieRow.vue";
import SkeletonMovieRow from "~/components/SkeletonMovieRow.vue";
import { useContinueWatching } from "~/composables/useContinueWatching";
import { useMyList } from "~/composables/useMyList";

// -- Types --
type ApiMovie = {
  id: number;
  type: "movie" | "series";
  slug: string;
  title: string;
  description?: string;
  thumbnail: string;
  bannerUrl?: string;
  posterUrl?: string;
  year: number;
  genre: string;
  episodeCount?: number;
};

type MoviesResponse = {
  items: ApiMovie[];
};

type FiltersResponse = {
  genres: { slug: string; label: string }[];
};

// -- SEO --
useSeoMeta({
  title: "無限TV - 映画・ドラマ・アニメ見放題",
  description:
    "最新の映画、ドラマ、アニメを高品質で無料ストリーミング。登録不要ですぐに見られます。",
});

// -- 1. Fetch Genres --
// [FIX] Sử dụng @ts-ignore để vô hiệu hóa kiểm tra type đệ quy của Nuxt cho route này
const { data: filterData } = await useAsyncData<FiltersResponse>(
  "home-filters",
  () =>
    // @ts-ignore
    $fetch("/api/movies/filters")
);
const genreList = computed(() => filterData.value?.genres || []);

// -- 2. Fetch Movies --
const {
  data: moviesData,
  pending,
  error,
} = await useFetch<MoviesResponse>("/api/movies", {
  params: {
    sort: "recommended",
    pageSize: 50,
  },
});

const hasError = computed(() => !!error.value);
const allMovies = computed(() => moviesData.value?.items ?? []);

const featuredMovies = computed(() => allMovies.value.slice(0, 12));
const newMovies = computed(() =>
  [...allMovies.value].sort((a, b) => b.year - a.year).slice(0, 12)
);

// -- Hero Logic --
const heroMovie = ref<ApiMovie | undefined>(undefined);

onMounted(() => {
  if (allMovies.value.length > 0) {
    const randomIdx = Math.floor(
      Math.random() * Math.min(10, allMovies.value.length)
    );
    heroMovie.value = allMovies.value[randomIdx];
  }
});

const heroBackgroundStyle = computed(() => {
  if (!heroMovie.value)
    return { backgroundImage: "linear-gradient(to bottom, #000, #000)" };
  const bg = heroMovie.value.bannerUrl || heroMovie.value.thumbnail;
  return { backgroundImage: `url(${bg})` };
});

// -- My List Logic --
const { isInMyList, toggleMyList } = useMyList();
const toggleHeroList = () => {
  if (heroMovie.value) {
    toggleMyList(heroMovie.value.id, heroMovie.value.type);
  }
};

// -- Continue Watching Logic --
const { sorted: continueList } = useContinueWatching();
const continueMovies = computed<ApiMovie[]>(() => {
  if (!continueList.value.length || !allMovies.value.length) return [];
  const map = new Map<number, ApiMovie>();
  for (const m of allMovies.value) {
    map.set(m.id, m);
  }
  return continueList.value
    .map((item) => map.get(item.movieId))
    .filter((m): m is ApiMovie => !!m);
});

const hasContinueWatching = computed(() => continueMovies.value.length > 0);
</script>

<style scoped>
/* Animation Fade Up */
.animate-fade-up {
  animation: fadeUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
