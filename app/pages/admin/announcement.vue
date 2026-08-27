<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-5xl">
      
      <!-- Header giống với index.vue -->
      <header class="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <NuxtLink to="/admin" class="text-zinc-500 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </NuxtLink>
            お知らせ管理 (Announcements)
          </h1>
          <p class="text-xs text-zinc-500 mt-1 ml-7">
            ヘッダー下に表示される全体通知の編集・管理
          </p>
        </div>
      </header>

      <!-- Khối nội dung chính -->
      <div class="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden shadow-sm">
        <div class="p-4 border-b border-white/5 bg-white/5">
          <h2 class="text-sm font-bold text-white">通知内容の編集 (Edit Content)</h2>
        </div>
        
        <div class="p-6">
          <p class="text-xs text-zinc-400 mb-4">
            ここで作成したお知らせは、全ユーザーの画面上部に表示されます。文字の色や太さを変更して目立たせることができます。
          </p>

          <ClientOnly>
            <!-- Chỉ hiển thị Editor khi isLoading = false -->
            <div v-if="!isLoading" class="editor-wrapper rounded-lg border border-white/10 overflow-hidden bg-[#0a0a0f]">
              <QuillEditor 
                v-model:content="htmlContent" 
                contentType="html" 
                toolbar="essential" 
                theme="snow"
                class="min-h-[250px] text-zinc-300"
              />
            </div>
            
            <!-- Giao diện chờ lúc đang lấy data từ Supabase -->
            <div v-else class="min-h-[250px] flex items-center justify-center border border-white/10 rounded-lg text-sm text-zinc-500">
              データを読み込み中... (Đang tải dữ liệu...)
            </div>
            
            <template #fallback>
              <div class="min-h-[250px] flex items-center justify-center border border-white/10 rounded-lg text-sm text-zinc-500">
                エディタを読み込み中...
              </div>
            </template>
          </ClientOnly>

          <!-- Nút điều khiển -->
          <div class="mt-6 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div :class="[isActive ? 'bg-emerald-500' : 'bg-zinc-600', 'w-2.5 h-2.5 rounded-full transition-colors']"></div>
              <span class="text-xs text-zinc-400">
                現在のステータス: <strong class="text-zinc-200">{{ isActive ? '表示中 (Active)' : '非表示 (Inactive)' }}</strong>
              </span>
            </div>

            <div class="flex gap-3">
              <button 
                @click="toggleActiveStatus"
                class="px-4 py-2 text-xs font-bold rounded-lg border transition-colors"
                :class="isActive 
                  ? 'border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white' 
                  : 'border-white/10 text-zinc-300 bg-white/5 hover:bg-white/10'"
              >
                {{ isActive ? '非表示にする (Deactivate)' : '表示する (Activate)' }}
              </button>

              <button 
                @click="saveAnnouncement"
                :disabled="isSaving"
                class="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-colors disabled:opacity-50"
              >
                <svg v-if="isSaving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>保存して更新 (Save & Update)</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { definePageMeta, useSupabaseClient } from '#imports'

definePageMeta({
  middleware: 'admin',
})

const supabase = useSupabaseClient()

// 1. Định nghĩa cấu trúc dữ liệu cho bảng announcements để TypeScript hiểu
interface Announcement {
  id: string
  content: string
  is_active: boolean
  created_at?: string
}

const htmlContent = ref('')
const isActive = ref(false)
const isSaving = ref(false)
const activeId = ref<string | null>(null)

const isLoading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const announcement = data as Announcement | null

  if (announcement) {
    htmlContent.value = announcement.content
    isActive.value = announcement.is_active
    activeId.value = announcement.id
  }
  
  // Sau khi lấy dữ liệu xong, tắt loading để Quill Editor xuất hiện
  isLoading.value = false
})

const saveAnnouncement = async () => {
  isSaving.value = true
  
  // Reset các thông báo cũ về inactive
  await supabase.from('announcements').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  
  // Lưu thông báo mới
  const { data, error } = await supabase.from('announcements').insert([
    { content: htmlContent.value, is_active: true }
  ]).select().single()

  const newAnnouncement = data as Announcement | null

  if (!error && newAnnouncement) {
    isActive.value = true
    activeId.value = newAnnouncement.id
    alert('お知らせを更新しました！ (Announcement updated successfully!)')
  } else {
    alert('エラーが発生しました。 (An error occurred.)')
    console.error(error)
  }
  
  isSaving.value = false
}

const toggleActiveStatus = async () => {
  if (!activeId.value) return
  
  const newStatus = !isActive.value
  const { error } = await supabase
    .from('announcements')
    .update({ is_active: newStatus })
    .eq('id', activeId.value)

  if (!error) {
    isActive.value = newStatus
  }
}
</script>

<style>
/* --- CUSTOM DARK THEME CHO QUILL EDITOR --- */
/* Biến đổi giao diện sáng mặc định của Quill cho phù hợp với nền tối */
.editor-wrapper .ql-toolbar.ql-snow {
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background-color: rgba(255,255,255,0.02);
}
.editor-wrapper .ql-container.ql-snow {
  border: none;
  font-family: inherit;
}
.editor-wrapper .ql-snow .ql-stroke {
  stroke: #a1a1aa; /* text-zinc-400 */
}
.editor-wrapper .ql-snow .ql-fill, 
.editor-wrapper .ql-snow .ql-stroke.ql-fill {
  fill: #a1a1aa;
}
.editor-wrapper .ql-snow .ql-picker {
  color: #a1a1aa;
}
.editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
.editor-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke,
.editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke,
.editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke {
  stroke: #10b981; /* emerald-500 */
}
.editor-wrapper .ql-snow.ql-toolbar button:hover .ql-fill,
.editor-wrapper .ql-snow .ql-toolbar button:hover .ql-fill,
.editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill,
.editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-fill {
  fill: #10b981;
}
.editor-wrapper .ql-editor {
  min-height: 250px;
  font-size: 0.875rem;
}
/* Hiển thị placeholder */
.editor-wrapper .ql-editor.ql-blank::before {
  color: #52525b; /* text-zinc-600 */
  font-style: normal;
}
</style>