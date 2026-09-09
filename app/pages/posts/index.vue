<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 pb-20 pt-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      
      <!-- Tiêu đề trang -->
      <header class="mb-10 border-b border-white/5 pb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <span class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" /></svg>
          </span>
          特集記事 <span class="text-lg text-zinc-500 font-normal hidden sm:inline">(Editor's Selection)</span>
        </h1>
        <p class="text-sm text-zinc-500 mt-3">
          運営チームが厳選したおすすめ作品や、テーマ別の特集コラムをお届けします。
        </p>
      </header>

      <!-- Trạng thái Loading -->
      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin h-10 w-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full"></div>
      </div>

      <!-- Không có bài viết -->
      <div v-else-if="posts.length === 0" class="text-center py-20 text-zinc-500 border border-white/5 bg-zinc-900/30 rounded-2xl">
        <p>公開されている記事がありません。</p>
      </div>

      <!-- Lưới bài viết (1 cột Mobile, 2 cột Tablet, 3 cột PC) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <NuxtLink 
          v-for="post in posts" 
          :key="post.id" 
          :to="`/post/${post.slug}`"
          class="group block bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:bg-zinc-900/80 hover:-translate-y-1 transition-all duration-300 shadow-lg"
        >
          <!-- 1. Thumbnail -->
          <div class="aspect-video w-full bg-zinc-800 relative overflow-hidden">
            <img 
              v-if="post.thumbnail_url" 
              :src="post.thumbnail_url" 
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
              <svg class="w-16 h-16 text-zinc-700 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
          
          <div class="p-5 sm:p-6">
            <!-- 2. Tiêu đề -->
            <h2 class="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
              {{ post.title }}
            </h2>
            
            <!-- 3. Ngày cập nhật (Sắp xếp theo ngày này) -->
            <p class="text-xs text-emerald-500/80 mb-3 flex items-center gap-1.5 font-mono bg-emerald-500/10 inline-flex px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              更新日: {{ new Date(post.updated_at).toLocaleDateString('ja-JP') }}
            </p>
            
            <!-- 4. Mô tả ngắn (Tự động trích xuất từ HTML) -->
            <p class="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {{ post.description || getExcerpt(post.content_html) }}
            </p>
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useSupabaseClient, useSeoMeta } from '#imports'

const supabase = useSupabaseClient<any>()

// Tối ưu SEO cho trang Hub
useSeoMeta({
  title: "特集記事 - NoriTV",
  description: "運営チームが厳選したおすすめ作品や特集コラムをお届けします。"
})

// Gọi API lấy toàn bộ bài viết đã Publish, ưu tiên bài cập nhật mới nhất
const { data, pending } = await useAsyncData('posts-hub', async () => {
  const { data: postsData, error } = await supabase
    .from('editor_posts')
    .select('id, title, slug, description, thumbnail_url, content_html, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false }) // Sắp xếp theo ngày cập nhật mới nhất
  
  if (error) {
    console.error(error)
    return []
  }
  return postsData
})

const posts = computed(() => data.value ?? [])

// Helper: Xóa các thẻ HTML và nội dung rác của Tiptap để tạo đoạn mô tả ngắn gọn
const getExcerpt = (html: string) => {
  if (!html) return ''
  // Bỏ toàn bộ thẻ HTML
  let text = html.replace(/<[^>]*>?/gm, ' ')
  // Xóa các dòng text giả lập của khối Danh sách phim
  text = text.replace(/🎬 映画リストブロック.*?表示されます/g, '')
  // Cắt gọn và thêm dấu 3 chấm nếu quá dài
  return text.trim().length > 120 ? text.trim().substring(0, 120) + '...' : text.trim()
}
</script>