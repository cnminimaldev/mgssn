<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white">
    <section class="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <!-- Tiêu đề -->
      <header class="mb-4 sm:mb-6">
        <p
          class="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 sm:text-xs"
        >
          作品を探す
        </p>
        <h1
          class="mt-1 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
        >
          検索 & フィルター
        </h1>
        <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
          タイトル・原題・かな、ジャンル、国・地域、公開年などで絞り込みできます。
        </p>
      </header>

      <!-- Khu vực filter -->
      <div
        class="mb-8 rounded-xl border border-white/5 bg-zinc-950/60 p-4 shadow-xl shadow-black/40 sm:p-5"
      >
        <!-- Hàng trên: keyword + năm + sort + reset -->
        <div
          class="flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-1 flex-col gap-2 sm:flex-row">
            <div class="flex-1">
              <label class="mb-1 block text-[11px] text-zinc-400 sm:text-xs">
                キーワード
              </label>
              <input
                v-model="keyword"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="例: Frozen / アナと雪の女王 / あなとゆきのじょおう"
              />
            </div>

            <div class="flex gap-2 sm:w-64">
              <div class="flex-1">
                <label class="mb-1 block text-[11px] text-zinc-400 sm:text-xs">
                  公開年
                </label>
                <select
                  v-model="selectedYear"
                  class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="">すべて</option>
                  <option v-for="y in yearOptions" :key="y" :value="String(y)">
                    {{ y }}年
                  </option>
                </select>
              </div>

              <div class="flex-1">
                <label class="mb-1 block text-[11px] text-zinc-400 sm:text-xs">
                  並び替え
                </label>
                <select
                  v-model="sortKey"
                  class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="recommended">おすすめ順</option>
                  <option value="year_desc">新しい順</option>
                  <option value="year_asc">古い順</option>
                  <option value="title_asc">タイトル順</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-end justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-zinc-600 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-300 sm:text-sm"
              @click="resetFilters"
            >
              リセット
            </button>
            <button
              type="button"
              class="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 sm:text-sm"
              @click="forceRefresh"
            >
              検索
            </button>
          </div>
        </div>

        <!-- Hàng dưới: genre + country -->
        <div class="mt-4 flex flex-col gap-4 sm:flex-row">
          <!-- Genre -->
          <div class="flex-1">
            <div class="mb-2 flex items-center justify-between">
              <label class="text-[11px] text-zinc-400 sm:text-xs">
                ジャンル（複数選択可）
              </label>
              <button
                type="button"
                class="text-[10px] text-emerald-300 hover:text-emerald-200 sm:text-xs"
                @click="selectedGenres = []"
              >
                クリア
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <!-- "Tất cả" -->
              <button
                type="button"
                class="rounded-full border px-3 py-1 text-[11px] transition sm:text-xs"
                :class="
                  selectedGenres.length === 0
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
                "
                @click="selectedGenres = []"
              >
                すべて
              </button>

              <!-- Genre chips -->
              <button
                v-for="g in genreOptions"
                :key="g.slug"
                type="button"
                class="rounded-full border px-3 py-1 text-[11px] transition sm:text-xs"
                :class="
                  selectedGenres.includes(g.slug)
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
                "
                @click="toggleGenre(g.slug)"
              >
                {{ g.label }}
              </button>
            </div>
          </div>

          <!-- Country -->
          <div class="flex-1">
            <div class="mb-2 flex items-center justify-between">
              <label class="text-[11px] text-zinc-400 sm:text-xs">
                国・地域（複数選択可）
              </label>
              <button
                type="button"
                class="text-[10px] text-emerald-300 hover:text-emerald-200 sm:text-xs"
                @click="selectedCountries = []"
              >
                クリア
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <!-- "Tất cả" -->
              <button
                type="button"
                class="rounded-full border px-3 py-1 text-[11px] transition sm:text-xs"
                :class="
                  selectedCountries.length === 0
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
                "
                @click="selectedCountries = []"
              >
                すべて
              </button>

              <!-- Country chips -->
              <button
                v-for="c in countryOptions"
                :key="c.code"
                type="button"
                class="rounded-full border px-3 py-1 text-[11px] transition sm:text-xs"
                :class="
                  selectedCountries.includes(c.code)
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
                "
                @click="toggleCountry(c.code)"
              >
                {{ c.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Kết quả -->
      <div v-if="pending" class="py-10 text-sm text-zinc-400">検索中…</div>

      <div v-else-if="error" class="py-10 text-sm text-red-400">
        エラーが発生しました: {{ error.message }}
      </div>

      <div v-else>
        <p class="mb-4 text-xs text-zinc-400 sm:text-sm">
          検索結果:
          <span class="font-semibold text-zinc-50">{{ total }}</span>
          件
        </p>

        <div
          v-if="movies.length"
          class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <NuxtLink
            v-for="movie in movies"
            :key="movie.id"
            :to="`/movie/${movie.id}`"
            class="group"
          >
            <div
              class="aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 transition group-hover:ring-2 group-hover:ring-emerald-500/80"
            >
              <img
                :src="movie.thumbnail"
                :alt="movie.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="mt-2 text-xs text-zinc-400">
              <div class="line-clamp-1 text-sm font-medium text-zinc-50">
                {{ movie.title }}
              </div>
              <div
                v-if="movie.originalTitle"
                class="line-clamp-1 text-[11px] text-zinc-300"
              >
                {{ movie.originalTitle }}
              </div>
              <div class="mt-1 flex items-center gap-2">
                <span v-if="movie.year" class="text-[11px]">
                  {{ movie.year }}年
                </span>
                <span
                  v-if="movie.country"
                  class="rounded bg-white/10 px-1.5 py-0.5 text-[10px]"
                >
                  {{ movie.country }}
                </span>
                <span
                  v-if="movie.genre"
                  class="rounded bg-white/5 px-1.5 py-0.5 text-[10px]"
                >
                  {{ movie.genre }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-else class="py-10 text-sm text-zinc-400">
          一致する作品が見つかりませんでした。
        </p>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-8 flex items-center justify-center gap-4 text-sm"
        >
          <button
            type="button"
            class="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-100 hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page <= 1"
            @click="page--"
          >
            前へ
          </button>

          <span class="text-xs text-zinc-400">
            ページ
            <span class="text-zinc-100">{{ page }}</span>
            /
            <span class="text-zinc-100">{{ totalPages }}</span>
          </span>

          <button
            type="button"
            class="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-100 hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page >= totalPages"
            @click="page++"
          >
            次へ
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAsyncData } from "#imports";
import type { Movie } from "~/data/movies";

type MoviesResponse = {
  items: Movie[];
  total: number;
  page: number;
  pageSize: number;
};

type FiltersResponse = {
  genres: { slug: string; label: string }[];
  countries: { code: string; label: string }[];
  years: number[];
};

// --- state filter ---
const keyword = ref("");
const selectedGenres = ref<string[]>([]);
const selectedCountries = ref<string[]>([]);
const selectedYear = ref<string>("");

const sortKey = ref<"recommended" | "year_desc" | "year_asc" | "title_asc">(
  "recommended"
);

const page = ref(1);
const pageSize = ref(24);

// --- filter options ---
const { data: filtersData } = await useAsyncData<FiltersResponse>(
  "movies-filters",
  () => $fetch("/api/movies/filters")
);

const genreOptions = computed(() => filtersData.value?.genres ?? []);
const countryOptions = computed(() => filtersData.value?.countries ?? []);
const yearOptions = computed(() => filtersData.value?.years ?? []);

// --- query params gửi xuống /api/movies ---
const filters = computed(() => ({
  q: keyword.value || undefined,
  sort: sortKey.value !== "recommended" ? sortKey.value : undefined,
  page: page.value,
  pageSize: pageSize.value,
  genres:
    selectedGenres.value.length > 0
      ? selectedGenres.value.join(",")
      : undefined,
  countries:
    selectedCountries.value.length > 0
      ? selectedCountries.value.join(",")
      : undefined,
  year: selectedYear.value || undefined,
}));

// --- gọi API /api/movies ---
const { data, pending, error, refresh } = await useAsyncData<MoviesResponse>(
  "search-movies",
  () => $fetch("/api/movies", { params: filters.value }),
  {
    watch: [filters],
  }
);

const movies = computed<Movie[]>(() => data.value?.items ?? []);
const total = computed<number>(() => data.value?.total ?? 0);

const totalPages = computed(() => {
  const t = total.value;
  const size = pageSize.value;
  if (t <= 0) return 1;
  return Math.max(1, Math.ceil(t / size));
});

// Khi keyword / sort / filter đổi, quay về page 1
watch(
  [keyword, sortKey, selectedGenres, selectedCountries, selectedYear],
  () => {
    page.value = 1;
  }
);

const toggleGenre = (slug: string) => {
  const index = selectedGenres.value.indexOf(slug);
  if (index === -1) {
    selectedGenres.value.push(slug);
  } else {
    selectedGenres.value.splice(index, 1);
  }
};

const toggleCountry = (c: string) => {
  const index = selectedCountries.value.indexOf(c);
  if (index === -1) {
    selectedCountries.value.push(c);
  } else {
    selectedCountries.value.splice(index, 1);
  }
};

const forceRefresh = () => {
  page.value = 1;
  refresh();
};

const resetFilters = () => {
  keyword.value = "";
  selectedGenres.value = [];
  selectedCountries.value = [];
  selectedYear.value = "";
  sortKey.value = "recommended";
  page.value = 1;
};
</script>
