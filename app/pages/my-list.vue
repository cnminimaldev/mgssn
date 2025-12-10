<template>
  <div
    class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white pt-20 px-4 pb-12 sm:px-8"
  >
    <div class="mx-auto max-w-7xl">
      <header class="mb-8 border-b border-white/10 pb-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold flex items-center gap-3">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              マイリスト (My List)
            </h1>
            <p class="text-sm text-zinc-400 mt-2 ml-11">
              保存した作品一覧 (最新50件)
            </p>
          </div>

          <div class="text-xs text-zinc-500" v-if="movies.length">
            {{ movies.length }} 作品
          </div>
        </div>
      </header>

      <div v-if="pending" class="py-20 text-center text-zinc-400">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"
        ></div>
        <p class="mt-4 text-xs">読み込み中...</p>
      </div>

      <div
        v-else-if="movies.length === 0"
        class="py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-white/5"
      >
        <p class="mb-4">マイリストにはまだ何もありません。</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
        >
          作品を探す &rarr;
        </NuxtLink>
      </div>

      <div v-else>
        <div
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <div
            v-for="movie in movies"
            :key="`${movie.type}-${movie.id}`"
            class="relative group"
          >
            <MovieCard :item="movie" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useMyList } from "~/composables/useMyList";
import { useSupabaseClient, useSeoMeta, definePageMeta } from "#imports";
import MovieCard from "~/components/MovieCard.vue";

definePageMeta({ middleware: "auth" });

useSeoMeta({
  title: "マイリスト - 無限テレビ",
  robots: "noindex, nofollow",
});

const { myListKeys, isFetched, fetchMyList } = useMyList();
const supabase = useSupabaseClient<any>();

const movies = ref<any[]>([]);
const pending = ref(true);

const getGenreLabel = (genres: any[]) => {
  if (!genres || genres.length === 0) return "";
  return genres
    .map((g) => g.genre?.name_ja || g.genre?.name || "")
    .filter(Boolean)
    .join("・");
};

const loadMoviesDetail = async () => {
  // Nếu list rỗng thì chỉ cần tắt loading
  if (myListKeys.value.length === 0) {
    movies.value = [];
    pending.value = false;
    return;
  }

  // Đánh dấu đang tải
  pending.value = true;

  const movieIds = myListKeys.value
    .filter((k) => k.startsWith("movie-"))
    .map((k) => parseInt(k.replace("movie-", "")));
  const seriesIds = myListKeys.value
    .filter((k) => k.startsWith("series-"))
    .map((k) => parseInt(k.replace("series-", "")));

  try {
    const requests = [];

    if (movieIds.length > 0) {
      requests.push(
        supabase
          .from("movies")
          .select(
            "id, slug, title, poster_url, banner_url, year, origin_country, description, movie_genres(genre:genres(name, name_ja))"
          )
          .in("id", movieIds)
          .then(
            (res) => res.data?.map((m: any) => ({ ...m, type: "movie" })) || []
          )
      );
    }

    if (seriesIds.length > 0) {
      requests.push(
        supabase
          .from("series")
          .select(
            "id, slug, title, poster_url, banner_url, year, origin_country, description, series_genres(genre:genres(name, name_ja)), episodes(count)"
          )
          .in("id", seriesIds)
          .then(
            (res) => res.data?.map((s: any) => ({ ...s, type: "series" })) || []
          )
      );
    }

    const results = await Promise.all(requests);
    const rawItems = results.flat();

    const sortedItems = myListKeys.value
      .map((key) => {
        const [type, idStr] = key.split("-");
        const id = parseInt(idStr!);
        return rawItems.find((item) => item.id === id && item.type === type);
      })
      .filter(Boolean);

    movies.value = sortedItems.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      thumbnail:
        item.banner_url || item.poster_url || "/images/fallback-poster.webp",
      type: item.type,
      year: item.year,
      country: item.origin_country === "JP" ? "日本" : item.origin_country,
      description: item.description,
      genre:
        item.type === "movie"
          ? getGenreLabel(item.movie_genres)
          : getGenreLabel(item.series_genres),
      episodeCount: item.episodes ? item.episodes[0]?.count : undefined,
    }));
  } catch (e) {
    console.error("Error loading my list details:", e);
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchMyList();
});

// [FIX] Tách Watcher: Chỉ theo dõi myListKeys để load chi tiết
// Khi myListKeys thay đổi (do fetchMyList xong), hàm loadMoviesDetail sẽ chạy.
watch(
  myListKeys,
  () => {
    loadMoviesDetail();
  },
  { deep: true, immediate: true }
);

// [FIX] Watcher phụ: Theo dõi isFetched để tắt loading nếu list rỗng
// (Trường hợp người dùng chưa có phim nào, myListKeys không đổi nên watcher trên không chạy)
watch(
  isFetched,
  (newVal) => {
    if (newVal && myListKeys.value.length === 0) {
      pending.value = false;
    }
  },
  { immediate: true }
);
</script>
