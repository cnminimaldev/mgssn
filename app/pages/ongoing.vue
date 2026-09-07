<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white">
    <section class="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <!-- Tiêu đề trang -->
      <header class="mb-8 border-b border-white/10 pb-6">
        <h1 class="flex items-center gap-3 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          <span class="inline-block h-8 w-2 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
          放送中のシリーズ
        </h1>
        <p class="mt-3 text-sm text-zinc-400">
          現在放送・配信中で、最新エピソードが定期的に追加されている作品のリストです。
        </p>
      </header>

      <!-- Trạng thái Đang tải -->
      <div v-if="pending" class="py-20 text-center text-sm text-zinc-400 flex flex-col items-center justify-center">
        <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-amber-500"></div>
        <p>データを読み込んでいます...</p>
      </div>

      <!-- Trạng thái Lỗi -->
      <div v-else-if="error" class="py-20 text-center text-sm text-red-400">
        エラーが発生しました: {{ error.message }}
      </div>

      <!-- Hiển thị Danh sách Phim -->
      <div v-else>
        <div class="mb-6 flex items-center justify-between">
          <p class="text-sm text-zinc-400">
            全 <span class="font-bold text-white">{{ total }}</span> 作品
          </p>
        </div>

        <div v-if="movies.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="movie in movies" :key="movie.id" class="card-wrapper">
            <!-- [QUAN TRỌNG] Kích hoạt giao diện đặc biệt của MovieCard -->
            <MovieCard 
              :item="movie" 
              :is-ongoing-row="true" 
            />
          </div>
        </div>

        <!-- Trạng thái Trống (Không có phim nào đang chiếu) -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-zinc-700 mb-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-zinc-400">現在、放送中のシリーズはありません。</p>
        </div>

        <!-- Phân trang (Pagination) -->
        <div v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            class="rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            前へ (Prev)
          </button>

          <span class="text-xs text-zinc-400">
            <span class="font-bold text-white">{{ page }}</span>
            <span class="mx-1">/</span>
            <span class="text-white">{{ totalPages }}</span>
          </span>

          <button
            type="button"
            class="rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            次へ (Next)
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter, useAsyncData, useSeoMeta } from "#imports";
// MovieCard được Nuxt tự động import

// --- TYPES ---
type ApiMovie = {
  id: number;
  type: "movie" | "series";
  slug: string;
  title: string;
  thumbnail: string;
  year: number;
  country: string;
  genre: string;
  description?: string;
  isOngoing?: boolean;
  latestEpisodeText?: string | null;
};

type MoviesResponse = {
  items: ApiMovie[];
  total: number;
};

// --- ROUTER & STATE ---
const route = useRoute();
const router = useRouter();
const pageSize = 24;
const page = ref(Number(route.query.page) || 1);

// --- API FETCHING ---
const apiParams = computed(() => ({
  ongoing: "true",         // LUÔN LUÔN LÀ PHIM ĐANG CHIẾU
  type: "series",          // CHỈ LẤY SERIES
  sort: "updated_at_desc", // BỘ PHIM NÀO VỪA CÓ TẬP MỚI THÌ LÊN ĐẦU
  page: page.value,
  pageSize,
}));

// Fetch dữ liệu từ API hiện tại của bạn
const { data, pending, error } = await useAsyncData<MoviesResponse>(
  "ongoing-movies-page",
  () => $fetch("/api/movies", { params: apiParams.value }),
  {
    watch: [apiParams],
  }
);

const movies = computed<ApiMovie[]>(() => data.value?.items ?? []);
const total = computed<number>(() => data.value?.total ?? 0);
const totalPages = computed(() => {
  if (total.value <= 0) return 1;
  return Math.max(1, Math.ceil(total.value / pageSize));
});

// --- ACTIONS ---
const changePage = (newPage: number) => {
  // Thay đổi URL query để phân trang và kích hoạt API gọi lại
  router.push({ path: route.path, query: { ...route.query, page: String(newPage) } });
  // Cuộn lên đầu trang nhẹ nhàng
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Theo dõi người dùng bấm Nút Quay lại (Back) trên trình duyệt
watch(
  () => route.query.page,
  (newPageStr) => {
    page.value = Number(newPageStr) || 1;
  }
);

// --- SEO META ---
useSeoMeta({
  title: "放送中のシリーズ - NoriTV",
  description: "現在放送・配信中で、最新エピソードが定期的に追加されている作品のリストです。",
});
</script>

<style scoped>
/* Bạn có thể thêm css riêng cho trang này nếu cần */
</style>