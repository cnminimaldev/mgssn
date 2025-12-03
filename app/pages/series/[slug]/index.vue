<template>
  <div class="min-h-[calc(100vh-4rem)] bg-black text-white">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex h-full items-center justify-center py-20 text-zinc-300"
    >
      Loading...
    </div>

    <!-- Error -->
    <div
      v-else-if="errorMessage || !series"
      class="flex h-full items-center justify-center py-20 text-zinc-200"
    >
      <div class="text-center">
        <p class="text-sm">
          {{ errorMessage || 'シリーズが見つかりませんでした。' }}
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
            class="relative mx-auto flex h-full max-w-5xl items-end px-4 pb-6 sm:px-8 sm:pb-10"
          >
            <div class="flex gap-4 sm:gap-6">
              <!-- Poster -->
              <div
                class="hidden w-[140px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900/80 shadow-lg sm:block"
              >
                <img
                  :src="posterUrl"
                  :alt="series.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <!-- Text -->
              <div class="flex flex-col gap-2">
                <div
                  class="inline-flex items-center gap-2 text-[11px] text-zinc-300 sm:text-xs"
                >
                  <span
                    v-if="series.origin_country"
                    class="rounded border border-white/20 px-1.5 py-0.5"
                  >
                    {{ countryLabel }}
                  </span>
                </div>

                <h1 class="text-xl font-semibold sm:text-3xl">
                  {{ series.title }}
                </h1>

                <p
                  v-if="series.original_title"
                  class="text-xs text-zinc-400 sm:text-sm"
                >
                  原題：{{ series.original_title }}
                </p>

                <p v-if="series.title_kana" class="text-xs text-zinc-400">
                  {{ series.title_kana }}
                </p>

                <p
                  v-if="series.description"
                  class="mt-1 line-clamp-3 max-w-xl text-xs text-zinc-300 sm:text-sm"
                >
                  {{ series.description }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <NuxtLink
                    v-if="firstEpisodeNumber"
                    :to="firstEpisodeLink"
                    class="inline-flex items-center rounded-full bg-white px-5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 sm:px-6 sm:text-sm"
                  >
                    最初から再生
                  </NuxtLink>

                  <button
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

      <!-- Episodes by season -->
      <section class="mx-auto mt-6 max-w-5xl px-4 sm:mt-8 sm:px-8">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold text-zinc-50 sm:text-base">
            エピソード
          </h2>
          <div
            v-if="seasonNumbers.length > 1"
            class="flex flex-wrap items-center gap-2 text-[11px]"
          >
            <span class="text-zinc-400">シーズン</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in seasonNumbers"
                :key="s"
                type="button"
                class="rounded-full px-3 py-1 ring-1 text-[11px] transition"
                :class="
                  s === selectedSeason
                    ? 'bg-zinc-100 text-black ring-zinc-200'
                    : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'
                "
                @click="selectedSeason = s"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>

        <!-- No episodes -->
        <div v-if="!episodesForSelectedSeason.length" class="mt-4 text-sm text-zinc-400">
          エピソードがまだ登録されていません。
        </div>

        <!-- Episodes list with lazy loading -->
        <div v-else class="mt-4 space-y-4">
          <h3
            v-if="seasonNumbers.length > 1"
            class="text-xs font-semibold text-zinc-300 sm:text-sm"
          >
            シーズン {{ currentSeasonLabel }}
          </h3>

          <div class="space-y-2">
            <NuxtLink
              v-for="ep in visibleEpisodes"
              :key="ep.id"
              :to="episodeLink(ep)"
              class="flex gap-3 rounded-lg bg-zinc-900/60 p-3 text-xs text-zinc-200 ring-1 ring-zinc-800 hover:bg-zinc-800"
            >
              <div
                class="h-20 w-32 shrink-0 overflow-hidden rounded-md bg-zinc-800"
              >
                <img
                  :src="ep.thumbnail_url || posterUrl"
                  :alt="ep.title || `第${ep.episode_number}話`"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex min-w-0 flex-col gap-1">
                <div class="flex items-center gap-2">
                  <p
                    class="truncate text-xs font-semibold text-zinc-50 sm:text-sm"
                  >
                    第{{ ep.episode_number }}話
                    <span v-if="ep.title"> {{ ep.title }}</span>
                  </p>
                  <span
                    v-if="ep.duration_minutes"
                    class="rounded bg-black/30 px-1.5 py-0.5 text-[10px] text-zinc-300"
                  >
                    {{ ep.duration_minutes }}分
                  </span>
                </div>
                <!-- Nếu sau này có description per-episode thì hiển thị ở đây -->
              </div>
            </NuxtLink>
          </div>

          <div
            v-if="canLoadMore"
            class="mt-3 flex justify-center"
          >
            <button
              type="button"
              class="inline-flex items-center rounded-full bg-zinc-800 px-4 py-1.5 text-[11px] text-zinc-100 ring-1 ring-zinc-600 hover:bg-zinc-700 sm:text-xs"
              @click="currentPage++"
            >
              さらに表示
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useSupabaseClient, useSeoMeta, useHead } from '#imports'
import { useMyList } from '~/composables/useMyList'

type SeriesRow = {
  id: number
  slug: string
  title: string
  original_title?: string | null
  title_kana?: string | null
  origin_country?: string | null
  description?: string | null
  poster_url?: string | null
  banner_url?: string | null
}

type EpisodeRow = {
  id: number
  series_id: number
  collection_id: number | null
  season_number: number | null
  episode_number: number
  title: string | null
  video_path: string | null
  thumbnail_url: string | null
  duration_minutes: number | null
}

type EpisodeCollectionRow = {
  id: number
  series_id: number
  name: string
  is_default: boolean | null
}

const route = useRoute()
const supabase = useSupabaseClient<any>()

const loading = ref(true)
const errorMessage = ref('')

const series = ref<SeriesRow | null>(null)
const collections = ref<EpisodeCollectionRow[]>([])
const episodes = ref<EpisodeRow[]>([])

const selectedSeason = ref<number | null>(null)

// lazy load state
const EPISODES_PER_PAGE = 24
const currentPage = ref(1)

// My List cho series
const { isInMyList, toggleMyList } = useMyList()
const inMyList = computed(() =>
  series.value ? isInMyList(series.value.id) : false,
)
const handleToggleMyList = () => {
  if (!series.value) return
  toggleMyList(series.value.id)
}

const slugParam = computed(() => String(route.params.slug || ''))

// Hero visuals
const posterUrl = computed(
  () => series.value?.poster_url || '/images/fallback-poster.webp',
)

const heroBackgroundStyle = computed(() => {
  const bg = series.value?.banner_url || series.value?.poster_url
  if (!bg) return ''
  return `background-image: url('${bg}')`
})

const countryLabel = computed(() => {
  const code = series.value?.origin_country
  if (!code) return ''
  const map: Record<string, string> = {
    JP: '日本',
    US: 'アメリカ',
    KR: '韓国',
    CN: '中国',
    TW: '台湾',
    HK: '香港',
    GB: 'イギリス',
    FR: 'フランス',
    DE: 'ドイツ',
    VN: 'ベトナム',
  }
  return map[code] || code
})

// Chọn 1 bản đại diện cho mỗi (season, episode_number)
const logicalEpisodes = computed<EpisodeRow[]>(() => {
  const map = new Map<string, EpisodeRow>()

  for (const ep of episodes.value) {
    const season = ep.season_number ?? 1
    const key = `${season}-${ep.episode_number}`
    const existing = map.get(key)

    // Ưu tiên episode thuộc collection default nếu có
    const col = ep.collection_id
      ? collections.value.find((c) => c.id === ep.collection_id)
      : null
    const isDefault = col?.is_default ?? false

    if (!existing) {
      map.set(key, { ...ep, season_number: season })
      continue
    }

    if (isDefault) {
      map.set(key, { ...ep, season_number: season })
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const sa = a.season_number ?? 1
    const sb = b.season_number ?? 1
    if (sa !== sb) return sa - sb
    return a.episode_number - b.episode_number
  })
})

const seasonNumbers = computed<number[]>(() => {
  const set = new Set<number>()
  for (const ep of logicalEpisodes.value) {
    set.add(ep.season_number ?? 1)
  }
  return Array.from(set).sort((a, b) => a - b)
})

// Episodes for current season (full list)
const episodesForSelectedSeason = computed<EpisodeRow[]>(() => {
  if (!logicalEpisodes.value.length) return []
  const seasonToShow =
    selectedSeason.value ?? (seasonNumbers.value[0] ?? 1)
  return logicalEpisodes.value.filter(
    (ep) => (ep.season_number ?? 1) === seasonToShow,
  )
})

// Episodes actually visible (lazy load)
const visibleEpisodes = computed<EpisodeRow[]>(() => {
  const all = episodesForSelectedSeason.value
  return all.slice(0, currentPage.value * EPISODES_PER_PAGE)
})

const canLoadMore = computed(
  () => visibleEpisodes.value.length < episodesForSelectedSeason.value.length,
)

const currentSeasonLabel = computed(() => {
  return (
    selectedSeason.value ??
    (seasonNumbers.value.length ? seasonNumbers.value[0] : 1)
  )
})

const firstEpisodeNumber = computed(() => {
  if (!logicalEpisodes.value.length) return null
  return logicalEpisodes.value[0].episode_number
})

const firstEpisodeLink = computed(() => {
  if (!series.value || !firstEpisodeNumber.value) return '#'
  return `/series/${series.value.slug}/episode/${firstEpisodeNumber.value}`
})

const episodeLink = (ep: EpisodeRow) => {
  const slug = series.value?.slug || slugParam.value
  return `/series/${slug}/episode/${ep.episode_number}`
}

// Khi đổi season -> reset về page 1
watch(selectedSeason, () => {
  currentPage.value = 1
})

// Load data
const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const slug = slugParam.value
    if (!slug) {
      errorMessage.value = 'Invalid slug'
      return
    }

    // Series
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select(
        'id, slug, title, original_title, title_kana, origin_country, description, poster_url, banner_url',
      )
      .eq('slug', slug)
      .single()

    if (seriesError) {
      errorMessage.value = seriesError.message
      return
    }

    if (!seriesData) {
      errorMessage.value = 'シリーズが見つかりませんでした。'
      return
    }

    series.value = seriesData as SeriesRow

    // Collections
    const { data: colData } = await supabase
      .from('episode_collections')
      .select('id, series_id, name, is_default')
      .eq('series_id', series.value.id)

    collections.value = (colData ?? []) as EpisodeCollectionRow[]

    // Episodes
    const { data: epData, error: epError } = await supabase
      .from('episodes')
      .select(
        'id, series_id, collection_id, season_number, episode_number, title, video_path, thumbnail_url, duration_minutes',
      )
      .eq('series_id', series.value.id)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true })

    console.log('EPISODES DEBUG', {
      seriesId: series.value.id,
      epData,
      epError,
    })

    episodes.value = (epData ?? []) as EpisodeRow[]

    if (!episodes.value.length) {
      errorMessage.value = 'エピソードがまだ登録されていません。'
      return
    }

    // Default season: season nhỏ nhất
    const seasons = seasonNumbers.value
    if (seasons.length) {
      selectedSeason.value = seasons[0]
    }

    // Reset pagination
    currentPage.value = 1
  } finally {
    loading.value = false
  }
}

await loadData()

// SEO
const seoTitle = computed(() =>
  series.value ? `${series.value.title} | MyStream` : 'シリーズ | MyStream',
)
const seoDescription = computed(
  () =>
    series.value?.description ??
    '映画やドラマをオンラインで楽しめるMyStream。',
)
const seoImage = computed(
  () =>
    series.value?.banner_url ||
    series.value?.poster_url ||
    '/images/banner.jpg',
)

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: seoImage,
  twitterCard: 'summary_large_image',
})

useHead({
  title: seoTitle.value,
})
</script>
