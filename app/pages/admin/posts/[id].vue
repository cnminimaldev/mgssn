<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-5xl">
      <div v-if="pending" class="py-20 flex justify-center">
        <div class="animate-spin h-8 w-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full"></div>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-8">
          <div>
            <NuxtLink to="/admin/posts" class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              記事一覧に戻る
            </NuxtLink>
            <h1 class="text-2xl font-bold text-white">記事編集 (Chỉnh sửa bài viết)</h1>
          </div>
        </div>

        <form @submit.prevent class="space-y-8 animate-fade-in">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">タイトル (Tiêu đề) <span class="text-red-500">*</span></label>
                <input v-model="post.title" type="text" required class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700" />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">スラッグ (Slug / URL) <span class="text-red-500">*</span></label>
                <input v-model="post.slug" type="text" required class="w-full md:w-1/2 bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white font-mono placeholder-zinc-700" />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">本文 (Nội dung bài viết)</label>
                <!-- COMPONENT EDITOR -->
                <RichTextEditor v-model="post.content_html" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
            <button 
              type="button" 
              @click="updatePost(false)"
              :disabled="saving"
              class="px-4 py-2 rounded text-sm text-zinc-400 hover:text-white transition disabled:opacity-50"
            >
              下書きとして保存 (Lưu lại thành bản nháp)
            </button>
            <button 
              type="button"
              @click="updatePost(true)"
              :disabled="saving"
              class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
            >
              <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              更新して公開 (Cập nhật & Xuất bản)
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { definePageMeta, useSupabaseClient, useRoute, useRouter } from '#imports'
import RichTextEditor from '~/components/RichTextEditor.vue'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient<any>()
const route = useRoute()
const router = useRouter()
const postId = route.params.id as string

const pending = ref(true)
const saving = ref(false)

const post = ref({
  title: '',
  slug: '',
  content_html: '',
  status: 'draft'
})

// Khi mở trang, gọi API để lấy bài viết cũ đắp lên Form
onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('editor_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) throw error

    // Đổ dữ liệu vào Form
    post.value.title = data.title
    post.value.slug = data.slug
    post.value.content_html = data.content_html || ''
    post.value.status = data.status

  } catch (e: any) {
    alert('記事の読み込みに失敗しました: ' + e.message)
    router.push('/admin/posts')
  } finally {
    pending.value = false
  }
})

// Hàm Cập nhật bài viết
const updatePost = async (publish: boolean) => {
  if (!post.value.title || !post.value.slug) {
    alert('タイトルとスラッグは必須です')
    return
  }

  saving.value = true
  post.value.status = publish ? 'published' : 'draft'

  try {
    const { error } = await supabase
      .from('editor_posts')
      .update({
        title: post.value.title,
        slug: post.value.slug,
        content_html: post.value.content_html,
        status: post.value.status,
        updated_at: new Date()
      })
      .eq('id', postId) // [QUAN TRỌNG] Update đúng ID

    if (error) throw error

    alert('更新しました！ (Đã cập nhật!)')
    router.push('/admin/posts')
    
  } catch (error: any) {
    console.error(error)
    alert('エラーが発生しました: ' + error.message)
  } finally {
    saving.value = false
  }
}
</script>