<template>
  <div class="min-h-screen bg-[#05060a] text-white pt-20 px-4 pb-12 sm:px-8">
    <div class="mx-auto max-w-5xl">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 sm:text-4xl drop-shadow-sm">
          人気ランキング
        </h1>
        <p class="mt-2 text-xs text-zinc-400 sm:text-sm">
          最も視聴されている作品トップ30
        </p>
      </header>

      <div class="mb-8 flex justify-center">
        <div class="inline-flex rounded-full bg-zinc-900/80 p-1 ring-1 ring-white/10">
          <button
            v-for="p in periods"
            :key="p.value"
            class="rounded-full px-4 py-1.5 text-xs font-medium transition-all sm:text-sm"
            :class="selectedPeriod === p.value ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'"
            @click="selectedPeriod = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div v-if="pending" class="py-20 text-center text-zinc-500">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500"></div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(item, index) in rankings"
          :key="item.id"
          class="group relative flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-3 transition hover:bg-zinc-900/80 sm:p-4"
        >
          <div class="relative flex h-12 w-12 shrink-0 items-center justify-center text-xl font-bold italic tracking-tighter sm:h-16 sm:w-16 sm:text-2xl">
            <svg v-if="index === 0" class="absolute inset-0 h-full w-full text-yellow-500/20" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" />
            </svg>
            <svg v-else-if="index === 1" class="absolute inset-0 h-full w-full text-zinc-400/20" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" />
            </svg>
            <svg v-else-if="index === 2" class="absolute inset-0 h-full w-full text-orange-700/20" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" />
            </svg>
            
            <span
              :class="{
                'text-yellow-400 drop-shadow-md': index === 0,
                'text-zinc-300 drop-shadow-md': index === 1,
                'text-orange-400 drop-shadow-md': index === 2,
                'text-zinc-600': index > 2
              }"
            >
              {{ index + 1 }}
            </span>
          </div>

          <NuxtLink :to="getLink(item)" class="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md sm:w-32">
            <img
              :src="getThumbnail(item)"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2 text-[10px] text-zinc-400">
              <span v-if="item.type === 'series'" class="rounded bg-indigo-500/20 px-1.5 py-0.5 text-indigo-300">SERIES</span>
              <span v-else class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">MOVIE</span>
              <span>{{ item.year }}</span>
            </div>
            <h3 class="truncate text-sm font-bold text-zinc-100 sm:text-base">
              <NuxtLink :to="getLink(item)" class="hover:underline">
                {{ item.title }}
              </NuxtLink>
            </h3>
            <p class="text-[10px] text-zinc-500 sm:text-xs">
              視聴回数: <span class="font-mono text-zinc-300">{{ item.view_count.toLocaleString() }}</span> 回
            </p>
          </div>

          <div class="hidden sm:block">
            <NuxtLink
              :to="getLink(item)"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black"
            >
              ▶
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSupabaseClient, useAsyncData, useSeoMeta } from '#imports'

// Setup
const supabase = useSupabaseClient<any>()

useSeoMeta({
  title: '人気ランキング - MugenTV',
  description: 'MugenTVの人気作品ランキング。今日、今週、今月、今年もっとも視聴された映画やドラマをチェック。'
})

const periods = [
  { label: '今日', value: 'day' },
  { label: '週間', value: 'week' },
  { label: '月間', value: 'month' },
  { label: '年間', value: 'year' },
  { label: '全期間', value: 'all' }
]

const selectedPeriod = ref('day') // Mặc định là ngày

// Fetch Data
const { data: rankings, pending, refresh } = await useAsyncData(
  'rankings-data',
  async () => {
    const { data, error } = await supabase
      .rpc('get_ranking', {
        period: selectedPeriod.value,
        limit_count: 30
      })
    
    if (error) {
      console.error(error)
      return []
    }
    return data || []
  },
  {
    watch: [selectedPeriod] // Tự động fetch lại khi đổi tab
  }
)

// Helpers
const getLink = (item: any) => {
  return item.type === 'series' ? `/series/${item.slug}` : `/movie/${item.slug}`
}

const getThumbnail = (item: any) => {
  // Logic resize ảnh giống các trang khác
  const raw = item.banner_url || item.poster_url
  if (!raw) return '/images/fallback-poster.webp'
  // Resize nhỏ cho list
  return getResizedUrl(raw, 300, 169, 'cover') 
}
</script>