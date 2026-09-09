<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 pb-20 pt-24">
    <div class="mx-auto max-w-4xl px-4 sm:px-6">
      
      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin h-10 w-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full"></div>
      </div>
      
      <div v-else-if="error || !post" class="text-center py-20 text-zinc-500">
        <p class="text-xl font-bold">記事が見つかりませんでした。</p>
        <p class="text-sm mt-2">Bài viết không tồn tại hoặc đã bị ẩn.</p>
        <NuxtLink to="/" class="text-emerald-400 hover:underline mt-6 inline-block bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20">ホームに戻る</NuxtLink>
      </div>

      <article v-else>
        <!-- Tiêu đề bài viết -->
        <header class="mb-10 border-b border-white/10 pb-8 text-center">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">{{ post.title }}</h1>
          <p class="text-sm text-zinc-500 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            公開日: {{ new Date(post.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </header>

        <!-- VÒNG LẶP RENDER DYNAMIC CONTENT (PHÉP MÀU NẰM Ở ĐÂY) -->
        <div class="content-wrapper">
          <template v-for="(block, index) in parsedBlocks" :key="index">
            
            <!-- 1. Nếu là văn bản HTML bình thường -->
            <div 
              v-if="block.type === 'html'" 
              v-html="block.content" 
              class="prose prose-invert prose-emerald max-w-none text-zinc-300 leading-relaxed"
            ></div>
            
            <!-- 2. Nếu là khối Movie List, gọi Component và truyền cấu hình -->
            <PostMovieList 
              v-else-if="block.type === 'movie-list'" 
              :config="block.config" 
            />
            
          </template>
        </div>
      </article>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useSupabaseClient, useAsyncData, useSeoMeta } from '#imports'
import PostMovieList from '~/components/PostMovieList.vue'

const route = useRoute()
const supabase = useSupabaseClient<any>()
const slug = route.params.slug as string

// Fetch bài viết từ Database
const { data: post, pending, error } = await useAsyncData(`post-${slug}`, async () => {
  const { data, error } = await supabase
    .from('editor_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published') // Chỉ hiển thị bài đã Publish
    .single()
    
  if (error) throw error
  return data
})

// Tối ưu SEO cho bài viết
if (post.value) {
  useSeoMeta({
    title: `${post.value.title} - NoriTV Editor's Selection`,
    description: post.value.description || `${post.value.title}の特集記事です。`
  })
}

// BỘ GIẢI MÃ HTML (PARSER)
const parsedBlocks = computed(() => {
  if (!post.value || !post.value.content_html) return []
  
  const rawHtml = post.value.content_html
  
  // Dùng Regex cắt chính xác đoạn <div> chứa data-type="movie-list"
  const regex = /(<div[^>]*data-type="movie-list"[^>]*>[\s\S]*?<\/div><\/div>)/gi
  const pieces = rawHtml.split(regex)
  
  // [ĐÃ SỬA] Thêm (piece: string)
  return pieces.map((piece: string) => {
    // Nếu mảng cắt ra là một khối cấu hình phim
    if (piece.includes('data-type="movie-list"')) {
      let config = {}
      // Tìm thuộc tính filterdata="..."
      const match = piece.match(/filterdata=['"](.*?)['"]/i)
      if (match && match[1]) {
        try {
          // Tiptap lưu JSON dưới dạng chuỗi an toàn (&quot;), cần giải mã lại
          const decoded = match[1].replace(/&quot;/g, '"')
          config = JSON.parse(decoded)
        } catch (e) {
          console.error("Lỗi parse JSON cấu hình phim:", e)
        }
      }
      return { type: 'movie-list', config }
    } 
    // Nếu là HTML bình thường (văn bản, hình ảnh, heading...)
    else {
      return { type: 'html', content: piece }
    }
  })
  // [ĐÃ SỬA] Thêm (block: any) và thêm check block.content tồn tại trước khi trim()
  .filter((block: any) => block.type === 'movie-list' || (block.content && block.content.trim() !== '')) 
})
</script>

<style scoped>
/* Dùng :deep() để CSS chỉ có tác dụng với HTML được sinh ra từ v-html, không rò rỉ ra ngoài trang web */
:deep(.content-wrapper > *) { margin-bottom: 1.5rem; }
:deep(.prose p) { margin-bottom: 1.5rem; }
:deep(.prose h2) { font-size: 1.875rem; font-weight: 800; color: #fff; margin-top: 2.5rem; margin-bottom: 1rem; }
:deep(.prose h3) { font-size: 1.5rem; font-weight: 700; color: #fff; margin-top: 2rem; margin-bottom: 1rem; }
:deep(.prose ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: #d4d4d8; }
:deep(.prose li) { margin-bottom: 0.5rem; }
:deep(.prose a) { color: #10b981; text-decoration: none; border-bottom: 1px solid #10b981; transition: all 0.2s; }
:deep(.prose a:hover) { color: #34d399; border-bottom-color: #34d399; }
:deep(.prose img) { border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 2rem 0; width: 100%; }
:deep(.prose u) { text-decoration-color: #10b981; text-underline-offset: 4px; }
</style>