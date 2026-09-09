<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/admin"
            class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            ダッシュボードに戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">
            新規記事作成 (Editor's Selection)
          </h1>
          <p class="text-xs text-zinc-500 mt-1">
            特集記事を作成し、作品リストを埋め込みましょう
          </p>
        </div>
      </div>

      <form @submit.prevent="savePost" class="space-y-8 animate-fade-in">
        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          
          <div class="space-y-6">
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">タイトル (Tiêu đề) <span class="text-red-500">*</span></label>
              <input
                v-model="post.title"
                type="text"
                required
                class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700"
                placeholder="例: 絶対に泣ける韓国ドラマトップ10"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">スラッグ (Slug / URL) <span class="text-red-500">*</span></label>
              <input
                v-model="post.slug"
                type="text"
                required
                class="w-full md:w-1/2 bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white font-mono placeholder-zinc-700"
                placeholder="例: top-10-sad-kdrama"
              />
            </div>

            <!-- GỌI COMPONENT RICH TEXT EDITOR VỪA TẠO VÀO ĐÂY -->
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">本文 (Nội dung bài viết)</label>
              <RichTextEditor v-model="post.content_html" />
            </div>

          </div>
        </div>

        <div class="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
          <button type="button" class="px-4 py-2 rounded text-sm text-zinc-400 hover:text-white transition">
            下書き保存 (Lưu nháp)
          </button>
          <button type="submit" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition">
            公開する (Publish)
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { definePageMeta } from '#imports'
// Import component bạn vừa tạo (Nuxt 3 có thể tự động import, nhưng cứ ghi cho chắc)
import RichTextEditor from '~/components/RichTextEditor.vue'

definePageMeta({
  middleware: 'admin',
})

const post = ref({
  title: '',
  slug: '',
  content_html: '<p>ここから記事を書き始めましょう... (Bắt đầu viết bài tại đây...)</p>'
})

const savePost = () => {
  console.log('Dữ liệu bài viết chuẩn bị lưu vào DB:', post.value)
  alert('Dữ liệu HTML đã được tạo thành công! Hãy mở Console F12 để xem code.')
}
</script>