<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <NuxtLink
            to="/admin/series"
            class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            シリーズ一覧に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            <span v-if="series">{{ series.title }}</span>
            <span v-else>Loading...</span>
            <span
              class="text-xs font-normal text-zinc-500 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded"
              >ID: {{ route.params.id }}</span
            >
          </h1>
        </div>
      </div>

      <div class="flex border-b border-white/10 mb-8">
        <NuxtLink
          :to="`/admin/series/${route.params.id}`"
          class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
          active-class=""
          exact-active-class="border-emerald-500 text-emerald-400"
          :class="
            route.path === `/admin/series/${route.params.id}`
              ? ''
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          "
        >
          基本情報 (Basic Info)
        </NuxtLink>

        <NuxtLink
          :to="`/admin/series/${route.params.id}/collections`"
          class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
          active-class="border-emerald-500 text-emerald-400"
          :class="
            route.path.includes('/collections')
              ? ''
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          "
        >
          エピソード・シーズン管理 (Episodes)
        </NuxtLink>
      </div>

      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useRoute,
  useSupabaseClient,
  useAsyncData,
  definePageMeta,
} from "#imports";

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const supabase = useSupabaseClient<any>();
const seriesId = route.params.id;

// Fetch title cho header
const { data: series } = await useAsyncData(
  `admin-series-${seriesId}`,
  async () => {
    const { data } = await supabase
      .from("series")
      .select("title")
      .eq("id", seriesId)
      .single();
    return data;
  }
);
</script>
