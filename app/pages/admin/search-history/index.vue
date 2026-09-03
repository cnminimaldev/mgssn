<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 block">
            &larr; 管理画面に戻る (Back to Admin)
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            検索履歴分析 (Search Analytics)
            <span v-if="!pending" class="text-xs font-normal bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">
              総検索数: {{ data?.totalSearches || 0 }} 回
            </span>
          </h1>
          <p class="text-xs text-zinc-500 mt-1">ユーザーの検索トレンドと不足コンテンツの分析</p>
        </div>
        
        <!-- Nút Reset Lịch sử -->
        <button 
          @click="clearHistory" 
          :disabled="isClearing || !data?.totalSearches"
          class="flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isClearing" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-else>🗑 履歴をリセット (Clear All)</span>
        </button>
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <!-- Bảng dữ liệu -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Cột trái: Phim không tìm thấy (Cần upload) -->
        <div class="bg-zinc-900/50 border border-rose-500/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div class="p-4 border-b border-white/5 bg-rose-500/5 flex items-center justify-between">
            <h2 class="text-sm font-bold text-rose-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              見つからなかったキーワード (Zero Results - To Do List)
            </h2>
          </div>
          <div class="overflow-y-auto flex-1 custom-scrollbar">
            <table class="w-full text-left text-sm">
              <thead class="bg-black/20 text-[10px] uppercase text-zinc-500 sticky top-0 backdrop-blur-md">
                <tr>
                  <th class="px-6 py-3 font-medium">キーワード (Keyword)</th>
                  <th class="px-6 py-3 font-medium text-right">検索回数 (Searches)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in data?.zeroResults" :key="item.keyword" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-3 font-medium text-white">{{ item.keyword }}</td>
                  <td class="px-6 py-3 text-right">
                    <span class="inline-flex items-center justify-center bg-rose-500/20 text-rose-400 font-bold text-xs h-6 px-2.5 rounded-full">
                      {{ item.search_volume }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!data?.zeroResults?.length">
                  <td colspan="2" class="px-6 py-10 text-center text-zinc-500">データがありません</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cột phải: Xu hướng tìm kiếm chung -->
        <div class="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 class="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
              人気の検索キーワード (Top Trending)
            </h2>
          </div>
          <div class="overflow-y-auto flex-1 custom-scrollbar">
            <table class="w-full text-left text-sm">
              <thead class="bg-black/20 text-[10px] uppercase text-zinc-500 sticky top-0 backdrop-blur-md">
                <tr>
                  <th class="px-6 py-3 font-medium">キーワード (Keyword)</th>
                  <th class="px-6 py-3 font-medium text-right">検索回数 (Searches)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(item, idx) in data?.topSearches" :key="item.keyword" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-3 font-medium text-white flex items-center gap-3">
                    <span class="text-zinc-600 text-[10px] w-4 text-right">{{ idx + 1 }}</span>
                    {{ item.keyword }}
                  </td>
                  <td class="px-6 py-3 text-right">
                    <span class="inline-flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold text-xs h-6 px-2.5 rounded-full">
                      {{ item.search_volume }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!data?.topSearches?.length">
                  <td colspan="2" class="px-6 py-10 text-center text-zinc-500">データがありません</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { definePageMeta, useFetch } from '#imports'

definePageMeta({ middleware: 'admin' })

// 1. Định nghĩa cấu trúc dữ liệu trả về từ API
interface SearchItem {
  keyword: string
  search_volume: number
}

interface SearchHistoryResponse {
  topSearches: SearchItem[]
  zeroResults: SearchItem[]
  totalSearches: number
}

const isClearing = ref(false)

// 2. Gắn Interface vào useFetch bằng dấu < >
const { data, pending, refresh } = await useFetch<SearchHistoryResponse>('/api/admin/search-history')

// Hàm xóa toàn bộ lịch sử
const clearHistory = async () => {
  if (!confirm('本当にすべての検索履歴を削除しますか？\n(Are you sure you want to clear all search history?)')) return
  
  isClearing.value = true
  try {
    await $fetch('/api/admin/search-history', { method: 'DELETE' })
    await refresh()
    alert('履歴をリセットしました。(History cleared successfully.)')
  } catch (error) {
    alert('エラーが発生しました。(Error clearing history.)')
    console.error(error)
  } finally {
    isClearing.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>