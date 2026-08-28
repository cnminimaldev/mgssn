<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/admin"
            class="text-xs text-emerald-400 hover:underline mb-2 block"
          >
            &larr; 管理画面に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">シリーズ管理 (Series)</h1>
        </div>
        <NuxtLink
          to="/admin/series/new"
          class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
        >
          <span>＋</span> 新規登録
        </NuxtLink>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50"
      >
        <div class="p-4 border-b border-white/5">
          <input
            v-model="keyword"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="タイトルで検索..."
            class="w-full max-w-sm bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 outline-none"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <!-- [ĐÃ SỬA] Nới rộng cột Image thành w-20 -->
                <th class="px-6 py-4 font-medium w-20">Image</th>
                <th class="px-6 py-4 font-medium">Title</th>
                <th class="px-6 py-4 font-medium">Year</th>
                <th class="px-6 py-4 font-medium">Country</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-if="pending" class="bg-black/20">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">
                  <div
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500"
                  ></div>
                </td>
              </tr>

              <tr v-else-if="seriesList.length === 0" class="bg-black/20">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">
                  データがありません (No Data)
                </td>
              </tr>

              <tr
                v-for="item in seriesList"
                :key="item.id"
                class="hover:bg-white/5 transition-colors group"
              >
                <td class="px-6 py-3">
                  <!-- [ĐÃ SỬA] Chuyển đổi thành hình ngang (aspect-video w-16) -->
                  <div
                    class="aspect-video w-16 overflow-hidden rounded bg-zinc-800 border border-white/10"
                  >
                    <img
                      v-if="item.thumbnail"
                      :src="item.thumbnail"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </td>
                <td class="px-6 py-3 font-medium text-white">
                  <div class="truncate max-w-xs">{{ item.title }}</div>
                  <div class="text-[10px] text-zinc-500 truncate max-w-xs">
                    {{ item.originalTitle }}
                  </div>
                </td>
                <td class="px-6 py-3 text-zinc-400">
                  {{ item.year }}
                </td>
                <td class="px-6 py-3 text-zinc-400">
                  {{ item.country }}
                </td>
                <td class="px-6 py-3 text-right">
                  <NuxtLink
                    :to="`/admin/series/${item.id}`"
                    class="inline-flex items-center gap-1 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-emerald-600 hover:text-white transition"
                  >
                    編集 (Edit)
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-center gap-4 p-4 border-t border-white/5"
          v-if="total > 20"
        >
          <button
            @click="page--"
            :disabled="page <= 1"
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50 text-zinc-300"
          >
            Prev
          </button>
          <span class="text-xs text-zinc-500">Page {{ page }}</span>
          <button
            @click="page++"
            :disabled="seriesList.length < 20"
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50 text-zinc-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useFetch, definePageMeta } from "#imports";

definePageMeta({
  middleware: "admin",
});

const page = ref(1);
const keyword = ref("");

// Gọi API movies nhưng filter type='series'
const { data, pending, refresh } = await useFetch("/api/movies", {
  params: {
    page,
    q: keyword,
    type: "series", // [QUAN TRỌNG] Chỉ lấy Series
    sort: "created_at",
    pageSize: 20,
  },
  watch: [page],
});

const seriesList = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);

const handleSearch = () => {
  page.value = 1;
  refresh();
};
</script>