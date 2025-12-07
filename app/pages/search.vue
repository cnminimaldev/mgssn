<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white">
    <section class="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header class="mb-4 sm:mb-6">
        <p
          class="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 sm:text-xs"
        >
          作品を探す
        </p>
        <h1
          class="mt-1 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
        >
          <span v-if="keyword">「{{ keyword }}」の検索結果</span>
          <span v-else-if="selectedGenres.length">ジャンルから探す</span>
          <span v-else>検索 & フィルター</span>
        </h1>
        <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
          タイトル・原題・かな、ジャンル、国・地域、公開年などで絞り込みできます。
        </p>
      </header>

      <div
        class="mb-8 rounded-xl border border-white/5 bg-zinc-950/60 p-4 shadow-xl shadow-black/40 sm:p-5"
      >
        <div
          class="flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-end sm:justify-between"
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
                @keydown.enter="handleSearch"
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

          <div class="flex items-center justify-end gap-2">
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
              @click="handleSearch"
            >
              検索
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-4 sm:flex-row">
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
          <div
            v-for="movie in movies"
            :key="movie.id"
            class="card-wrapper"
          >
            <MovieCard :item="movie" />
          </div>
        </div>

        <p v-else class="py-10 text-sm text-zinc-400">
          一致する作品が見つかりませんでした。
        </p>

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
import { useAsyncData, useRoute, useSeoMeta, useHead, useRequestURL } from "#imports";
import MovieCard from '~/components/MovieCard.vue'

// Helper parse query param thành array string
const getQueryArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String)
  return String(val).split(',').filter(Boolean)
}

// Type
type SearchItem = {
  id: number;
  type: 'movie' | 'series';
  slug: string;
  title: string;
  originalTitle?: string | null;
  thumbnail: string;
  year: number;
  country: string;
  genre: string;
  episodeCount?: number;
  description?: string;
};

type MoviesResponse = {
  items: SearchItem[];
  total: number;
  page: number;
  pageSize: number;
};

type FiltersResponse = {
  genres: { slug: string; label: string }[];
  countries: { code: string; label: string }[];
  years: number[];
};

const route = useRoute();

// --- state filter ---
const keyword = ref(route.query.q?.toString() || "");
const selectedGenres = ref<string[]>(getQueryArray(route.query.genres));
const selectedCountries = ref<string[]>(getQueryArray(route.query.countries));
const selectedYear = ref<string>(route.query.year?.toString() || "");

const sortKey = ref<"recommended" | "year_desc" | "year_asc" | "title_asc">(
  (route.query.sort?.toString() as any) || "recommended"
);

const page = ref(1);
const pageSize = ref(20);

// --- SEO META ---
// Tính toán Title động dựa trên filter
const pageTitle = computed(() => {
  if (keyword.value) {
    return `「${keyword.value}」の検索結果 - MugenTV`
  }
  if (selectedGenres.value.length > 0) {
    // Tìm tên genre từ danh sách options (nếu có) để hiển thị đẹp hơn
    // nhưng hiện tại options load bất đồng bộ, nên dùng tạm slug hoặc text chung
    return `ジャンル: ${selectedGenres.value.join(', ')} - MugenTV`
  }
  return '作品を探す - MugenTV'
})

// Canonical URL: Luôn trỏ về chính nó kèm query quan trọng (để tránh duplicate content do thứ tự param)
const url = useRequestURL()
const canonicalUrl = computed(() => {
  // Tạo URL sạch từ state hiện tại
  const u = new URL(`${url.origin}/search`)
  if (keyword.value) u.searchParams.set('q', keyword.value)
  if (selectedGenres.value.length) u.searchParams.set('genres', selectedGenres.value.join(','))
  if (selectedCountries.value.length) u.searchParams.set('countries', selectedCountries.value.join(','))
  if (selectedYear.value) u.searchParams.set('year', selectedYear.value)
  if (page.value > 1) u.searchParams.set('page', page.value.toString())
  return u.toString()
})

// Meta Robots: Noindex nếu là search keywords (tránh spam index), Index nếu là filter danh mục
const robotsMeta = computed(() => {
  if (keyword.value) return 'noindex, follow' // Search query -> Noindex
  return 'index, follow' // Category/Genre filter -> Index
})

useSeoMeta({
  title: pageTitle,
  description: 'MugenTVで映画、ドラマ、アニメを検索。ジャンル、製作国、公開年で絞り込み。',
  ogTitle: pageTitle,
  ogDescription: 'MugenTVの検索ページ。お気に入りの作品を見つけよう。',
  robots: robotsMeta,
  ogUrl: canonicalUrl
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
})

// --- filter options ---
const { data: filtersData } = await useAsyncData<FiltersResponse>(
  "movies-filters",
  () => $fetch("/api/movies/filters")
);

const genreOptions = computed(() => filtersData.value?.genres ?? []);
const countryOptions = computed(() => filtersData.value?.countries ?? []);
const yearOptions = computed(() => filtersData.value?.years ?? []);

// --- query params ---
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

// --- gọi API ---
const { data, pending, error, refresh } = await useAsyncData<MoviesResponse>(
  "search-movies",
  () => $fetch("/api/movies", { params: filters.value }),
  {
    watch: [page], 
  }
);

// Lắng nghe URL
watch(
  () => route.query,
  (newQuery) => {
    keyword.value = newQuery.q?.toString() || "";
    selectedGenres.value = getQueryArray(newQuery.genres);
    selectedCountries.value = getQueryArray(newQuery.countries);
    selectedYear.value = newQuery.year?.toString() || "";
    if (newQuery.sort) sortKey.value = newQuery.sort.toString() as any;
    
    page.value = 1;
    refresh();
  },
  { deep: true }
);

// Auto reset page
watch(
  [keyword, sortKey, selectedGenres, selectedCountries, selectedYear],
  () => {
    page.value = 1;
  }
);

const movies = computed<SearchItem[]>(() => data.value?.items ?? []);
const total = computed<number>(() => data.value?.total ?? 0);

const totalPages = computed(() => {
  const t = total.value;
  const size = pageSize.value;
  if (t <= 0) return 1;
  return Math.max(1, Math.ceil(t / size));
});

const handleSearch = () => {
  page.value = 1;
  refresh();
};

const resetFilters = () => {
  keyword.value = "";
  selectedGenres.value = [];
  selectedCountries.value = [];
  selectedYear.value = "";
  sortKey.value = "recommended";
  handleSearch();
};

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

const forceRefresh = handleSearch;
</script>

<style scoped>
.card-wrapper {
  /* no special style */
}
</style>