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
      v-else-if="errorMessage || !series || !activeEpisode"
      class="flex h-full items-center justify-center py-20 text-zinc-200"
    >
      <div class="text-center">
        <p class="text-sm">
          {{ errorMessage || 'エピソードが見つかりませんでした。' }}
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
    <div v-else>
      <!-- Header -->
      <section class="px-4 pt-6 sm:px-8">
        <div class="mx-auto max-w-5xl">
          <NuxtLink
            :to="`/series/${series.slug}`"
            class="text-[11px] text-zinc-400 hover:text-zinc-200 sm:text-xs"
          >
            ← シリーズ詳細へ戻る
          </NuxtLink>

          <h1
            class="mt-2 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
          >
            {{ series.title }}
          </h1>

          <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
            第{{ currentEpisodeNumber }}話
            <span v-if="activeEpisode.title">：{{ activeEpisode.title }}</span>
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs">
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
      </section>

      <!-- Main layout -->
      <section
        class="mx-auto mt-4 flex max-w-5xl flex-col gap-6 px-4 pb-10 sm:flex-row sm:px-8"
        data-player-root
      >
        <!-- Player / details -->
        <div class="sm:w-2/3">
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
            <div
              v-if="activeCollectionInfo"
              class="text-[11px] text-zinc-400"
            >
              <span v-if="activeCollectionInfo.providerName">
                Provider: {{ activeCollectionInfo.providerName }}
              </span>
              <span v-if="activeCollectionInfo.languages">
                ・{{ activeCollectionInfo.languages }}
              </span>
            </div>
          </div>

          <!-- Player -->
          <div
            class="overflow-hidden rounded-2xl border border-white/10 bg-black/60"
          >
            <StreamingPlayer
              v-if="playerSrc"
              :key="playerKey"
              :src="playerSrc"
              :poster="playerPoster"
              :title="playerTitle"
              :startTime="episodeStartTime"
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

          <!-- Description -->
          <div class="mt-4 space-y-2 text-xs text-zinc-300 sm:text-sm">
            <p v-if="series.description">
              {{ series.description }}
            </p>
          </div>
        </div>

        <!-- Episodes list -->
        <aside
          class="max-h-[480px] overflow-y-auto rounded-2xl bg-zinc-900/70 p-4 text-xs text-zinc-100 sm:w-1/3"
        >
          <div
            v-if="seasons.length > 1"
            class="mb-3 flex flex-wrap items-center gap-2"
          >
            <span class="text-[11px] text-zinc-400">シーズン</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in seasons"
                :key="s"
                type="button"
                class="rounded-full px-3 py-1 text-[11px] ring-1 transition"
                :class="
                  s === selectedSeason
                    ? 'bg-zinc-100 text-black ring-zinc-200'
                    : 'bg-zinc-900 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'
                "
                @click="selectedSeason = s"
              >
                シーズン {{ s }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-[11px] text-zinc-400">エピソード</p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="ep in episodesForSeason"
                :key="ep.id"
                :to="episodeLink(ep)"
                class="min-w-[3rem] rounded-full px-3 py-1 text-center text-[11px] transition sm:text-xs"
                :class="
                  ep.episode_number === currentEpisodeNumber
                    ? 'bg-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white/5 text-zinc-100 hover:bg-white/10'
                "
              >
                {{ ep.title || `第${ep.episode_number}話` }}
              </NuxtLink>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  nextTick,
  onMounted,
  watch,
} from 'vue'
import {
  useRoute,
  useRouter,
  useSupabaseClient,
  useSeoMeta,
  useHead,
} from '#imports'
import StreamingPlayer from '~/components/StreamingPlayer.vue'
import { useContinueWatching } from '~/composables/useContinueWatching'
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

type EpisodeCollectionRow = {
  id: number
  name: string
  type: string | null
  audio_language: string | null
  subtitle_language: string | null
  provider_id: number | null
  is_default: boolean | null
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

type ProviderRow = {
  id: number
  name: string
  website_url: string | null
}

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

const loading = ref(true)
const errorMessage = ref('')

const series = ref<SeriesRow | null>(null)
const collections = ref<EpisodeCollectionRow[]>([])
const episodes = ref<EpisodeRow[]>([])
const providers = ref<ProviderRow[]>([])

const selectedCollectionId = ref<number | null>(null)
const selectedSeason = ref<number | null>(null)
const isInitializing = ref(true)

// continue watching (per episode)
const { setProgress, clearProgressForMovie, getEntry } = useContinueWatching()

// My List (series-level)
const { isInMyList, toggleMyList } = useMyList()
const inMyList = computed(() =>
  series.value ? isInMyList(series.value.id) : false,
)
const handleToggleMyList = () => {
  if (!series.value) return
  toggleMyList(series.value.id)
}

const slugParam = computed(() => String(route.params.slug || ''))
const episodeNumberParam = computed(() => {
  const raw = Number(route.params.episodeNumber)
  return Number.isFinite(raw) ? raw : NaN
})

const collectionFromQuery = computed<number | null>(() => {
  const raw = route.query.collection
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

// seasons based on logical episodes (dedup by season+episode no)
const uniqueEpisodesByKey = computed<EpisodeRow[]>(() => {
  const map = new Map<string, EpisodeRow>()
  for (const ep of episodes.value) {
    const season = ep.season_number ?? 1
    const key = `${season}-${ep.episode_number}`
    if (!map.has(key)) {
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

const seasons = computed<number[]>(() => {
  const set = new Set<number>()
  for (const ep of uniqueEpisodesByKey.value) {
    set.add(ep.season_number ?? 1)
  }
  return Array.from(set).sort((a, b) => a - b)
})

const episodesForSeason = computed<EpisodeRow[]>(() => {
  if (!uniqueEpisodesByKey.value.length) return []
  const s =
    selectedSeason.value ??
    (seasons.value.length ? seasons.value[0] : null)
  if (s == null) return []
  return uniqueEpisodesByKey.value.filter(
    (ep) => (ep.season_number ?? 1) === s,
  )
})

// variants for current episode number (same logical ep, different collections)
const variantsForCurrentEpisode = computed<EpisodeRow[]>(() => {
  const num = episodeNumberParam.value
  if (!Number.isFinite(num)) return []
  return episodes.value.filter((ep) => ep.episode_number === num)
})

// active episode based on selected collection (or default)
const activeEpisode = computed<EpisodeRow | null>(() => {
  const variants = variantsForCurrentEpisode.value
  if (!variants.length) return null

  if (selectedCollectionId.value != null) {
    const found = variants.find(
      (ep) => ep.collection_id === selectedCollectionId.value,
    )
    if (found) return found
  }

  // fallback: first variant
  return variants[0] ?? null
})

const currentEpisodeNumber = computed(() => {
  const ep = activeEpisode.value
  if (ep) return ep.episode_number
  const n = episodeNumberParam.value
  return Number.isFinite(n) ? n : 0
})

const collectionOptions = computed(() => {
  const variants = variantsForCurrentEpisode.value
  if (!variants.length) return []

  const set = new Set<number>()
  for (const ep of variants) {
    if (ep.collection_id != null) {
      set.add(ep.collection_id)
    }
  }

  if (!set.size) return []

  return collections.value
    .filter((c) => set.has(c.id))
    .map((c) => {
      const provider = c.provider_id
        ? providers.value.find((p) => p.id === c.provider_id)
        : null
      const langs: string[] = []
      if (c.audio_language) langs.push(`音声:${c.audio_language}`)
      if (c.subtitle_language) langs.push(`字幕:${c.subtitle_language}`)
      const meta = [...langs, provider?.name].filter(Boolean).join(' / ')
      return {
        id: c.id,
        label: meta ? `${c.name}（${meta}）` : c.name,
      }
    })
})

const activeCollectionInfo = computed(() => {
  if (selectedCollectionId.value == null) return null
  const c = collections.value.find((cc) => cc.id === selectedCollectionId.value)
  if (!c) return null
  const provider = c.provider_id
    ? providers.value.find((p) => p.id === c.provider_id)
    : null
  const langs: string[] = []
  if (c.audio_language) langs.push(`音声:${c.audio_language}`)
  if (c.subtitle_language) langs.push(`字幕:${c.subtitle_language}`)
  return {
    providerName: provider?.name || '',
    languages: langs.join(' / '),
  }
})

const playerSrc = computed(() => activeEpisode.value?.video_path || '')
const playerPoster = computed(
  () =>
    activeEpisode.value?.thumbnail_url ||
    series.value?.poster_url ||
    '/images/fallback-poster.webp',
)
const playerTitle = computed(() => {
  if (!series.value || !activeEpisode.value) return ''
  const base = series.value.title
  const ep = activeEpisode.value
  return ep.title
    ? `${base} 第${ep.episode_number}話 ${ep.title}`
    : `${base} 第${ep.episode_number}話`
})

const playerKey = computed(() => {
  const ep = activeEpisode.value
  return ep ? `ep-${ep.id}` : playerSrc.value
})

// Continue watching per-episode
const episodeStartTime = computed(() => {
  const ep = activeEpisode.value
  if (!ep) return 0
  const entry = getEntry(ep.id)
  if (!entry) return 0
  if (!entry.duration || entry.duration < 60) return 0
  if (entry.currentTime < 10 || entry.duration - entry.currentTime < 10) {
    return 0
  }
  return entry.currentTime
})

const lastSavedAt = ref(0)

const handlePlayerTimeUpdate = (payload: {
  currentTime: number
  duration: number
}) => {
  const ep = activeEpisode.value
  if (!ep) return

  const now = performance.now()
  if (now - lastSavedAt.value < 2000) return
  lastSavedAt.value = now

  setProgress(ep.id, payload.currentTime, payload.duration)
}

const handlePlayerEnded = () => {
  const ep = activeEpisode.value
  if (!ep) return
  clearProgressForMovie(ep.id)
}

// Episode links — giữ collection hiện tại trong query nếu có
const episodeLink = (ep: EpisodeRow) => {
  const slug = series.value?.slug || slugParam.value
  const path = `/series/${slug}/episode/${ep.episode_number}`

  if (selectedCollectionId.value != null) {
    return {
      path,
      query: {
        ...route.query,
        collection: selectedCollectionId.value,
      },
    }
  }

  const { collection, ...restQuery } = route.query
  return {
    path,
    query: restQuery,
  }
}

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

    const epNum = episodeNumberParam.value
    if (!Number.isFinite(epNum) || epNum <= 0) {
      errorMessage.value = 'Invalid episode number'
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
      .select(
        'id, name, type, audio_language, subtitle_language, provider_id, is_default',
      )
      .eq('series_id', series.value.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    collections.value = (colData ?? []) as EpisodeCollectionRow[]

    // Providers
    const { data: provData } = await supabase
      .from('collection_providers')
      .select('id, name, website_url')
      .order('name', { ascending: true })

    providers.value = (provData ?? []) as ProviderRow[]

    // Episodes
    const { data: epData, error: epError } = await supabase
      .from('episodes')
      .select(
        'id, series_id, collection_id, season_number, episode_number, title, video_path, thumbnail_url, duration_minutes',
      )
      .eq('series_id', series.value.id)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true })

    console.log('EPISODES PAGE DEBUG', {
      seriesId: series.value.id,
      epData,
      epError,
    })

    episodes.value = (epData ?? []) as EpisodeRow[]

    if (!episodes.value.length) {
      errorMessage.value = 'エピソードがまだ登録されていません。'
      return
    }

    // determine default season & collection based on requested episode
    const variants = variantsForCurrentEpisode.value
    if (!variants.length) {
      errorMessage.value = '指定されたエピソードが存在しません。'
      return
    }

    // 1) Ưu tiên collection đến từ query nếu có và hợp lệ
    let defaultCollectionId: number | null = null
    const requestedCollectionId = collectionFromQuery.value
    if (requestedCollectionId != null) {
      const hasVariant = variants.some(
        (ep) => ep.collection_id === requestedCollectionId,
      )
      if (hasVariant) {
        defaultCollectionId = requestedCollectionId
      }
    }

    // 2) Nếu không dùng được collection từ query, dùng default series-level
    if (defaultCollectionId == null && collections.value.length) {
      const defaultCol =
        collections.value.find((c) => c.is_default) ?? collections.value[0]
      if (defaultCol) {
        const hasVariant = variants.some(
          (ep) => ep.collection_id === defaultCol.id,
        )
        defaultCollectionId = hasVariant ? defaultCol.id : null
      }
    }

    // 3) Nếu vẫn chưa có, lấy collection đầu tiên có episode
    if (defaultCollectionId == null) {
      const firstWithCollection = variants.find(
        (ep) => ep.collection_id != null,
      )
      defaultCollectionId = firstWithCollection
        ? firstWithCollection.collection_id
        : null
    }

    selectedCollectionId.value = defaultCollectionId

    // Default season (from one of variants)
    const baseEp = variants[0]
    const season = baseEp.season_number ?? 1
    selectedSeason.value = season
  } finally {
    loading.value = false
  }
}

await loadData()
isInitializing.value = false

// Sync selectedCollectionId -> URL query (để khi chuyển tập nhớ server hiện tại)
watch(
  selectedCollectionId,
  (val) => {
    if (isInitializing.value) return

    const slug = slugParam.value
    const epNum = episodeNumberParam.value
    if (!slug || !Number.isFinite(epNum)) return

    const query: Record<string, any> = { ...route.query }
    if (val != null) {
      query.collection = String(val)
    } else {
      delete query.collection
    }

    router.replace({
      path: `/series/${slug}/episode/${epNum}`,
      query,
    })
  },
)

// SEO meta
const seoTitle = computed(() => {
  if (!series.value || !activeEpisode.value) {
    return 'エピソード - MyStream'
  }
  const ep = activeEpisode.value
  return ep.title
    ? `${series.value.title} 第${ep.episode_number}話 ${ep.title} | MyStream`
    : `${series.value.title} 第${ep.episode_number}話 | MyStream`
})

// Không dùng synopsis nữa, chỉ dùng series.description
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

// auto scroll tới player khi load
onMounted(async () => {
  await nextTick()
  const el = document.querySelector(
    '[data-player-root]',
  ) as HTMLElement | null
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
})
</script>
