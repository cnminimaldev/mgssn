<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <div
      v-if="status === 'pending'"
      class="flex h-full items-center justify-center py-20 text-zinc-300"
    >
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"
      ></div>
    </div>

    <div
      v-else-if="error || errorMessage || !movie"
      class="flex h-full items-center justify-center py-20 text-zinc-200"
    >
      <div class="text-center">
        <p class="text-sm">
          {{ errorMessage || "作品が見つかりませんでした。" }}
        </p>
        <NuxtLink
          to="/"
          class="mt-4 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300"
        >
          ホームに戻る
        </NuxtLink>
      </div>
    </div>

    <div v-else class="pb-10">
      <section class="relative">
        <div
          class="relative w-full overflow-hidden min-h-[450px] flex flex-col justify-end"
        >
          <div
            class="absolute inset-0 bg-cover bg-center blur-sm brightness-[0.45]"
            :style="heroBackgroundStyle"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10"
          />

          <div
            class="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-4 pb-10 pt-32 sm:px-8"
          >
            <div class="flex items-start gap-6 sm:gap-8">
              <div
                class="hidden w-[160px] shrink-0 aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-zinc-900/80 shadow-2xl sm:block"
              >
                <img
                  :src="posterUrl"
                  :alt="movie?.title"
                  class="h-full w-full object-cover"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>

              <div class="flex flex-col gap-3 min-w-0 flex-1">
                <div
                  class="inline-flex items-center gap-2 text-[11px] text-zinc-300 sm:text-xs"
                >
                  <NuxtLink
                    v-if="movie?.year"
                    :to="`/search?year=${movie?.year}`"
                    class="hover:text-white hover:underline"
                  >
                    {{ movie?.year }}
                  </NuxtLink>
                  <NuxtLink
                    v-if="countryLabel && movie?.origin_country"
                    :to="`/search?countries=${movie?.origin_country}`"
                    class="rounded border border-white/20 px-2 py-0.5 hover:bg-white/10 hover:border-white/40 transition"
                  >
                    {{ countryLabel }}
                  </NuxtLink>
                </div>

                <h1
                  class="text-2xl font-bold sm:text-4xl leading-tight text-white drop-shadow-md"
                >
                  {{ movie?.title }}
                </h1>

                <div class="text-xs text-zinc-400 space-y-1">
                  <p v-if="movie?.original_title">
                    原題：{{ movie?.original_title }}
                  </p>
                  <p v-if="movie?.title_kana">
                    {{ movie?.title_kana }}
                  </p>
                </div>

                <p
                  v-if="movie?.description"
                  class="mt-2 text-xs leading-relaxed text-zinc-200 sm:text-sm max-w-2xl line-clamp-4 hover:line-clamp-none transition-all cursor-default"
                >
                  {{ movie?.description }}
                </p>

                <div v-if="genres.length" class="flex flex-wrap gap-2 text-xs">
                  <NuxtLink
                    v-for="g in genres"
                    :key="g.slug"
                    :to="`/genres/${g.slug}`"
                    class="text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    #{{ g.label }}
                  </NuxtLink>
                </div>

                <div class="mt-1 space-y-1 text-xs text-zinc-400">
                  <p v-if="movie?.director">
                    <span class="opacity-70">監督：</span>
                    <NuxtLink
                      :to="`/person/${encodeURIComponent(movie?.director)}`"
                      class="text-zinc-300 hover:text-white hover:underline"
                    >
                      {{ movie?.director }}
                    </NuxtLink>
                  </p>

                  <p v-if="castList.length">
                    <span class="opacity-70">出演：</span>
                    <span class="text-zinc-300">
                      <template v-for="(actor, idx) in castList" :key="idx">
                        <NuxtLink
                          :to="`/person/${encodeURIComponent(actor)}`"
                          class="hover:text-white hover:underline"
                          >{{ actor }}</NuxtLink
                        >
                        <span
                          v-if="idx < castList.length - 1"
                          class="text-zinc-600"
                          >,
                        </span>
                      </template>
                    </span>
                  </p>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-transform active:scale-95"
                    @click="scrollToPlayer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    再生
                  </button>

                  <button
                    v-if="movie?.id"
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition backdrop-blur-sm"
                    @click="handleToggleMyList"
                  >
                    <span v-if="inMyList" class="text-emerald-400">✔</span>
                    <span v-else>＋</span>
                    マイリスト
                  </button>

                  <button
                    type="button"
                    class="rounded-full bg-zinc-800 p-2.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                    title="共有"
                    @click="handleShare"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                      />
                    </svg>
                  </button>
                </div>

                <div v-if="movie?.id" class="mt-1">
                  <StarRating :content-id="movie.id" content-type="movie" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref="playerSectionRef"
        class="mx-auto mt-6 max-w-5xl px-4 sm:mt-8 sm:px-8"
      >
        <div
          v-if="collectionOptions.length"
          class="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] text-zinc-400">バージョン</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in collectionOptions"
                :key="opt.id"
                type="button"
                class="rounded-full px-3 py-1 text-[11px] ring-1 transition sm:text-xs"
                :class="
                  opt.id === selectedCollectionId
                    ? 'bg-emerald-500 text-black ring-emerald-400'
                    : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'
                "
                @click="selectedCollectionId = opt.id"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div v-if="activeCollectionInfo" class="flex items-center gap-2 text-[11px] text-zinc-400">
            <span v-if="activeCollectionInfo.providerName">
              Provider: {{ activeCollectionInfo.providerName }}
            </span>
            <span 
              v-if="activeProvider?.player_type === 'embed'"
              class="rounded border border-yellow-800/50 bg-yellow-900/20 px-1 text-[10px] text-yellow-500 uppercase"
            >
              External
            </span>
            <span v-if="activeCollectionInfo.languages">
              ・{{ activeCollectionInfo.languages }}
            </span>
          </div>
        </div>

        <div
          v-if="partsForActiveCollection.length > 1"
          class="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-300"
        >
          <span class="text-[11px] text-zinc-400">パート</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in partsForActiveCollection"
              :key="p.id"
              class="rounded-full px-3 py-1 text-[11px] ring-1 transition sm:text-xs"
              :class="
                p.id === selectedPartId
                  ? 'bg-zinc-100 text-black ring-zinc-200'
                  : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-700'
              "
              @click="selectedPartId = p.id"
            >
              {{
                p.title || (p.part_number ? `Part ${p.part_number}` : "Part")
              }}
            </button>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl"
        >
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

          <div
            v-else
            class="flex aspect-video items-center justify-center text-sm text-zinc-400"
          >
            再生可能な動画ソースが登録されていません。
          </div>
        </div>
      </section>

      <section v-if="relatedMovies.length" class="mt-10 px-4 sm:px-8">
        <MovieRow
          title="あなたにおすすめ"
          :movies="relatedRowItems"
          sub-label="この作品に似ている映画・シリーズ"
        />
      </section>
    </div>

    <ShareModal 
      v-model="showShareModal" 
      :title="shareTitle"
      :url="shareUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted } from "vue";
import {
  useRoute,
  useSupabaseClient,
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
import ShareModal from "~/components/ShareModal.vue"; // [NEW]
import { useMyList } from "~/composables/useMyList";
import { useContinueWatching } from "~/composables/useContinueWatching";
import { getResizedUrl } from "~/utils/image";

type SubtitleItem = { src: string; label: string; lang: string };

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
  director?: string | null;
  main_cast?: string | null;
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

// [NEW] Share Logic
const showShareModal = ref(false);
const shareUrl = computed(() => {
  if (import.meta.client) return window.location.href;
  return '';
});
// shareTitle dùng lại seoTitle ở phía dưới

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

const castList = computed(() => {
  if (!movie.value?.main_cast) return [];
  return movie.value.main_cast
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
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

const playerSrc = computed(() => activePart.value?.video_path || "");
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
      "id, slug, title, original_title, title_kana, year, origin_country, description, poster_url, banner_url, director, main_cast, duration_minutes, created_at, movie_genres(genre:genres(slug, name, name_ja))"
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

const url = useRequestURL();

const canonicalUrl = computed(() => {
  return `${url.origin}/movie/${routeSlug.value}`;
});

const seoTitle = computed(() =>
  movie.value
    ? `${movie.value.title} 無料動画 | MugenTV`
    : "無料動画 | MugenTV"
);

// shareTitle dùng chung với seoTitle
const shareTitle = computed(() => seoTitle.value);

const seoDescription = computed(
  () =>
    movie.value?.description ?? "映画やドラマをオンラインで楽しめるMugenTV。"
);
const seoImage = computed(
  () =>
    movie.value?.banner_url || movie.value?.poster_url || "/images/banner.jpg"
);

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
  title: seoTitle,
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() => {
        const schemaMovie = {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: movie.value?.title,
          alternateName: movie.value?.original_title,
          description: movie.value?.description,
          image: posterUrl.value,
          datePublished: movie.value?.year?.toString(),
          countryOfOrigin: {
            "@type": "Country",
            name: movie.value?.origin_country,
          },
          director: movie.value?.director
            ? {
                "@type": "Person",
                name: movie.value.director,
              }
            : undefined,
          actor: movie.value?.main_cast
            ? movie.value.main_cast.split(",").map((name) => ({
                "@type": "Person",
                name: name.trim(),
              }))
            : undefined,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
          },
        };

        if (movie.value?.ratingInfo && movie.value.ratingInfo.total_votes > 0) {
          // @ts-ignore
          schemaMovie.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: movie.value.ratingInfo.avg_rating,
            ratingCount: movie.value.ratingInfo.total_votes,
            bestRating: "5",
            worstRating: "1",
          };
        }

        // VideoObject Schema
        const schemaVideo = {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: movie.value?.title,
          description: movie.value?.description,
          thumbnailUrl: [posterUrl.value],
          uploadDate: movie.value?.created_at,
          duration: movie.value?.duration_minutes
            ? `PT${movie.value.duration_minutes}M`
            : undefined,
          contentUrl: playerSrc.value,
          embedUrl: canonicalUrl.value,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: { "@type": "WatchAction" },
            userInteractionCount: movie.value?.ratingInfo?.total_votes || 0,
          },
        };

        // Breadcrumb Schema
        const schemaBreadcrumb = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: url.origin,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Movies",
              item: `${url.origin}/search?type=movie`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: movie.value?.title,
              item: canonicalUrl.value,
            },
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
  ogSiteName: 'MugenTV',
  ogLocale: 'ja_JP',
  twitterCard: "summary_large_image",
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
});
</script>