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
          <span v-if="route.query.q">「{{ route.query.q }}」の検索結果</span>
          <span v-else-if="selectedGenres.length">ジャンルから探す</span>
          <span v-else>検索 & フィルター</span>
        </h1>
        <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
          タイトル・原題・かな、ジャンル、国・地域、公開年などで絞り込みできます。
        </p>
      </header>

      <div
        class="mb-6 rounded-xl border border-white/5 bg-zinc-950/60 p-4 shadow-xl shadow-black/40 sm:p-5"
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
                placeholder="例: Frozen / アナと雪の女王"
                @keydown.enter="triggerSearch"
              />
            </div>

            <div class="flex gap-2 sm:w-auto">
              <div class="w-24 sm:w-32">
                <label class="mb-1 block text-[11px] text-zinc-400 sm:text-xs">
                  タイプ
                </label>
                <select
                  v-model="selectedType"
                  class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="">すべて</option>
                  <option value="movie">映画</option>
                  <option value="series">シリーズ</option>
                </select>
              </div>

              <div class="w-24 sm:w-32">
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
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              class="rounded-md border border-zinc-600 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-300 sm:text-sm"
              @click="resetFilters"
            >
              リセット
            </button>
            <button
              type="button"
              class="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 sm:text-sm shadow-lg active:scale-95 transition-transform"
              @click="triggerSearch"
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

      <div class="mb-4 flex items-center justify-end">
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-zinc-400">並び替え:</label>
          <div class="relative">
            <select
              v-model="sortKey"
              class="appearance-none rounded-md border border-zinc-700 bg-zinc-900 pl-3 pr-8 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none hover:border-zinc-500 transition-colors cursor-pointer"
              @change="triggerSearch"
            >
              <option value="recommended">おすすめ順</option>
              <option value="year_desc">新しい順 (年)</option>
              <option value="year_asc">古い順 (年)</option>
              <option value="title_asc">タイトル順</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400"
            >
              <svg class="h-3 w-3 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pending" class="py-10 text-sm text-zinc-400 text-center">
        <div
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500"
        ></div>
        <p class="mt-2">検索中…</p>
      </div>

      <div v-else-if="error" class="py-10 text-sm text-red-400 text-center">
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
          class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <div v-for="movie in movies" :key="movie.id" class="card-wrapper">
            <MovieCard :item="movie" />
          </div>
        </div>

        <p v-else class="py-20 text-center text-sm text-zinc-400">
          一致する作品が見つかりませんでした。
        </p>

        <div
          v-if="totalPages > 1"
          class="mt-10 flex items-center justify-center gap-4 text-sm"
        >
          <button
            type="button"
            class="rounded-md border border-zinc-700 px-4 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            前へ
          </button>

          <span class="text-xs text-zinc-400">
            <span class="text-zinc-100 font-medium">{{ page }}</span>
            /
            <span class="text-zinc-100">{{ totalPages }}</span>
          </span>

          <button
            type="button"
            class="rounded-md border border-zinc-700 px-4 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
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
import {
  useAsyncData,
  useRoute,
  useRouter,
  useSeoMeta,
  useHead,
  useRequestURL,
} from "#imports";
// MovieCard được Nuxt auto-import

// --- UTILS ---
const getQueryArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  return String(val).split(",").filter(Boolean);
};

// --- TYPES ---
type SearchItem = {
  id: number;
  type: "movie" | "series";
  slug: string;
  title: string;
  thumbnail: string;
  year: number;
  country: string;
  genre: string;
  description?: string;
};

type MoviesResponse = {
  items: SearchItem[];
  total: number;
};

const route = useRoute();
const router = useRouter();

// --- 1. LOCAL STATE (DRAFT) ---
// Khởi tạo từ URL
const keyword = ref(route.query.q?.toString() || "");
const selectedType = ref(route.query.type?.toString() || "");
const selectedGenres = ref<string[]>(getQueryArray(route.query.genres));
const selectedCountries = ref<string[]>(getQueryArray(route.query.countries));
const selectedYear = ref<string>(route.query.year?.toString() || "");
const sortKey = ref(route.query.sort?.toString() || "recommended");

// Page lấy từ URL
const page = ref(Number(route.query.page) || 1);
const pageSize = 24;

// --- 2. SEO META ---
const url = useRequestURL();
const canonicalUrl = computed(() => {
  const u = new URL(`${url.origin}/search`);
  if (route.query.q) u.searchParams.set("q", String(route.query.q));
  if (route.query.type) u.searchParams.set("type", String(route.query.type));
  // ... (các param khác tự động được xử lý khi query change)
  return u.toString();
});

useSeoMeta({
  title: "検索 - MugenTV",
  description: "映画やドラマを検索・視聴",
  robots: route.query.q ? "noindex, follow" : "index, follow",
  ogUrl: canonicalUrl,
});

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
});

// --- 3. FILTER OPTIONS ---
const { data: filtersData } = await useAsyncData("movies-filters", () =>
  $fetch("/api/movies/filters")
);

const genreOptions = computed(() => filtersData.value?.genres ?? []);
const countryOptions = computed(() => filtersData.value?.countries ?? []);
const yearOptions = computed(() => filtersData.value?.years ?? []);

// --- 4. API FETCHING (Source of Truth = URL) ---
// Tính toán Params dựa trên route.query để đảm bảo API chỉ gọi khi URL thay đổi
const apiParams = computed(() => ({
  q: route.query.q,
  type: route.query.type,
  sort: route.query.sort || "recommended",
  page: route.query.page || 1,
  pageSize,
  genres: route.query.genres,
  countries: route.query.countries,
  year: route.query.year,
}));

// Fetch Data (chỉ watch apiParams)
const { data, pending, error } = await useAsyncData<MoviesResponse>(
  "search-movies",
  () => $fetch("/api/movies", { params: apiParams.value }),
  {
    watch: [apiParams], // Tự động fetch khi URL thay đổi
  }
);

const movies = computed<SearchItem[]>(() => data.value?.items ?? []);
const total = computed<number>(() => data.value?.total ?? 0);
const totalPages = computed(() => {
  const t = total.value;
  if (t <= 0) return 1;
  return Math.max(1, Math.ceil(t / pageSize));
});

// --- 5. ACTION HANDLERS ---

const triggerSearch = () => {
  const query: any = {};

  if (keyword.value) query.q = keyword.value;
  if (selectedType.value) query.type = selectedType.value;
  if (selectedGenres.value.length)
    query.genres = selectedGenres.value.join(",");
  if (selectedCountries.value.length)
    query.countries = selectedCountries.value.join(",");
  if (selectedYear.value) query.year = selectedYear.value;
  if (sortKey.value !== "recommended") query.sort = sortKey.value;

  query.page = 1; // Luôn reset về trang 1

  router.push({ path: "/search", query });
};

const resetFilters = () => {
  keyword.value = "";
  selectedType.value = "";
  selectedGenres.value = [];
  selectedCountries.value = [];
  selectedYear.value = "";
  sortKey.value = "recommended";
  triggerSearch();
};

const changePage = (newPage: number) => {
  const query = { ...route.query, page: String(newPage) };
  router.push({ path: "/search", query });
};

// UI Toggles (Chỉ cập nhật Local State)
const toggleGenre = (slug: string) => {
  const index = selectedGenres.value.indexOf(slug);
  if (index === -1) selectedGenres.value.push(slug);
  else selectedGenres.value.splice(index, 1);
};

const toggleCountry = (c: string) => {
  const index = selectedCountries.value.indexOf(c);
  if (index === -1) selectedCountries.value.push(c);
  else selectedCountries.value.splice(index, 1);
};

// --- 6. SYNC URL -> LOCAL STATE ---
watch(
  () => route.query,
  (newQuery) => {
    keyword.value = newQuery.q?.toString() || "";
    selectedType.value = newQuery.type?.toString() || "";
    selectedGenres.value = getQueryArray(newQuery.genres);
    selectedCountries.value = getQueryArray(newQuery.countries);
    selectedYear.value = newQuery.year?.toString() || "";
    sortKey.value = newQuery.sort?.toString() || "recommended";
    page.value = Number(newQuery.page) || 1;
  }
);
</script>

<style scoped>
.card-wrapper {
  /* no special style */
}
</style>
