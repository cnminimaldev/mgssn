<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#05060a] text-white pt-20 px-4 pb-12 sm:px-8">
    <div class="mx-auto max-w-7xl">
      <div v-if="pending" class="py-20 text-center text-zinc-400">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <div v-else-if="!person" class="py-20 text-center text-zinc-400">
        人物が見つかりませんでした。
      </div>

      <div v-else>
        <header class="mb-10 flex flex-col sm:flex-row sm:items-end gap-6 border-b border-white/5 pb-8">
          <div class="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800 shadow-xl border border-white/10">
            <img v-if="person.avatar_url" :src="person.avatar_url" :alt="person.name" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center text-4xl font-bold text-zinc-500">
              {{ person.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 text-xs text-zinc-400 mb-2">
              <NuxtLink to="/" class="hover:text-white">ホーム</NuxtLink>
              <span>/</span>
              <span>人物</span>
            </div>
            <h1 class="text-3xl font-bold sm:text-4xl text-zinc-100 mb-1">
              {{ person.name }}
            </h1>
            <p v-if="person.name_romaji" class="text-emerald-400 text-sm mb-3">
              {{ person.name_romaji }}
            </p>
            
            <!-- [CẬP NHẬT] Khu vực ẩn/hiện Tiểu sử và giữ nguyên dấu xuống dòng -->
            <div v-if="person.bio" class="max-w-3xl mt-2">
              <!-- whitespace-pre-wrap là thẻ CSS "thần thánh" để giữ dấu xuống dòng -->
              <div 
                v-show="showBio" 
                class="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed mb-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5"
              >{{ person.bio }}</div>
              
              <button 
                @click="showBio = !showBio"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 rounded-full border border-zinc-700"
              >
                <span v-if="!showBio">プロフィールを見る</span>
                <span v-else>閉じる</span>
                <svg v-if="!showBio" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
            </div>
            <p v-else class="text-zinc-500 text-xs mt-2">
              出演・監督作品一覧
            </p>
          </div>
        </header>

        <div v-if="!movies.length" class="py-10 text-center text-zinc-400">
          関連作品はまだありません。
        </div>
        <div v-else>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <MovieCard v-for="movie in movies" :key="`${movie.type}-${movie.id}`" :item="movie" />
          </div>

          <div v-if="totalPages > 1" class="mt-10 flex justify-center gap-2">
            <button
              v-for="p in totalPages"
              :key="p"
              @click="currentPage = p"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="p === currentPage ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useAsyncData, useSupabaseClient, useSeoMeta, useHead, useRequestURL } from '#imports'
import MovieCard from '~/components/MovieCard.vue'
import { getResizedUrl } from '~/utils/image'

const route = useRoute()
const url = useRequestURL()
const supabase = useSupabaseClient<any>()

const personId = route.params.id

// [THÊM MỚI] Biến điều khiển trạng thái ẩn/hiện Bio
const showBio = ref(false)

const currentPage = ref(1)
const pageSize = 24

const { data: pageData, pending } = await useAsyncData(`person-${personId}`, async () => {
  const { data: personData, error: personError } = await supabase
    .from('persons')
    .select('*')
    .eq('id', personId)
    .single()

  if (personError || !personData) {
    return { person: null, movies: [], total: 0 }
  }

  const { data: crewData } = await supabase
    .from('content_crew')
    .select('content_id, type')
    .eq('person_id', personId)

  if (!crewData || crewData.length === 0) {
    return { person: personData, movies: [], total: 0 }
  }

  const movieIds = crewData.filter((c: any) => c.type === 'movie').map((c: any) => c.content_id)
  const seriesIds = crewData.filter((c: any) => c.type === 'series').map((c: any) => c.content_id)

  const orFilters = []
  if (movieIds.length > 0) orFilters.push(`and(type.eq.movie,id.in.(${movieIds.join(',')}))`)
  if (seriesIds.length > 0) orFilters.push(`and(type.eq.series,id.in.(${seriesIds.join(',')}))`)

  const { data: contents } = await supabase
    .from('all_contents')
    .select('*')
    .or(orFilters.join(','))
    .order('year', { ascending: false })

  const items = (contents || []).map((row: any) => {
    const thumbnail = getResizedUrl(row.banner_url || row.poster_url, 450, 450, 'contain') || '/images/fallback-poster.webp'
    return {
      id: row.id,
      type: row.type,
      slug: row.slug ?? String(row.id),
      title: row.title,
      thumbnail,
      year: row.year,
      country: row.origin_country,
      genre: row.genre_label || 'その他',
      description: row.description,
      episodeCount: row.episode_count > 0 ? row.episode_count : undefined
    }
  })

  return {
    person: personData,
    allMovies: items,
    total: items.length
  }
})

const person = computed(() => pageData.value?.person || null)
const allMovies = computed(() => pageData.value?.allMovies || [])
const totalItems = computed(() => pageData.value?.total || 0)

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))

const movies = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allMovies.value.slice(start, start + pageSize)
})

const title = computed(() => person.value ? `${person.value.name} 出演・監督作品 (映画・ドラマ) | NoriTV` : '人物 | NoriTV')
const desc = computed(() => person.value ? `${person.value.name}が出演、監督する映画やドラマの一覧。` : '')

useSeoMeta({
  title,
  description: desc,
  ogTitle: title,
  ogDescription: desc
})

useHead({
  link: [{ rel: 'canonical', href: computed(() => `${url.origin}/person/${personId}`) }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => {
        if (!person.value) return ''
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": person.value.name,
          "image": person.value.avatar_url || undefined,
          "description": person.value.bio || undefined,
          "url": `${url.origin}/person/${personId}`
        })
      })
    }
  ]
})
</script>