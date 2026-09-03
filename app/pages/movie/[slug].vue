<template>
  <div class="relative min-h-[calc(100vh-4rem)] bg-black text-white">
    <!-- Hiệu ứng ảnh nền mờ (Cinematic Background) -->
    <div
      class="absolute inset-0 bg-cover bg-center blur-2xl brightness-[0.2] pointer-events-none"
      :style="heroBackgroundStyle"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/90 to-black pointer-events-none" />

    <div class="relative z-10">
      <!-- Trạng thái Loading -->
      <div v-if="status === 'pending'" class="flex h-screen items-center justify-center py-20 text-zinc-300">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <!-- Trạng thái Lỗi -->
      <div v-else-if="error || errorMessage || !movie" class="flex h-screen items-center justify-center py-20 text-zinc-200">
        <div class="text-center">
          <p class="text-sm">{{ errorMessage || "作品が見つかりませんでした。" }}</p>
          <NuxtLink to="/" class="mt-4 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300">
            ホームに戻る
          </NuxtLink>
        </div>
      </div>

      <!-- Nội dung chính -->
      <div v-else class="pb-10">
        <section class="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
          
          <!-- Breadcrumb (Tốt cho SEO) -->
          <nav aria-label="Breadcrumb" class="mb-4 text-[10px] text-zinc-400 sm:text-xs">
            <ol class="flex items-center gap-2">
              <li><NuxtLink to="/" class="hover:text-white hover:underline">ホーム</NuxtLink></li>
              <li><span class="text-zinc-600">/</span></li>
              <li><NuxtLink to="/search?type=movie" class="hover:text-white hover:underline">映画</NuxtLink></li>
              <li><span class="text-zinc-600">/</span></li>
              <li class="text-zinc-200" aria-current="page">{{ movie?.title }}</li>
            </ol>
          </nav>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            <!-- CỘT TRÁI: VIDEO PLAYER (Chiếm 2/3 không gian) -->
            <div class="flex flex-col gap-4 lg:col-span-2">
              <AdSlot position="player_top_desktop" device="desktop" />
              <AdSlot position="player_top_mobile" device="mobile" />

              <!-- Khung Player -->
              <div class="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ring-1 ring-white/5">
                <UniversalPlayer
                  v-if="playerSrc"
                  :key="activePart ? activePart.id : playerSrc"
                  :src="playerSrc"
                  :poster="playerPoster"
                  :title="playerTitle"
                  :startTime="movieStartTime"
                  :subtitles="activePartSubtitles"
                  :content-id="movie?.id"
                  content-type="movie"
                  :provider="activeProvider"
                  @timeupdate="handlePlayerTimeUpdate"
                  @ended="handlePlayerEnded"
                />
                <div v-else class="flex h-full items-center justify-center text-sm text-zinc-400">
                  再生可能な動画ソースが登録されていません。
                </div>
              </div>

              <AdSlot position="player_bottom_desktop" device="desktop" />
              <AdSlot position="player_bottom_mobile" device="mobile" />

              <!-- Bộ chọn Phiên bản & Tập (Chỉ nằm gọn dưới Player) -->
              <div class="flex flex-col gap-3">
                <div v-if="collectionOptions.length" class="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[11px] text-zinc-400">バージョン</span>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="opt in collectionOptions"
                        :key="opt.id"
                        type="button"
                        class="rounded-full px-3 py-1 text-[11px] ring-1 transition sm:text-xs"
                        :class="opt.id === selectedCollectionId ? 'bg-emerald-500 text-black ring-emerald-400' : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'"
                        @click="selectedCollectionId = opt.id"
                      >
                        {{ opt.label }}
                      </button>
                    </div>
                  </div>
                  <div v-if="activeCollectionInfo" class="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span v-if="activeCollectionInfo.providerName">Source: {{ activeCollectionInfo.providerName }}</span>
                    <span v-if="activeProvider?.player_type === 'embed'" class="rounded border border-yellow-800/50 bg-yellow-900/20 px-1 text-[10px] text-yellow-500 uppercase">External</span>
                  </div>
                </div>

                <div v-if="partsForActiveCollection.length > 1" class="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                  <span class="text-[11px] text-zinc-400">パート</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="p in partsForActiveCollection"
                      :key="p.id"
                      class="rounded-full px-3 py-1 text-[11px] ring-1 transition sm:text-xs"
                      :class="p.id === selectedPartId ? 'bg-zinc-100 text-black ring-zinc-200' : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-700'"
                      @click="selectedPartId = p.id"
                    >
                      {{ p.title || (p.part_number ? `Part ${p.part_number}` : "Part") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CỘT PHẢI: THÔNG TIN PHIM & MÔ TẢ (Chiếm 1/3 không gian) -->
            <div class="flex flex-col gap-5 lg:col-span-1 lg:border-l lg:border-white/5 lg:pl-8">
              
              <!-- Tiêu đề & Đánh giá -->
              <div>
                <h1 class="text-2xl font-bold leading-tight text-white sm:text-3xl drop-shadow-md">
                  {{ movie?.title }}
                </h1>
                <p v-if="movie?.original_title" class="mt-1 text-xs text-zinc-400">
                  原題：{{ movie?.original_title }}
                </p>
                <div class="mt-3 flex items-center gap-3 text-xs text-emerald-400 font-medium">
                  <span v-if="movie?.year">{{ movie?.year }}</span>
                  <span v-if="countryLabel">{{ countryLabel }}</span>
                  <div v-if="movie?.id"><StarRating :content-id="movie.id" content-type="movie" /></div>
                </div>
              </div>

              <!-- Thanh công cụ -->
              <div class="flex flex-wrap items-center gap-3">
                <button
                  v-if="movie?.id"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition backdrop-blur-sm"
                  @click="handleToggleMyList"
                >
                  <span v-if="inMyList" class="text-emerald-400">✔</span>
                  <span v-else>＋</span>
                  マイリスト
                </button>

                <button
                  type="button"
                  class="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                  title="共有"
                  @click="handleShare"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                </button>

                <NuxtLink
                  v-if="isAdmin && movie?.id"
                  :to="`/admin/movies/${movie.id}`"
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition backdrop-blur-sm border border-amber-500/20 ml-auto sm:ml-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                  編集
                </NuxtLink>
              </div>

              <!-- Nội dung mô tả -->
              <div class="border-t border-white/5 pt-4">
                <h3 class="mb-2 text-sm font-semibold text-white">あらすじ</h3>
                <p class="text-xs sm:text-sm leading-relaxed text-zinc-300">
                  {{ movie?.description || "あらすじはまだ登録されていません。" }}
                </p>
              </div>

              <!-- Thể loại & Ekip -->
              <div class="space-y-3 text-xs text-zinc-400 border-t border-white/5 pt-4">
                <div v-if="genres.length">
                  <span class="block mb-1 opacity-70">ジャンル</span>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink v-for="g in genres" :key="g.slug" :to="`/genres/${g.slug}`" class="text-emerald-400 hover:text-emerald-300 hover:underline">
                      #{{ g.label }}
                    </NuxtLink>
                  </div>
                </div>

                <p v-if="directors.length">
                  <span class="block mb-1 opacity-70">監督</span>
                  <span class="text-zinc-300">
                    <template v-for="(dir, idx) in directors" :key="dir.id">
                      <NuxtLink :to="`/person/${dir.id}`" class="hover:text-white hover:underline">{{ dir.name }}</NuxtLink><span v-if="idx < directors.length - 1" class="text-zinc-600">, </span>
                    </template>
                  </span>
                </p>

                <p v-if="casts.length">
                  <span class="block mb-1 opacity-70">出演</span>
                  <span class="text-zinc-300">
                    <template v-for="(actor, idx) in casts" :key="actor.id">
                      <NuxtLink :to="`/person/${actor.id}`" class="hover:text-white hover:underline">{{ actor.name }}</NuxtLink><span v-if="idx < casts.length - 1" class="text-zinc-600">, </span>
                    </template>
                  </span>
                </p>
              </div>
            </div>

          </div>
        </section>

        <!-- 3. RELATED MOVIES -->
        <section v-if="relatedMovies.length" class="mt-12 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5 pt-8">
          <MovieRow title="あなたにおすすめ" :movies="relatedRowItems" sub-label="この作品に似ている映画・シリーズ" />
        </section>
      </div>

      <ShareModal v-model="showShareModal" :title="shareTitle" :url="shareUrl" />
    </div>
  </div>
  <ClientOnly>
    <GlobalScripts position="popunder_player" target="body" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted } from "vue";
import {
  useRoute,
  useSupabaseClient,
  useSupabaseUser, // [THÊM MỚI] Import composable lấy user
  useSeoMeta,
  useHead,
  navigateTo,
  useNuxtApp,
  useRequestURL,
  useAsyncData,
} from "#imports";
import UniversalPlayer from "~/components/UniversalPlayer.vue"; 
import MovieRow from "~/components/MovieRow.vue";
import StarRating from "~/components/StarRating.vue";
import ShareModal from "~/components/ShareModal.vue"; 
import { useMyList } from "~/composables/useMyList";
import { useContinueWatching } from "~/composables/useContinueWatching";
import { getResizedUrl } from "~/utils/image";

// [THÊM MỚI] Khởi tạo User để check phân quyền
const user = useSupabaseUser();
// Kiểm tra xem có người đang đăng nhập hay không
const isAdmin = computed(() => !!user.value);

type SubtitleItem = { src: string; label: string; lang: string };

type CrewMember = { id: number; name: string };

type DbMovie = {
  id: number;
  slug: string;
  title: string;
  original_title?: string | null;
  title_kana?: string | null;
  year?: number | null;
  origin_country?: string | null;
  description?: string | null;
  poster_url?: string | null;
  banner_url?: string | null;
  duration_minutes?: number | null;
  created_at?: string;
  movie_genres?: {
    genre: {
      slug: string;
      name: string | null;
      name_ja: string | null;
    } | null;
  }[];
  ratingInfo?: {
    avg_rating: number;
    total_votes: number;
  };
};

type MovieCollectionRow = {
  id: number;
  name: string;
  type: string | null;
  audio_language: string | null;
  subtitle_language: string | null;
  provider_id: number | null;
  is_default: boolean | null;
};

type MoviePartRow = {
  id: number;
  movie_id: number;
  collection_id: number | null;
  part_number: number | null;
  title: string | null;
  video_path: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  subtitles?: SubtitleItem[];
};

type ProviderRow = {
  id: number;
  name: string;
  website_url: string | null;
  player_type: string;
  embed_pattern: string | null;
};

type RelatedItem = {
  id: number;
  slug: string;
  title: string;
  poster_url: string | null;
  banner_url: string | null;
  type: "movie" | "series";
  episode_count: number;
  genre_label?: string;
  year?: number;
  origin_country?: string;
  description?: string;
};

const route = useRoute();
const supabase = useSupabaseClient<any>();

const errorMessage = ref("");

const movie = ref<DbMovie | null>(null);
const collections = ref<MovieCollectionRow[]>([]);
const parts = ref<MoviePartRow[]>([]);
const providers = ref<ProviderRow[]>([]);
const relatedMovies = ref<RelatedItem[]>([]);

const directors = ref<CrewMember[]>([]);
const casts = ref<CrewMember[]>([]);

const selectedCollectionId = ref<number | null>(null);
const selectedPartId = ref<number | null>(null);

const routeSlug = computed(() => String(route.params.slug));

const { isInMyList, toggleMyList } = useMyList();
const inMyList = computed(() =>
  movie.value ? isInMyList(movie.value.id, "movie") : false
);

const handleToggleMyList = () => {
  if (!movie.value) return;
  toggleMyList(movie.value.id, "movie");
};

const showShareModal = ref(false);
const shareUrl = computed(() => {
  if (import.meta.client) return window.location.href;
  return '';
});

const handleShare = async () => {
  if (import.meta.client && navigator.share) {
    try {
      await navigator.share({
        title: seoTitle.value,
        text: seoDescription.value,
        url: shareUrl.value,
      });
      return;
    } catch (err) {
      console.log('Share canceled or failed, falling back to modal');
    }
  }
  showShareModal.value = true;
};

const { setProgress, clearProgressForMovie, getEntry } = useContinueWatching();

const lastSavedAt = ref(0);

const movieStartTime = computed(() => {
  const mv = movie.value;
  if (!mv) return 0;
  const entry = getEntry(mv.id);
  if (!entry) return 0;
  if (!entry.duration || entry.duration < 60) return 0;
  if (entry.currentTime < 10 || entry.duration - entry.currentTime < 10)
    return 0;
  return entry.currentTime;
});

const handlePlayerTimeUpdate = (payload: {
  currentTime: number;
  duration: number;
}) => {
  const mv = movie.value;
  if (!mv) return;

  const now = performance.now();
  if (now - lastSavedAt.value < 2000) return;
  lastSavedAt.value = now;

  setProgress(mv.id, payload.currentTime, payload.duration);
};

const handlePlayerEnded = () => {
  const mv = movie.value;
  if (!mv) return;
  clearProgressForMovie(mv.id);
};

const playerSectionRef = ref<HTMLElement | null>(null);
const scrollToPlayer = async () => {
  if (import.meta.server) return;
  await nextTick();
  playerSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const countryLabel = computed(() => {
  const code = movie.value?.origin_country;
  if (!code) return "";
  const map: Record<string, string> = {
    JP: "日本",
    US: "アメリカ",
    KR: "韓国",
    CN: "中国",
    TW: "台湾",
    HK: "香港",
    GB: "イギリス",
    FR: "フランス",
    DE: "ドイツ",
    VN: "ベトナム",
  };
  return map[code] || code;
});

const genres = computed(() => {
  if (!movie.value?.movie_genres) return [];
  return movie.value.movie_genres
    .map((mg) => mg.genre)
    .filter((g) => g !== null)
    .map((g) => ({
      slug: g!.slug,
      label: g!.name_ja || g!.name || g!.slug,
    }));
});

const posterUrl = computed(() => {
  const raw = movie.value?.poster_url;
  return (
    getResizedUrl(raw, 450, 675, "contain") || "/images/fallback-poster.webp"
  );
});

const heroBackgroundStyle = computed(() => {
  const bgRaw = movie.value?.banner_url || movie.value?.poster_url;
  if (!bgRaw) return "";

  const bgOptimized = getResizedUrl(bgRaw, 1920, 1080, "cover");
  return `background-image: url('${bgOptimized}')`;
});

const collectionOptions = computed(() =>
  collections.value.map((c) => {
    const provider = c.provider_id
      ? providers.value.find((p) => p.id === c.provider_id)
      : null;

    const langs: string[] = [];
    if (c.audio_language) langs.push(`音声:${c.audio_language}`);
    if (c.subtitle_language) langs.push(`字幕:${c.subtitle_language}`);
    const meta = [...langs, provider?.name].filter(Boolean).join(" / ");

    return {
      id: c.id,
      label: meta ? `${c.name}（${meta}）` : c.name,
    };
  })
);

const partsForActiveCollection = computed(() => {
  if (!parts.value.length) return [];
  if (selectedCollectionId.value != null) {
    const list = parts.value.filter(
      (p) => p.collection_id === selectedCollectionId.value
    );
    if (list.length) return list;
  }
  return parts.value;
});

const activePart = computed<MoviePartRow | null>(() => {
  const list = partsForActiveCollection.value;
  if (!list.length) return null;

  if (selectedPartId.value != null) {
    const found = list.find((p) => p.id === selectedPartId.value);
    if (found) return found;
  }

  const first = list[0];
  return first ?? null;
});

const activePartSubtitles = computed(() => {
  const part = activePart.value;
  if (!part || !part.subtitles || !Array.isArray(part.subtitles)) return [];
  return part.subtitles;
});

const activeCollectionInfo = computed(() => {
  if (selectedCollectionId.value == null) return null;
  const c = collections.value.find(
    (cc) => cc.id === selectedCollectionId.value
  );
  if (!c) return null;
  const provider = c.provider_id
    ? providers.value.find((p) => p.id === c.provider_id)
    : null;

  const langs: string[] = [];
  if (c.audio_language) langs.push(`音声:${c.audio_language}`);
  if (c.subtitle_language) langs.push(`字幕:${c.subtitle_language}`);

  return {
    providerName: provider?.name || "",
    languages: langs.join(" / "),
  };
});

const activeProvider = computed(() => {
  if (selectedCollectionId.value == null) return null;
  const c = collections.value.find((cc) => cc.id === selectedCollectionId.value);
  if (!c || !c.provider_id) return null;
  return providers.value.find((p) => p.id === c.provider_id) || null;
});

const config = useRuntimeConfig();

const playerSrc = computed(() => {
  const path = activePart.value?.video_path || "";
  if (!path) return "";
  
  // Nếu là link ngoài (embed, youtube) thì giữ nguyên, không ghép
  if (path.startsWith('http')) return path; 
  
  // Tự động ghép tên miền Streaming vào đường dẫn tương đối
  const baseUrl = config.public.streamUrl;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
});
const playerPoster = computed(() => {
  if (activePart.value?.thumbnail_url) {
    return getResizedUrl(activePart.value.thumbnail_url, 1280, 720, "cover");
  }
  if (movie.value?.banner_url) {
    return getResizedUrl(movie.value.banner_url, 1280, 720, "cover");
  }
  return posterUrl.value || "/images/fallback-poster.webp";
});

const playerTitle = computed(() => {
  if (!movie.value) return "";
  const base = movie.value.title;
  const part = activePart.value;
  if (!part) return base;

  let label = part.title || "";
  if (!label && partsForActiveCollection.value.length > 1) {
    label = `Part ${part.part_number}`;
  }

  return label ? `${base} ${label}` : base;
});

watch(selectedCollectionId, (newVal) => {
  if (!parts.value.length) {
    selectedPartId.value = null;
    return;
  }
  const list = newVal
    ? parts.value.filter((p) => p.collection_id === newVal)
    : parts.value;
  const candidate = list[0] ?? parts.value[0] ?? null;
  selectedPartId.value = candidate ? candidate.id : null;
});

const countryMap: Record<string, string> = {
  JP: "日本",
  US: "アメリカ",
  KR: "韓国",
  CN: "中国",
  TW: "台湾",
  HK: "香港",
  GB: "イギリス",
  FR: "フランス",
  DE: "ドイツ",
  VN: "ベトナム",
};

const relatedRowItems = computed(() =>
  relatedMovies.value.map((m: any) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    thumbnail:
      getResizedUrl(m.banner_url || m.poster_url, 450, 450, "contain") ||
      "/images/fallback-poster.webp",
    type: m.type,
    year: m.year,
    country: m.origin_country
      ? countryMap[m.origin_country] || m.origin_country
      : null,
    genre: m.genre_label,
    description: m.description,
    episodeCount: m.episode_count > 0 ? m.episode_count : undefined,
  }))
);

const {
  status,
  error,
  data: pageData,
} = await useAsyncData(`movie-${routeSlug.value}`, async () => {
  const nuxtApp = useNuxtApp();
  const result = {
    movie: null as DbMovie | null,
    directors: [] as CrewMember[], 
    casts: [] as CrewMember[],     
    collections: [] as MovieCollectionRow[],
    parts: [] as MoviePartRow[],
    providers: [] as ProviderRow[],
    relatedMovies: [] as RelatedItem[],
    errorMessage: "",
  };

  const slug = routeSlug.value;
  if (!slug) {
    result.errorMessage = "無効なURLです。";
    return result;
  }

  const { data: movieData, error: movieError } = await supabase
    .from("movies")
    .select(
      "id, slug, title, original_title, title_kana, year, origin_country, description, poster_url, banner_url, duration_minutes, created_at, movie_genres(genre:genres(slug, name, name_ja))"
    )
    .eq("slug", slug)
    .single();

  if (movieError) {
    if (movieError.code !== "PGRST116") {
      result.errorMessage = movieError.message;
      return result;
    }
  }

  if (movieData) {
    result.movie = movieData as unknown as DbMovie;
    const movieId = result.movie!.id;

    const { data: crewData } = await supabase
      .from("content_crew")
      .select("role, persons(id, name)")
      .eq("content_id", movieId)
      .eq("type", "movie");

    if (crewData) {
      result.directors = crewData
        .filter((c: any) => c.role === 'director' && c.persons)
        .map((c: any) => c.persons as CrewMember);
      
      result.casts = crewData
        .filter((c: any) => c.role === 'cast' && c.persons)
        .map((c: any) => c.persons as CrewMember);
    }

    const { data: ratingData } = await supabase.rpc("get_content_rating", {
      target_id: movieId,
      target_type: "movie",
    });

    if (result.movie) {
      result.movie.ratingInfo = ratingData?.[0] || {
        avg_rating: 0,
        total_votes: 0,
      };
    }

    const { data: colData } = await supabase
      .from("movie_collections")
      .select(
        "id, name, type, audio_language, subtitle_language, provider_id, is_default"
      )
      .eq("movie_id", movieId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    result.collections = (colData ?? []) as MovieCollectionRow[];

    const { data: partData } = await supabase
      .from("movie_parts")
      .select(
        "id, movie_id, collection_id, part_number, title, video_path, thumbnail_url, duration_minutes, subtitles"
      )
      .eq("movie_id", movieId)
      .order("part_number", { ascending: true });

    result.parts = (partData ?? []) as MoviePartRow[];

    const { data: provData } = await supabase
      .from("collection_providers")
      .select("id, name, website_url, player_type, embed_pattern")
      .order("name", { ascending: true });

    result.providers = (provData ?? []) as ProviderRow[];

    // Related Logic
    // @ts-ignore
    const currentGenreSlugs =
      movieData.movie_genres
        ?.map((mg: any) => mg.genre?.slug)
        .filter(Boolean) || [];
    let relData: any[] = [];

    if (currentGenreSlugs.length > 0) {
      const { data } = await supabase
        .rpc("get_random_related_content", {
          filter_genre_slugs: currentGenreSlugs,
          exclude_id: movieId,
          limit_count: 12,
        })
        .select(
          "id, slug, title, poster_url, banner_url, type, year, origin_country, genre_label, description, episode_count"
        );
        
      relData = (data as any[]) || [];
    } else {
      const { data } = await supabase
        .from("all_contents")
        .select(
          "id, slug, title, poster_url, banner_url, type, year, origin_country, genre_label, description, episode_count"
        )
        .neq("id", movieId)
        .order("created_at", { ascending: false })
        .limit(12);
        
      relData = (data as any[]) || [];
    }

    result.relatedMovies = (relData ?? []) as RelatedItem[];

    return result;
  }

  const { data: historyData } = await supabase
    .from("movie_slug_history")
    .select("movie_id, movies(slug)")
    .eq("slug", slug)
    .single();

  if (historyData && historyData.movies) {
    // @ts-ignore
    const newSlug = historyData.movies.slug;
    if (newSlug) {
      await nuxtApp.runWithContext(() =>
        navigateTo(`/movie/${newSlug}`, {
          redirectCode: 301,
          external: true,
        })
      );
      return result;
    }
  }

  result.errorMessage = "作品が見つかりませんでした。";
  return result;
});

watch(
  pageData,
  (newData) => {
    if (newData) {
      if (newData.errorMessage) {
        errorMessage.value = newData.errorMessage;
        return;
      }

      movie.value = newData.movie;
      directors.value = newData.directors; 
      casts.value = newData.casts;         
      collections.value = newData.collections;
      parts.value = newData.parts;
      providers.value = newData.providers;
      relatedMovies.value = newData.relatedMovies;

      if (collections.value.length) {
        const def =
          collections.value.find((c) => c.is_default) ??
          collections.value[0] ??
          null;
        selectedCollectionId.value = def ? def.id : null;
      } else {
        selectedCollectionId.value = null;
      }

      if (parts.value.length) {
        const baseList =
          selectedCollectionId.value != null
            ? parts.value.filter(
                (p) => p.collection_id === selectedCollectionId.value
              )
            : parts.value;

        const firstPart = baseList[0] ?? parts.value[0] ?? null;
        selectedPartId.value = firstPart ? firstPart.id : null;
      } else {
        selectedPartId.value = null;
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (import.meta.server) return;
});

const canonicalUrl = computed(() => {
  return `${SITE_URL}/movie/${routeSlug.value}`;
});

const seoTitle = computed(() =>
  movie.value
    ? `${movie.value.title} 無料動画 | NoriTV`
    : "無料動画 | NoriTV"
);

const shareTitle = computed(() => seoTitle.value);

const seoDescription = computed(
  () =>
    movie.value?.description ?? "映画やドラマをオンラインで楽しめるNoriTV。"
);
const seoImage = computed(
  () =>
    movie.value?.banner_url || movie.value?.poster_url || "/images/banner.jpg"
);

const SITE_URL = 'https://noritv.com';

const toAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  // Dùng trực tiếp tên miền thay vì url.origin
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`; 
};

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
  title: seoTitle,
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() => {
        if (!movie.value) return "";

        const absPosterUrl = toAbsoluteUrl(posterUrl.value);
        const absVideoUrl = toAbsoluteUrl(playerSrc.value);
        const isoDate = movie.value.created_at 
          ? new Date(movie.value.created_at).toISOString() 
          : new Date().toISOString();

        const schemaMovie = {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: movie.value.title,
          alternateName: movie.value.original_title,
          description: movie.value.description || movie.value.title,
          image: absPosterUrl,
          datePublished: movie.value.year?.toString(),
          countryOfOrigin: {
            "@type": "Country",
            name: movie.value.origin_country,
          },
          director: directors.value.length
            ? directors.value.map(d => ({ "@type": "Person", name: d.name }))
            : undefined,
          actor: casts.value.length
            ? casts.value.map(c => ({ "@type": "Person", name: c.name }))
            : undefined,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
          },
        };
        
        if (movie.value.ratingInfo && movie.value.ratingInfo.total_votes > 0) {
            // @ts-ignore
            schemaMovie.aggregateRating = {
              "@type": "AggregateRating",
              ratingValue: movie.value.ratingInfo.avg_rating,
              ratingCount: movie.value.ratingInfo.total_votes,
              bestRating: "5",
              worstRating: "1",
            };
        }

        const schemaVideo = {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: movie.value.title,
          description: movie.value.description || movie.value.title,
          thumbnailUrl: [absPosterUrl], 
          uploadDate: isoDate,
          duration: movie.value.duration_minutes
            ? `PT${movie.value.duration_minutes}M`
            : undefined,
          contentUrl: absVideoUrl, 
          embedUrl: canonicalUrl.value,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: { "@type": "WatchAction" },
            userInteractionCount: movie.value.ratingInfo?.total_votes || 0,
          },
        };

        const schemaBreadcrumb = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Movies", item: `${SITE_URL}/search?type=movie` },
            { "@type": "ListItem", position: 3, name: movie.value.title, item: canonicalUrl.value },
          ],
        };

        return JSON.stringify([schemaMovie, schemaVideo, schemaBreadcrumb]);
      }),
    },
  ],
});

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogUrl: canonicalUrl,
  ogType: 'video.movie',
  ogSiteName: 'NoriTV',
  ogLocale: 'ja_JP',
  twitterCard: "summary_large_image",
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
});
</script>