<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex h-full items-center justify-center py-20 text-zinc-300"
    >
      Loading...
    </div>

    <!-- Error / Not found -->
    <div
      v-else-if="errorMessage || !movie"
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

    <!-- Content -->
    <div v-else class="pb-10">
      <!-- Hero -->
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
            class="relative mx-auto flex h-full max-w-5xl items end px-4 pb-6 sm:px-8 sm:pb-10"
          >
            <div class="flex gap-4 sm:gap-6">
              <!-- Thumbnail -->
              <div
                class="hidden w-[140px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900/80 shadow-lg sm:block"
              >
                <img
                  :src="posterUrl"
                  :alt="movie.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <!-- Text -->
              <div class="flex flex-col gap-2">
                <div
                  class="inline-flex items-center gap-2 text-[11px] text-zinc-300 sm:text-xs"
                >
                  <span v-if="movie.year">{{ movie.year }}</span>
                  <span
                    v-if="countryLabel"
                    class="rounded border border-white/20 px-1.5 py-0.5"
                  >
                    {{ countryLabel }}
                  </span>
                </div>

                <h1 class="text-xl font-semibold sm:text-3xl">
                  {{ movie.title }}
                </h1>

                <p
                  v-if="movie.original_title"
                  class="text-xs text-zinc-400 sm:text-sm"
                >
                  原題：{{ movie.original_title }}
                </p>

                <p v-if="movie.title_kana" class="text-xs text-zinc-400">
                  {{ movie.title_kana }}
                </p>

                <p
                  v-if="movie.description"
                  class="mt-1 line-clamp-3 max-w-xl text-xs text-zinc-300 sm:text-sm"
                >
                  {{ movie.description }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-full bg-white px-5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 sm:px-6 sm:text-sm"
                    @click="scrollToPlayer"
                  >
                    再生
                  </button>

                  <button
                    v-if="movie.id"
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

      <!-- Player + collection/part selectors -->
      <section
        ref="playerSectionRef"
        class="mx-auto mt-6 max-w-5xl px-4 sm:mt-8 sm:px-8"
      >
        <!-- Collection selector -->
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

        <!-- Part selector -->
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
                  : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'
              "
              @click="selectedPartId = p.id"
            >
              {{
                p.title || (p.part_number ? `Part ${p.part_number}` : "Part")
              }}
            </button>
          </div>
        </div>

        <!-- Player -->
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

      <!-- Related -->
      <section v-if="relatedMovies.length" class="mt-10 px-4 sm:px-8">
        <MovieRow
          title="あなたにおすすめ"
          :movies="relatedRowItems"
          sub-label="この作品に基づくおすすめ"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import { useRoute, useSupabaseClient, useSeoMeta, useHead } from "#imports";
import StreamingPlayer from "~/components/StreamingPlayer.vue";
import MovieRow from "~/components/MovieRow.vue";
import { useMyList } from "~/composables/useMyList";
import { useContinueWatching } from "~/composables/useContinueWatching";

type DbMovie = {
  id: number;
  title: string;
  original_title?: string | null;
  title_kana?: string | null;
  year?: number | null;
  origin_country?: string | null;
  description?: string | null;
  poster_url?: string | null;
  banner_url?: string | null;
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
};

type ProviderRow = {
  id: number;
  name: string;
  website_url: string | null;
};

type RelatedMovieRow = {
  id: number;
  title: string;
  poster_url: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient<any>();

const loading = ref(true);
const errorMessage = ref("");

const movie = ref<DbMovie | null>(null);
const collections = ref<MovieCollectionRow[]>([]);
const parts = ref<MoviePartRow[]>([]);
const providers = ref<ProviderRow[]>([]);
const relatedMovies = ref<RelatedMovieRow[]>([]);

const selectedCollectionId = ref<number | null>(null);
const selectedPartId = ref<number | null>(null);

// My List
const { isInMyList, toggleMyList } = useMyList();
const inMyList = computed(() =>
  movie.value ? isInMyList(movie.value.id) : false
);

const handleToggleMyList = () => {
  if (!movie.value) return;
  toggleMyList(movie.value.id);
};

// Continue Watching
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

// Scroll to player
const playerSectionRef = ref<HTMLElement | null>(null);
const scrollToPlayer = async () => {
  await nextTick();
  playerSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

// Country label mapping
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

// Hero visuals
const posterUrl = computed(
  () => movie.value?.poster_url || "/images/fallback-poster.webp"
);

const heroBackgroundStyle = computed(() => {
  const bg = movie.value?.banner_url || movie.value?.poster_url;
  if (!bg) return "";
  return `background-image: url('${bg}')`;
});

// Collection options
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
const playerPoster = computed(
  () => activePart.value?.thumbnail_url || posterUrl.value
);
const playerTitle = computed(() => {
  if (!movie.value) return "";
  const base = movie.value.title;
  const part = activePart.value;
  if (!part) return base;
  if (partsForActiveCollection.value.length <= 1) return base;
  const partLabel = part.part_number ? `Part ${part.part_number}` : "";
  return partLabel ? `${base} - ${partLabel}` : base;
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

// Related row items
const relatedRowItems = computed(() =>
  relatedMovies.value.map((m) => ({
    id: m.id,
    title: m.title,
    thumbnail: m.poster_url || "/images/fallback-poster.webp",
  }))
);

// Load data
const loadData = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const idParam = Number(route.params.id);
    if (!Number.isFinite(idParam)) {
      errorMessage.value = "不正なIDです。";
      return;
    }

    // Movie
    const { data: movieData, error: movieError } = await supabase
      .from("movies")
      .select(
        "id, title, original_title, title_kana, year, origin_country, description, poster_url, banner_url"
      )
      .eq("id", idParam)
      .single();

    if (movieError) {
      errorMessage.value = movieError.message;
      return;
    }

    if (!movieData) {
      errorMessage.value = "作品が見つかりませんでした。";
      return;
    }

    movie.value = movieData as DbMovie;

    // Collections
    const { data: colData } = await supabase
      .from("movie_collections")
      .select(
        "id, name, type, audio_language, subtitle_language, provider_id, is_default"
      )
      .eq("movie_id", idParam)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    collections.value = (colData ?? []) as MovieCollectionRow[];

    // Parts
    const { data: partData } = await supabase
      .from("movie_parts")
      .select(
        "id, movie_id, collection_id, part_number, title, video_path, thumbnail_url, duration_minutes"
      )
      .eq("movie_id", idParam)
      .order("part_number", { ascending: true });

    parts.value = (partData ?? []) as MoviePartRow[];

    // Providers
    const { data: provData } = await supabase
      .from("collection_providers")
      .select("id, name, website_url")
      .order("name", { ascending: true });

    providers.value = (provData ?? []) as ProviderRow[];

    // Related movies (simple)
    const { data: relData } = await supabase
      .from("movies")
      .select("id, title, poster_url")
      .neq("id", idParam)
      .order("id", { ascending: false })
      .limit(12);

    relatedMovies.value = (relData ?? []) as RelatedMovieRow[];

    // Default collection & part
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
  } finally {
    loading.value = false;
  }
};

await loadData();

// SEO
const seoTitle = computed(() =>
  movie.value ? `${movie.value.title} | MyStream` : "MyStream"
);
const seoDescription = computed(
  () =>
    movie.value?.description ?? "映画やドラマをオンラインで楽しめるMyStream。"
);
const seoImage = computed(
  () =>
    movie.value?.banner_url || movie.value?.poster_url || "/images/banner.jpg"
);

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: seoImage,
  twitterCard: "summary_large_image",
});

useHead({
  title: seoTitle.value,
});
</script>
