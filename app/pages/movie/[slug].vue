<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <div
      v-if="status === 'pending'"
      class="flex h-full items-center justify-center py-20 text-zinc-300"
    >
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
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
        <div class="relative h-[260px] w-full overflow-hidden sm:h-[360px]">
          <div
            class="absolute inset-0 bg-cover bg-center blur-sm brightness-[0.45]"
            :style="heroBackgroundStyle"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10"
          />
          <div
            class="relative mx-auto flex h-full max-w-5xl items-end px-4 pb-6 sm:px-8 sm:pb-10"
          >
            <div class="flex gap-4 sm:gap-6">
              <div
                class="hidden w-[140px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900/80 shadow-lg sm:block"
              >
                <img
                  :src="posterUrl"
                  :alt="movie?.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div class="flex flex-col gap-2">
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
                    class="rounded border border-white/20 px-1.5 py-0.5 hover:bg-white/10 hover:border-white/40 transition"
                  >
                    {{ countryLabel }}
                  </NuxtLink>
                </div>

                <h1 class="text-xl font-semibold sm:text-3xl">
                  {{ movie?.title }}
                </h1>

                <p
                  v-if="movie?.original_title"
                  class="text-xs text-zinc-400 sm:text-sm"
                >
                  原題：{{ movie?.original_title }}
                </p>

                <p v-if="movie?.title_kana" class="text-xs text-zinc-400">
                  {{ movie?.title_kana }}
                </p>

                <p
                  v-if="movie?.description"
                  class="mt-1 line-clamp-3 max-w-xl text-xs text-zinc-300 sm:text-sm"
                >
                  {{ movie?.description }}
                </p>

                <div v-if="genres.length" class="mt-1 flex flex-wrap gap-2 text-xs">
                   <NuxtLink 
                      v-for="g in genres" 
                      :key="g.slug"
                      :to="`/search?genres=${g.slug}`"
                      class="text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      {{ g.label }}
                    </NuxtLink>
                </div>

                <div class="mt-2 space-y-0.5">
                  <p v-if="movie?.director" class="text-xs text-zinc-400">
                    <span class="opacity-70">監督：</span>
                    <NuxtLink :to="`/search?q=${movie?.director}`" class="text-zinc-300 hover:text-white hover:underline">
                      {{ movie?.director }}
                    </NuxtLink>
                  </p>
                  
                  <p v-if="castList.length" class="text-xs text-zinc-400">
                    <span class="opacity-70">出演：</span>
                    <span class="text-zinc-300">
                      <template v-for="(actor, idx) in castList" :key="idx">
                        <NuxtLink :to="`/search?q=${actor}`" class="hover:text-white hover:underline">{{ actor }}</NuxtLink>
                        <span v-if="idx < castList.length - 1" class="text-zinc-600">, </span>
                      </template>
                    </span>
                  </p>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-full bg-white px-5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 sm:px-6 sm:text-sm"
                    @click="scrollToPlayer"
                  >
                    再生
                  </button>

                  <button
                    v-if="movie?.id"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-full bg-zinc-900/60 px-3 py-1 text-[11px] text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-800 sm:text-xs"
                    @click="handleToggleMyList"
                  >
                    <span v-if="inMyList">✔ マイリストに追加済み</span>
                    <span v-else>＋ マイリストに追加</span>
                  </button>
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
          <div v-if="activeCollectionInfo" class="text-[11px] text-zinc-400">
            <span v-if="activeCollectionInfo.providerName">
              Provider: {{ activeCollectionInfo.providerName }}
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
          class="overflow-hidden rounded-2xl border border-white/10 bg-black/60"
        >
          <StreamingPlayer
            v-if="playerSrc"
            :key="activePart ? activePart.id : playerSrc"
            :src="playerSrc"
            :poster="playerPoster"
            :title="playerTitle"
            :startTime="movieStartTime"
            :subtitles="activePartSubtitles" 
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted } from "vue";
import { useRoute, useSupabaseClient, useSeoMeta, useHead, navigateTo, useNuxtApp, useRequestURL, useAsyncData } from "#imports";
import StreamingPlayer from "~/components/StreamingPlayer.vue";
import MovieRow from "~/components/MovieRow.vue";
import { useMyList } from "~/composables/useMyList";
import { useContinueWatching } from "~/composables/useContinueWatching";

// Types
type SubtitleItem = { src: string; label: string; lang: string }

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
  movie_genres?: {
    genre: {
      slug: string;
      name: string | null;
      name_ja: string | null;
    } | null;
  }[];
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
  subtitles?: SubtitleItem[]; // JSONB column
};

type ProviderRow = {
  id: number;
  name: string;
  website_url: string | null;
};

type RelatedItem = {
  id: number;
  slug: string;
  title: string;
  poster_url: string | null;
  banner_url: string | null;
  type: 'movie' | 'series';
};

const route = useRoute();
const supabase = useSupabaseClient<any>();

const errorMessage = ref("");

// Refs
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
  movie.value ? isInMyList(movie.value.id, 'movie') : false
);

const handleToggleMyList = () => {
  if (!movie.value) return;
  toggleMyList(movie.value.id, 'movie');
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
    JP: "日本", US: "アメリカ", KR: "韓国", CN: "中国", TW: "台湾", 
    HK: "香港", GB: "イギリス", FR: "フランス", DE: "ドイツ", VN: "ベトナム",
  };
  return map[code] || code;
});

const castList = computed(() => {
  if (!movie.value?.main_cast) return [];
  return movie.value.main_cast.split(',').map(c => c.trim()).filter(Boolean);
});

const genres = computed(() => {
  if (!movie.value?.movie_genres) return [];
  return movie.value.movie_genres
    .map(mg => mg.genre)
    .filter(g => g !== null)
    .map(g => ({
      slug: g!.slug,
      label: g!.name_ja || g!.name || g!.slug
    }));
});

const posterUrl = computed(() => {
  const raw = movie.value?.poster_url;
  return getResizedUrl(raw, 450, 675, 'contain') || "/images/fallback-poster.webp";
});

const heroBackgroundStyle = computed(() => {
  const bgRaw = movie.value?.banner_url || movie.value?.poster_url;
  if (!bgRaw) return "";
  
  const bgOptimized = getResizedUrl(bgRaw, 1920, 1080, 'cover');
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

// [MỚI] Subtitles cho Movie Part
const activePartSubtitles = computed(() => {
  const part = activePart.value
  if (!part || !part.subtitles || !Array.isArray(part.subtitles)) return []
  return part.subtitles
})

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

const playerSrc = computed(() => activePart.value?.video_path || "");
const playerPoster = computed(() => {
  // 1. Thumbnail của Part
  if (activePart.value?.thumbnail_url) {
    return getResizedUrl(activePart.value.thumbnail_url, 1280, 720, 'cover')
  }

  // 2. Banner của Movie
  if (movie.value?.banner_url) {
    return getResizedUrl(movie.value.banner_url, 1280, 720, 'cover')
  }

  // 3. Fallback
  return posterUrl.value || "/images/fallback-poster.webp"
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

const relatedRowItems = computed(() =>
  relatedMovies.value.map((m: any) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    // Lấy thumbnail
    thumbnail: getResizedUrl(m.poster_url || m.banner_url, 450, 675, 'contain') || "/images/fallback-poster.webp",
    type: m.type,
    // [MỚI] Thêm các trường này để Card hiện full thông tin
    year: m.year,
    vote_average: m.vote_average, 
    quality: 'HD' // Hoặc lấy từ DB nếu có cột quality
  }))
);

// --- FETCH DATA (RETURN OBJECT) ---
const { status, error, data: pageData } = await useAsyncData(
  `movie-${routeSlug.value}`,
  async () => {
    const nuxtApp = useNuxtApp();
    const result = {
      movie: null as DbMovie | null,
      collections: [] as MovieCollectionRow[],
      parts: [] as MoviePartRow[],
      providers: [] as ProviderRow[],
      relatedMovies: [] as RelatedItem[],
      errorMessage: ''
    }

    const slug = routeSlug.value;
    if (!slug) {
      result.errorMessage = "無効なURLです。";
      return result;
    }

    const { data: movieData, error: movieError } = await supabase
      .from("movies")
      .select(
        "id, slug, title, original_title, title_kana, year, origin_country, description, poster_url, banner_url, director, main_cast, movie_genres(genre:genres(slug, name, name_ja))"
      )
      .eq("slug", slug)
      .single();

    if (movieError) {
      if (movieError.code !== 'PGRST116') {
        result.errorMessage = movieError.message
        return result
      }
    }

    if (movieData) {
      result.movie = movieData as unknown as DbMovie; 
      const movieId = result.movie!.id;

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
        .select("id, name, website_url")
        .order("name", { ascending: true });

      result.providers = (provData ?? []) as ProviderRow[];

      // Related Logic
      // @ts-ignore
      const currentGenreSlugs = movieData.movie_genres?.map((mg: any) => mg.genre?.slug).filter(Boolean) || [];

      let relatedQuery = supabase
        .from("all_contents")
        .select("id, slug, title, poster_url, banner_url, type")
        .neq("id", movieId); 

      if (currentGenreSlugs.length > 0) {
        relatedQuery = relatedQuery.overlaps("genre_slugs", currentGenreSlugs);
      }

      const { data: relData } = await relatedQuery
        .order("created_at", { ascending: false })
        .limit(12);

      result.relatedMovies = (relData ?? []) as RelatedItem[];

      return result;
    }

    // Redirect
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
  }
);

// --- SYNC DATA (WATCH) ---
watch(pageData, (newData) => {
  if (newData) {
    if (newData.errorMessage) {
      errorMessage.value = newData.errorMessage
      return
    }

    movie.value = newData.movie
    collections.value = newData.collections
    parts.value = newData.parts
    providers.value = newData.providers
    relatedMovies.value = newData.relatedMovies

    // Setup Default Collection/Part
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
}, { immediate: true })

onMounted(async () => {
  if (import.meta.server) return;
  // (Tuỳ chọn) await scrollToPlayer(); 
});

// SEO ... (Giữ nguyên)
const url = useRequestURL();

const canonicalUrl = computed(() => {
  return `${url.origin}/movie/${routeSlug.value}`;
});

const seoTitle = computed(() =>
  movie.value 
    ? `${movie.value.title} 無料動画 | MugenTV.com` 
    : "無料動画 | MugenTV.com"
);

const seoDescription = computed(
  () =>
    movie.value?.description ?? "映画やドラマをオンラインで楽しめるMyStream。"
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
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.value?.title,
        "alternateName": movie.value?.original_title,
        "description": movie.value?.description,
        "image": posterUrl.value,
        "datePublished": movie.value?.year?.toString(),
        "countryOfOrigin": {
          "@type": "Country",
          "name": movie.value?.origin_country
        },
        "director": movie.value?.director ? {
          "@type": "Person",
          "name": movie.value.director
        } : undefined,
        "actor": movie.value?.main_cast ? movie.value.main_cast.split(',').map(name => ({
          "@type": "Person",
          "name": name.trim()
        })) : undefined,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "JPY",
          "availability": "https://schema.org/InStock"
        }
      }))
    }
  ]
});

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
});
</script>