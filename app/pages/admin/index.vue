<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-7xl">
      
      <header class="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white">管理ダッシュボード</h1>
          <p class="text-xs text-zinc-500 mt-1">
            システム全体の管理・設定
          </p>
        </div>
      </header>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        
        <div class="col-span-full mt-2 mb-1">
          <h2 class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">コンテンツ (Content)</h2>
        </div>

        <NuxtLink to="/admin/movies" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-emerald-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375a1.125 1.125 0 00-1.125 1.125m17.25 0V18.375m-17.25-12.75V18.375m17.25-12.75c.621 0 1.125.504 1.125 1.125m-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125m-3.75 0c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125M9 4.5c.621 0 1.125.504 1.125 1.125M13.5 4.5c.621 0 1.125.504 1.125 1.125" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-400">映画管理</h3>
              <p class="text-[10px] text-zinc-500">Movies</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/series" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-blue-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-blue-400">シリーズ管理</h3>
              <p class="text-[10px] text-zinc-500">Series</p>
            </div>
          </div>
        </NuxtLink>

        <div class="col-span-full mt-4 mb-1">
          <h2 class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">システム (System)</h2>
        </div>

        <NuxtLink to="/admin/users" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-purple-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-purple-400">ユーザー管理</h3>
              <p class="text-[10px] text-zinc-500">Users</p>
            </div>
          </div>
        </NuxtLink>

        <div class="col-span-full mt-4 mb-1">
          <h2 class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">マスターデータ (Master)</h2>
        </div>

        <NuxtLink to="/admin/genres" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-pink-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-pink-400">ジャンル</h3>
              <p class="text-[10px] text-zinc-500">Genres</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/countries" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-orange-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S13.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-orange-400">国・地域</h3>
              <p class="text-[10px] text-zinc-500">Countries</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/providers" class="group relative overflow-hidden rounded-xl bg-zinc-900/50 p-4 hover:bg-zinc-900 transition border border-white/5 hover:border-yellow-500/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white group-hover:text-yellow-400">プロバイダー</h3>
              <p class="text-[10px] text-zinc-500">Providers</p>
            </div>
          </div>
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin',
})
</script>