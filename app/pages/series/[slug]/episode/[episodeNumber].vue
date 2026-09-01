<template>
  <div class="relative min-h-[calc(100vh-4rem)] bg-black text-white">
    <!-- Hiệu ứng ảnh nền mờ (Cinematic Background) -->
    <div
      class="absolute inset-0 bg-cover bg-center blur-2xl brightness-[0.2] pointer-events-none"
      :style="heroBackgroundStyle"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/90 to-black pointer-events-none" />

    <div class="relative z-10">
      <div
        v-if="status === 'pending'"
        class="flex h-screen items-center justify-center py-20 text-zinc-300"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <div
        v-else-if="error || errorMessage || !series"
        class="flex h-screen items-center justify-center py-20 text-zinc-200"
      >
        <div class="text-center">
          <p class="text-sm">
            {{ errorMessage || "エピソードが見つかりませんでした。" }}
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
        <!-- BREADCRUMB -->
        <nav aria-label="Breadcrumb" class="px-4 py-3 sm:px-8">
          <ol class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 text-[10px] text-zinc-400 sm:text-xs">
            <li><NuxtLink to="/" class="hover:text-white hover:underline">ホーム</NuxtLink></li>
            <li><span class="text-zinc-600">/</span></li>
            <li><NuxtLink to="/search?type=series" class="hover:text-white hover:underline">シリーズ</NuxtLink></li>
            <li><span class="text-zinc-600">/</span></li>
            <li>
              <NuxtLink :to="`/series/${series?.slug}`" class="hover:text-white hover:underline max-w-[150px] truncate sm:max-w-xs">
                {{ series?.title }}
              </NuxtLink>
            </li>
            <li><span class="text-zinc-600">/</span></li>
            <li class="text-zinc-200 font-medium" aria-current="page">
              <span v-if="activeEpisode?.season_number">S{{ activeEpisode.season_number }} - </span>
              第{{ currentEpisodeNumber }}話
            </li>
          </ol>
        </nav>

        <!-- PLAYER & SIDEBAR SECTION -->
        <section class="mx-auto mt-2 flex max-w-7xl flex-col gap-6 px-4 lg:flex-row sm:px-8">
          
          <!-- CỘT TRÁI: KHU VỰC VIDEO PLAYER & THÔNG TIN -->
          <div class="flex flex-col gap-4 lg:w-2/3">
            
            <AdSlot position="player_top_desktop" device="desktop" />
            <AdSlot position="player_top_mobile" device="mobile" />

            <!-- Khung Player -->
            <div class="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ring-1 ring-white/5 aspect-video">
              <ClientOnly>
                <UniversalPlayer
                  v-if="playerSrc"
                  :key="playerKey"
                  :src="playerSrc"
                  :poster="playerPoster"
                  :title="playerTitle"
                  :startTime="episodeStartTime"
                  :subtitles="activeEpisodeSubtitles"
                  :content-id="activeEpisode?.id"
                  content-type="series"
                  :provider="activeProvider"
                  @timeupdate="handlePlayerTimeUpdate"
                  @ended="handlePlayerEnded"
                />
                <div v-else class="flex h-full items-center justify-center text-sm text-zinc-400">
                  再生可能な動画ソースが登録されていません。
                </div>
              </ClientOnly>
            </div>

            <AdSlot position="player_bottom_desktop" device="desktop" />
            <AdSlot position="player_bottom_mobile" device="mobile" />

            <!-- Bộ chọn Phiên bản -->
            <div v-if="collectionOptions.length" class="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300 mt-2">
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
                <span v-if="activeCollectionInfo.languages">・{{ activeCollectionInfo.languages }}</span>
              </div>
            </div>

            <!-- Nút chức năng (Thêm nút Edit cho Admin) -->
            <div class="flex flex-wrap items-center gap-3 border-b border-white/5 pb-4 mt-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/20 transition backdrop-blur-sm"
                @click="handleToggleMyList"
              >
                <span v-if="inMyList" class="text-emerald-400">✔</span>
                <span v-else>＋</span>
                マイリスト
              </button>

              <button
                type="button"
                @click="handleShare"
                class="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                title="共有"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              </button>

              <NuxtLink
                v-if="isAdmin && series?.id"
                :to="`/admin/series/${series.id}`"
                class="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition backdrop-blur-sm border border-amber-500/20 ml-auto sm:ml-0"
                title="管理画面で編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                編集
              </NuxtLink>
            </div>

            <!-- Khối danh sách tập cho Mobile -->
            <div class="block lg:hidden mt-2">
              <div class="rounded-xl bg-zinc-900/50 p-4 ring-1 ring-white/5 backdrop-blur-sm">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-sm font-semibold text-white">エピソード</span>
                  <span class="text-[10px] text-zinc-400">全{{ episodesForSeason.length }}話</span>
                </div>

                <div v-if="seasons.length > 1" class="mb-3 flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                  <button
                    v-for="s in seasons"
                    :key="s"
                    type="button"
                    class="whitespace-nowrap rounded-full px-3 py-1 text-[11px] ring-1 transition"
                    :class="s === selectedSeason ? 'bg-zinc-100 text-black ring-zinc-200' : 'bg-zinc-800 text-zinc-400 ring-zinc-700'"
                    @click="selectedSeason = s"
                  >
                    シーズン {{ s }}
                  </button>
                </div>

                <div class="flex flex-wrap gap-2 p-2 max-h-60 overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20">
                  <NuxtLink
                    v-for="ep in episodesForSeason"
                    :key="ep.id"
                    :to="episodeLink(ep)"
                    :id="ep.episode_number === currentEpisodeNumber ? 'active-ep-mobile' : undefined"
                    class="flex h-10 min-w-[3rem] items-center justify-center rounded-lg px-3 text-xs font-medium transition ring-1"
                    :class="ep.episode_number === currentEpisodeNumber ? 'bg-emerald-600 text-white ring-emerald-400 font-bold' : 'bg-zinc-800 text-zinc-300 ring-zinc-700 hover:bg-zinc-700 hover:text-white hover:ring-zinc-500'"
                  >
                    {{ ep.episode_number }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Thông tin Series & Tập phim -->
            <div class="mt-4 space-y-4 bg-zinc-900/20 p-4 rounded-xl border border-white/5">
              <div>
                <h1 class="text-xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-md">
                  {{ series?.title }}
                </h1>
                <p class="mt-2 text-sm text-emerald-400 font-medium">
                  <span v-if="activeEpisode?.title">{{ activeEpisode.title }}</span>
                  <span v-else>第{{ currentEpisodeNumber }}話</span>
                </p>
                <div class="mt-2 text-xs text-zinc-400 space-y-1">
                  <p v-if="series?.original_title">原題：{{ series?.original_title }}</p>
                  <p v-if="series?.title_kana">{{ series?.title_kana }}</p>
                </div>
              </div>

              <div>
                <h3 class="mb-1 text-sm font-semibold text-white">あらすじ</h3>
                <p class="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                  {{ series?.description || "あらすじはまだ登録されていません。" }}
                </p>
              </div>

              <div class="grid grid-cols-1 gap-y-3 gap-x-8 text-xs sm:grid-cols-2 pt-2 border-t border-white/5 mt-4">
                <div v-if="genres.length">
                  <span class="text-zinc-500 block mb-1">ジャンル</span>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink v-for="g in genres" :key="g.slug" :to="`/search?genres=${g.slug}`" class="text-emerald-400 hover:underline hover:text-emerald-300">
                      {{ g.label }}
                    </NuxtLink>
                  </div>
                </div>

                <div v-if="casts.length">
                  <span class="text-zinc-500 block mb-1">キャスト</span>
                  <div class="flex flex-wrap gap-1 text-zinc-300">
                    <template v-for="(actor, idx) in casts" :key="actor.id">
                      <NuxtLink :to="`/person/${actor.id}`" class="hover:text-white hover:underline">{{ actor.name }}</NuxtLink>
                      <span v-if="idx < casts.length - 1" class="text-zinc-600">,</span>
                    </template>
                  </div>
                </div>

                <div v-if="directors.length">
                  <span class="text-zinc-500 block mb-1">監督</span>
                  <div class="flex flex-wrap gap-1 text-zinc-300">
                    <template v-for="(dir, idx) in directors" :key="dir.id">
                      <NuxtLink :to="`/person/${dir.id}`" class="hover:text-white hover:underline">{{ dir.name }}</NuxtLink>
                      <span v-if="idx < directors.length - 1" class="text-zinc-600">,</span>
                    </template>
                  </div>
                </div>

                <div>
                  <span class="text-zinc-500 block mb-1">情報</span>
                  <div class="flex flex-wrap gap-3 text-zinc-300">
                    <span v-if="series?.year">
                      <NuxtLink :to="`/search?year=${series.year}`" class="hover:text-white hover:underline">{{ series.year }}年</NuxtLink>
                    </span>
                    <span v-if="countryLabel">
                      <NuxtLink :to="`/search?countries=${series?.origin_country}`" class="hover:text-white hover:underline">{{ countryLabel }}</NuxtLink>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CỘT PHẢI: DANH SÁCH TẬP PHIM (DESKTOP) -->
          <aside class="hidden w-full lg:block lg:w-1/3">
            <div class="sticky top-20 rounded-2xl bg-zinc-900/50 p-4 ring-1 ring-white/5 backdrop-blur-md">
              <div v-if="seasons.length > 1" class="mb-4 flex flex-wrap items-center gap-2">
                <span class="text-[11px] text-zinc-400">シーズン</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in seasons"
                    :key="s"
                    type="button"
                    class="rounded-full px-3 py-1 text-[11px] ring-1 transition"
                    :class="s === selectedSeason ? 'bg-zinc-100 text-black ring-zinc-200' : 'bg-zinc-800 text-zinc-400 ring-zinc-700 hover:bg-zinc-700'"
                    @click="selectedSeason = s"
                  >
                    {{ s }}
                  </button>
                </div>
              </div>

              <div>
                <p class="mb-3 text-xs font-medium text-zinc-400">
                  エピソード (全{{ episodesForSeason.length }}話)
                </p>
                <div class="max-h-[calc(100vh-200px)] overflow-y-auto p-2 custom-scrollbar border border-white/5 rounded-lg bg-black/40">
                  <div class="flex flex-wrap gap-2 pb-2">
                    <NuxtLink
                      v-for="ep in episodesForSeason"
                      :key="ep.id"
                      :to="episodeLink(ep)"
                      :id="ep.episode_number === currentEpisodeNumber ? 'active-ep-desktop' : undefined"
                      class="flex h-10 min-w-[3rem] items-center justify-center rounded-lg px-3 text-xs font-medium transition ring-1"
                      :class="ep.episode_number === currentEpisodeNumber ? 'bg-emerald-600 text-white ring-emerald-400 font-bold' : 'bg-zinc-800 text-zinc-300 ring-zinc-700 hover:bg-zinc-700 hover:text-white hover:ring-zinc-500'"
                      :title="ep.title || `第${ep.episode_number}話`"
                    >
                      {{ ep.episode_number }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <!-- RELATED SERIES -->
        <section v-if="relatedSeries.length" class="mt-10 max-w-7xl mx-auto px-4 pb-12 sm:px-8">
          <MovieRow title="あなたにおすすめ" :movies="relatedRowItems" sub-label="この作品に似ているシリーズ・映画" />
        </section>
      </div>
    </div>
    
    <ShareModal v-model="showShareModal" :title="shareTitle" :url="shareUrl" />
  </div>
  <ClientOnly>
    <GlobalScripts position="popunder_player" target="body" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from "vue";
import {
  useRoute,
  useRouter,
  useSupabaseClient,
  useSupabaseUser,
  useSeoMeta,
  useHead,
  navigateTo,
  useNuxtApp,
  useRequestURL,
  useAsyncData,
} from "#imports";
import UniversalPlayer from "~/components/UniversalPlayer.vue";
import MovieRow from "~/components/MovieRow.vue";
import ShareModal from "~/components/ShareModal.vue";
import { useContinueWatching } from "~/composables/useContinueWatching";
import { useMyList } from "~/composables/useMyList";
import { getResizedUrl } from "~/utils/image";

// Khởi tạo User để check phân quyền Admin
const user = useSupabaseUser();
const isAdmin = computed(() => !!user.value);

type CrewMember = { id: number; name: string };

type SeriesRow = {
  id: number;
  slug: string;
  title: string;
  original_title?: string | null;
  title_kana?: string | null;
  origin_country?: string | null;
  description?: string | null;
  poster_url?: string | null;
  banner_url?: string | null;
  year?: number | null;
  created_at?: string;
  series_genres?: {
    genre: {
      slug: string;
      name: string | null;
      name_ja: string | null;
    } | null;
  }[];
};

type EpisodeCollectionRow = {
  id: number;
  name: string;
  type: string | null;
  audio_language: string | null;
  subtitle_language: string | null;
  provider_id: number | null;
  is_default: boolean | null;
  series_id?: number;
};

type SubtitleItem = { src: string; label: string; lang: string };

type EpisodeRow = {
  id: number;
  series_id: number;
  collection_id: number | null;
  season_number: number | null;
  episode_number: number;
  title: string | null;
  video_path: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  subtitles?: SubtitleItem[];
  created_at?: string;
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
  year?: number;
  origin_country?: string;
  genre_label?: string;
  description?: string;
  episode_count?: number;
};

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();

const errorMessage = ref("");

const series = ref<SeriesRow | null>(null);
const directors = ref<CrewMember[]>([]); 
const casts = ref<CrewMember[]>([]);     
const collections = ref<EpisodeCollectionRow[]>([]);
const episodes = ref<EpisodeRow[]>([]);
const providers = ref<ProviderRow[]>([]);
const relatedSeries = ref<RelatedItem[]>([]);

const selectedCollectionId = ref<number | null>(null);
const selectedSeason = ref<number | null>(null);
const isInitializing = ref(true);

const showShareModal = ref(false)
const shareTitle = computed(() => seoTitle.value)
const shareUrl = computed(() => {
  if (import.meta.client) return window.location.href
  return ''
})

const handleShare = async () => {
  if (import.meta.client && navigator.share) {
    try {
      await navigator.share({
        title: shareTitle.value,
        text: seoDescription.value,
        url: shareUrl.value,
      })
      return
    } catch (err) {
      console.log('Share canceled or failed, falling back to modal')
    }
  }
  showShareModal.value = true
}

const { setProgress, clearProgressForMovie, getEntry } = useContinueWatching();
const { isInMyList, toggleMyList } = useMyList();

const inMyList = computed(() =>
  series.value ? isInMyList(series.value.id, "series") : false
);
const handleToggleMyList = () => {
  if (!series.value) return;
  toggleMyList(series.value.id, "series");
};

const slugParam = computed(() => String(route.params.slug || ""));
const episodeNumberParam = computed(() => {
  const raw = Number(route.params.episodeNumber);
  return Number.isFinite(raw) ? raw : NaN;
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

const countryLabel = computed(() => {
  const code = series.value?.origin_country;
  if (!code) return "";
  return countryMap[code] || code;
});

const genres = computed(() => {
  if (!series.value?.series_genres) return [];
  return series.value.series_genres
    .map((sg) => sg.genre)
    .filter((g) => g !== null)
    .map((g) => ({
      slug: g!.slug,
      label: g!.name_ja || g!.name || g!.slug,
    }));
});

const collectionFromQuery = computed<number | null>(() => {
  const raw = route.query.collection;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});

const uniqueEpisodesByKey = computed<EpisodeRow[]>(() => {
  const map = new Map<string, EpisodeRow>();
  for (const ep of episodes.value) {
    const season = ep.season_number ?? 1;
    const key = `${season}-${ep.episode_number}`;
    if (!map.get(key)) {
      map.set(key, { ...ep, season_number: season });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const sa = a.season_number ?? 1;
    const sb = b.season_number ?? 1;
    if (sa !== sb) return sa - sb;
    return a.episode_number - b.episode_number;
  });
});

const seasons = computed<number[]>(() => {
  const set = new Set<number>();
  for (const ep of uniqueEpisodesByKey.value) {
    set.add(ep.season_number ?? 1);
  }
  return Array.from(set).sort((a, b) => a - b);
});

const episodesForSeason = computed<EpisodeRow[]>(() => {
  if (!uniqueEpisodesByKey.value.length) return [];
  const s =
    selectedSeason.value ?? (seasons.value.length ? seasons.value[0] : null);
  if (s == null) return [];
  return uniqueEpisodesByKey.value.filter(
    (ep) => (ep.season_number ?? 1) === s
  );
});

const variantsForCurrentEpisode = computed<EpisodeRow[]>(() => {
  const num = episodeNumberParam.value;
  if (!Number.isFinite(num)) return [];
  return episodes.value.filter((ep) => ep.episode_number === num);
});

const activeEpisode = computed<EpisodeRow | null>(() => {
  const variants = variantsForCurrentEpisode.value;
  if (!variants.length) return null;

  if (selectedCollectionId.value != null) {
    const found = variants.find(
      (ep) => ep.collection_id === selectedCollectionId.value
    );
    if (found) return found;
  }
  return variants[0] ?? null;
});

const activeEpisodeSubtitles = computed(() => {
  const ep = activeEpisode.value;
  if (!ep || !ep.subtitles || !Array.isArray(ep.subtitles)) return [];
  return ep.subtitles;
});

const currentEpisodeNumber = computed(() => {
  const ep = activeEpisode.value;
  if (ep) return ep.episode_number;
  const n = episodeNumberParam.value;
  return Number.isFinite(n) ? n : 0;
});

const collectionOptions = computed(() => {
  const variants = variantsForCurrentEpisode.value;
  if (!variants.length) return [];
  const set = new Set<number>();
  for (const ep of variants) {
    if (ep.collection_id != null) set.add(ep.collection_id);
  }
  if (!set.size) return [];
  return collections.value
    .filter((c) => set.has(c.id))
    .map((c) => {
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
    });
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
  const path = activeEpisode.value?.video_path || "";
  if (!path) return "";
  if (path.startsWith('http')) return path; 
  const baseUrl = config.public.streamUrl;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
});

const playerPoster = computed(() => {
  if (activeEpisode.value?.thumbnail_url) {
    return getResizedUrl(activeEpisode.value.thumbnail_url, 1280, 720, "cover");
  }
  if (series.value?.banner_url) {
    return getResizedUrl(series.value.banner_url, 1280, 720, "cover");
  }
  return series.value?.poster_url
    ? getResizedUrl(series.value.poster_url, 1280, 720, "contain")
    : "/images/fallback-poster.webp";
});

// Tính toán Ảnh nền mờ Cinematic (Hero Background)
const heroBackgroundStyle = computed(() => {
  const bgRaw = series.value?.banner_url || series.value?.poster_url;
  if (!bgRaw) return "";
  const bgOptimized = getResizedUrl(bgRaw, 1920, 1080, "cover");
  return `background-image: url('${bgOptimized}')`;
});

const playerTitle = computed(() => {
  if (!series.value || !activeEpisode.value) return "";
  const base = series.value.title;
  const ep = activeEpisode.value;
  const suffix = ep.title ? ep.title : `第${ep.episode_number}話`;
  return `${base} ${suffix}`;
});

const playerKey = computed(() => {
  const ep = activeEpisode.value;
  return ep ? `ep-${ep.id}` : playerSrc.value;
});

const episodeStartTime = computed(() => {
  const ep = activeEpisode.value;
  if (!ep) return 0;
  const entry = getEntry(ep.id);
  if (!entry) return 0;
  if (!entry.duration || entry.duration < 60) return 0;
  if (entry.currentTime < 10 || entry.duration - entry.currentTime < 10) {
    return 0;
  }
  return entry.currentTime;
});

const lastSavedAt = ref(0);
const handlePlayerTimeUpdate = (payload: {
  currentTime: number;
  duration: number;
}) => {
  const ep = activeEpisode.value;
  if (!ep) return;
  const now = performance.now();
  if (now - lastSavedAt.value < 2000) return;
  lastSavedAt.value = now;
  setProgress(ep.id, payload.currentTime, payload.duration);
};

const handlePlayerEnded = () => {
  const ep = activeEpisode.value;
  if (!ep) return;
  clearProgressForMovie(ep.id);
};

const episodeLink = (ep: EpisodeRow) => {
  const slug = series.value?.slug || slugParam.value;
  const path = `/series/${slug}/episode/${ep.episode_number}`;
  if (selectedCollectionId.value != null) {
    return {
      path,
      query: { ...route.query, collection: selectedCollectionId.value },
    };
  }
  const { collection, ...restQuery } = route.query;
  return { path, query: restQuery };
};

const relatedRowItems = computed(() =>
  relatedSeries.value.map((m: any) => ({
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
} = await useAsyncData(
  `series-${slugParam.value}-ep-${episodeNumberParam.value}`,
  async () => {
    const nuxtApp = useNuxtApp();
    const result = {
      series: null as SeriesRow | null,
      directors: [] as CrewMember[], 
      casts: [] as CrewMember[],     
      collections: [] as EpisodeCollectionRow[],
      episodes: [] as EpisodeRow[],
      providers: [] as ProviderRow[],
      relatedSeries: [] as RelatedItem[],
      errorMessage: "",
    };

    const slug = slugParam.value;
    if (!slug) {
      result.errorMessage = "Invalid slug";
      return result;
    }

    const epNum = episodeNumberParam.value;
    if (!Number.isFinite(epNum) || epNum < 0) {
      result.errorMessage = "Invalid episode number";
      return result;
    }

    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select(
        "id, slug, title, original_title, title_kana, origin_country, description, poster_url, banner_url, year, created_at, series_genres(genre:genres(slug, name, name_ja))"
      )
      .eq("slug", slug)
      .single();

    if (seriesError || !seriesData) {
      result.errorMessage = "シリーズが見つかりませんでした。";
      return result;
    }

    result.series = seriesData as unknown as SeriesRow;

    const { data: crewData } = await supabase
      .from("content_crew")
      .select("role, persons(id, name)")
      .eq("content_id", result.series.id)
      .eq("type", "series");

    if (crewData) {
      result.directors = crewData
        .filter((c: any) => c.role === 'director' && c.persons)
        .map((c: any) => c.persons as CrewMember);
      
      result.casts = crewData
        .filter((c: any) => c.role === 'cast' && c.persons)
        .map((c: any) => c.persons as CrewMember);
    }

    const { data: colData } = await supabase
      .from("episode_collections")
      .select(
        "id, name, type, audio_language, subtitle_language, provider_id, is_default, series_id"
      )
      .eq("series_id", result.series.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    result.collections = (colData ?? []) as EpisodeCollectionRow[];

    const { data: provData } = await supabase
      .from("collection_providers")
      .select("id, name, website_url, player_type, embed_pattern")
      .order("name", { ascending: true });
    result.providers = (provData ?? []) as ProviderRow[];

    const { data: epData } = await supabase
      .from("episodes")
      .select(
        "id, series_id, collection_id, season_number, episode_number, title, video_path, thumbnail_url, duration_minutes, subtitles, created_at"
      )
      .eq("series_id", result.series.id)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true });
    result.episodes = (epData ?? []) as EpisodeRow[];

    // @ts-ignore
    const currentGenreSlugs =
      seriesData.series_genres
        ?.map((sg: any) => sg.genre?.slug)
        .filter(Boolean) || [];

    let relData: any[] = [];

    if (currentGenreSlugs.length > 0) {
      const { data } = await supabase
        .rpc("get_random_related_content", {
          filter_genre_slugs: currentGenreSlugs,
          exclude_id: result.series.id,
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
        .neq("id", result.series.id)
        .order("created_at", { ascending: false })
        .limit(12);
      relData = (data as any[]) || [];
    }
    result.relatedSeries = (relData ?? []) as RelatedItem[];

    return result;
  }
);

watch(
  pageData,
  (newData) => {
    if (newData) {
      if (newData.errorMessage) {
        errorMessage.value = newData.errorMessage;
        return;
      }

      series.value = newData.series;
      directors.value = newData.directors; 
      casts.value = newData.casts;         
      collections.value = newData.collections;
      episodes.value = newData.episodes;
      providers.value = newData.providers;
      relatedSeries.value = newData.relatedSeries;

      if (!episodes.value.length) {
        errorMessage.value = "エピソードがまだ登録されていません。";
        return;
      }

      const epNum = episodeNumberParam.value;
      const variants = episodes.value.filter(
        (ep) => ep.episode_number === epNum
      );

      if (!variants.length) {
        errorMessage.value = "指定されたエピソードが存在しません。";
        return;
      }

      let defaultCollectionId: number | null = null;
      const requestedCollectionId = collectionFromQuery.value;
      if (
        requestedCollectionId != null &&
        variants.some((ep) => ep.collection_id === requestedCollectionId)
      ) {
        defaultCollectionId = requestedCollectionId;
      }
      if (defaultCollectionId == null && collections.value.length) {
        const defaultCol =
          collections.value.find((c) => c.is_default) ?? collections.value[0];
        if (
          defaultCol &&
          variants.some((ep) => ep.collection_id === defaultCol.id)
        ) {
          defaultCollectionId = defaultCol.id;
        }
      }
      if (defaultCollectionId == null) {
        const firstWithCollection = variants.find(
          (ep) => ep.collection_id != null
        );
        defaultCollectionId = firstWithCollection
          ? firstWithCollection.collection_id
          : null;
      }
      selectedCollectionId.value = defaultCollectionId;
      const baseEp = variants[0];
      const season = baseEp?.season_number ?? 1;
      selectedSeason.value = season;
    }
  },
  { immediate: true }
);

isInitializing.value = false;

const scrollToActiveEpisode = async () => {
  if (import.meta.server) return;
  await nextTick();
  const mobileBtn = document.getElementById("active-ep-mobile");
  if (mobileBtn)
    mobileBtn.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  const desktopBtn = document.getElementById("active-ep-desktop");
  if (desktopBtn)
    desktopBtn.scrollIntoView({ behavior: "smooth", block: "center" });
};

watch(
  currentEpisodeNumber,
  () => {
    scrollToActiveEpisode();
  },
  { immediate: true }
);

watch(selectedCollectionId, (val) => {
  if (isInitializing.value) return;
  const slug = slugParam.value;
  const epNum = episodeNumberParam.value;
  if (!slug || (epNum !== 0 && !epNum)) return;
  const query: Record<string, any> = { ...route.query };
  if (val != null) query.collection = String(val);
  else delete query.collection;
  router.replace({ path: `/series/${slug}/episode/${epNum}`, query });
});

// --- SEO Configuration ---
const url = useRequestURL();
const canonicalUrl = computed(() => {
  return `${url.origin}/series/${slugParam.value}/episode/${currentEpisodeNumber.value}`;
});

const seoTitle = computed(() => {
  if (!series.value || !activeEpisode.value) {
    return "エピソード 無料動画 | NoriTV";
  }
  const ep = activeEpisode.value;
  const epLabel = ep.title ? ep.title : `第${ep.episode_number}話`;
  return `${series.value.title} ${epLabel} 無料動画 | NoriTV`;
});

const seoDescription = computed(
  () =>
    series.value?.description ?? "映画やドラマをオンラインで楽しめるNoriTV。"
);

const seoImage = computed(
  () =>
    series.value?.banner_url || series.value?.poster_url || "/images/banner.jpg"
);

const toAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${url.origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
  title: seoTitle,
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() => {
        const absThumbnail = toAbsoluteUrl(playerPoster.value);
        const absVideoSrc = toAbsoluteUrl(playerSrc.value);
        const isoDate = activeEpisode.value?.created_at 
          ? new Date(activeEpisode.value.created_at).toISOString() 
          : new Date().toISOString();

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
              name: "Series",
              item: `${url.origin}/search?type=series`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: series.value?.title,
              item: `${url.origin}/series/${slugParam.value}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: `Episode ${currentEpisodeNumber.value}`,
              item: canonicalUrl.value,
            },
          ],
        };

        const schemaEpisode = {
          "@context": "https://schema.org",
          "@type": "TVEpisode",
          episodeNumber: currentEpisodeNumber.value,
          seasonNumber: activeEpisode.value?.season_number || 1,
          name:
            activeEpisode.value?.title ||
            `Episode ${currentEpisodeNumber.value}`,
          description: activeEpisode.value?.title || series.value?.description,
          image: playerPoster.value,
          datePublished: activeEpisode.value?.created_at, 
          director: directors.value.length
            ? directors.value.map(d => ({ "@type": "Person", name: d.name }))
            : undefined,
          actor: casts.value.length
            ? casts.value.map(c => ({ "@type": "Person", name: c.name }))
            : undefined,
          partOfSeries: {
            "@type": "TVSeries",
            name: series.value?.title,
            url: `${url.origin}/series/${slugParam.value}`,
          },
        };

        const schemaVideo = {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: `${series.value?.title} - Episode ${currentEpisodeNumber.value}`,
          description: series.value?.description || 'No description',
          thumbnailUrl: [absThumbnail],
          uploadDate: isoDate,
          duration: activeEpisode.value?.duration_minutes
            ? `PT${activeEpisode.value.duration_minutes}M`
            : undefined,
          contentUrl: absVideoSrc,
        };

        return JSON.stringify([schemaBreadcrumb, schemaEpisode, schemaVideo]);
      }),
    },
  ],
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

onMounted(async () => {
  await nextTick();
  // Đã xóa hàm cuộn trang scrollToPlayer vì player giờ nằm trên cùng
  scrollToActiveEpisode();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>