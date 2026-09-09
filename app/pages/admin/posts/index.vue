<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-7xl">
      
      <header class="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            ダッシュボードに戻る
          </NuxtLink>
          <h1 class="text-xl font-bold text-white">特集記事管理 (Editor's Posts)</h1>
        </div>
        
        <NuxtLink to="/admin/posts/new" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow shadow-emerald-900/20 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          新規作成 (Tạo bài mới)
        </NuxtLink>
      </header>

      <div class="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
        <div v-if="pending" class="p-12 flex justify-center">
          <div class="animate-spin h-8 w-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full"></div>
        </div>

        <div v-else-if="posts.length === 0" class="p-12 text-center text-zinc-500">
          記事がまだありません。(Chưa có bài viết nào)
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-zinc-400">
            <thead class="bg-zinc-950/50 text-xs text-zinc-500 uppercase border-b border-white/5">
              <tr>
                <th class="px-4 py-3">タイトル (Tiêu đề)</th>
                <th class="px-4 py-3">スラッグ (Slug)</th>
                <th class="px-4 py-3">ステータス (Status)</th>
                <th class="px-4 py-3">更新日 (Cập nhật)</th>
                <th class="px-4 py-3 text-right">アクション (Hành động)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="post in posts" :key="post.id" class="hover:bg-white/[0.02] transition-colors">
                <td class="px-4 py-3 font-medium text-white">{{ post.title }}</td>
                <td class="px-4 py-3 font-mono text-xs text-zinc-500">{{ post.slug }}</td>
                <td class="px-4 py-3">
                  <span v-if="post.status === 'published'" class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">公開中 (Published)</span>
                  <span v-else class="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">下書き (Draft)</span>
                </td>
                <td class="px-4 py-3 text-xs">{{ new Date(post.updated_at).toLocaleDateString('ja-JP') }}</td>
                <td class="px-4 py-3 text-right space-x-3">
                  <!-- Xem trước -->
                  <a v-if="post.status === 'published'" :href="`/post/${post.slug}`" target="_blank" class="text-xs text-sky-400 hover:text-sky-300">プレビュー</a>
                  <!-- Sửa -->
                  <NuxtLink :to="`/admin/posts/${post.id}`" class="text-xs text-emerald-400 hover:text-emerald-300">編集</NuxtLink>
                  <!-- Xóa -->
                  <button @click="deletePost(post.id)" class="text-xs text-red-500 hover:text-red-400">削除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta, useSupabaseClient, useAsyncData } from '#imports'

definePageMeta({ middleware: 'admin' })
const supabase = useSupabaseClient<any>()

// Fetch danh sách bài viết
const { data: postsData, pending, refresh } = await useAsyncData('admin-posts-list', async () => {
  const { data, error } = await supabase
    .from('editor_posts')
    .select('id, title, slug, status, updated_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
})

const posts = computed(() => postsData.value ?? [])

// Hàm Xóa bài viết
const deletePost = async (id: number) => {
  if (!window.confirm('本当にこの記事を削除しますか？ (Bạn có chắc chắn muốn xóa bài viết này không?)')) return

  try {
    const { error } = await supabase.from('editor_posts').delete().eq('id', id)
    if (error) throw error
    alert('削除しました (Đã xóa thành công)')
    refresh() // Tải lại danh sách
  } catch (err: any) {
    alert('エラー (Lỗi): ' + err.message)
  }
}
</script>