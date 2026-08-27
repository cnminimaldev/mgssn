<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-4xl">
      
      <header class="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <NuxtLink to="/admin" class="text-zinc-500 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </NuxtLink>
            サイト設定 (Cài đặt Website)
          </h1>
        </div>
      </header>

      <div class="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden shadow-sm p-6">
        <div v-if="isLoading" class="text-center text-zinc-500 py-8">読み込み中...</div>
        
        <form v-else @submit.prevent="saveSettings" class="space-y-6">
          
          <!-- Nội dung Footer -->
          <div>
            <label class="block text-sm font-bold text-white mb-2">フッターのテキスト (Nội dung Footer)</label>
            <p class="text-xs text-zinc-500 mb-2">Bản quyền, cảnh báo miễn trừ trách nhiệm (Enter để xuống dòng)</p>
            <textarea 
              v-model="form.footer_text" 
              rows="4" 
              class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
            ></textarea>
          </div>

          <div class="border-t border-white/5 pt-6">
            <label class="block text-sm font-bold text-white mb-4">ソーシャルリンク (Mạng xã hội)</label>
            <p class="text-xs text-zinc-500 mb-4">Để trống nếu không muốn hiển thị icon đó ngoài Frontend.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- X (Twitter) -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">X (Twitter) URL</label>
                <input v-model="form.x_url" type="url" placeholder="https://x.com/..." class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-zinc-300 text-sm focus:ring-1 focus:ring-emerald-500 outline-none">
              </div>
              
              <!-- Telegram -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Telegram URL</label>
                <input v-model="form.telegram_url" type="url" placeholder="https://t.me/..." class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-zinc-300 text-sm focus:ring-1 focus:ring-emerald-500 outline-none">
              </div>

              <!-- Facebook -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Facebook URL</label>
                <input v-model="form.facebook_url" type="url" placeholder="https://fb.com/..." class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-zinc-300 text-sm focus:ring-1 focus:ring-emerald-500 outline-none">
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="isSaving" class="px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black font-bold rounded-lg transition-colors flex items-center gap-2">
              <span v-if="isSaving" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              保存する (Lưu cài đặt)
            </button>
          </div>
          
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { definePageMeta, useSupabaseClient } from '#imports'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const isLoading = ref(true)
const isSaving = ref(false)

const form = reactive({
  footer_text: '',
  x_url: '',
  telegram_url: '',
  facebook_url: ''
})

onMounted(async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .single()
    
  if (data) {
    // Ép kiểu trung gian để TypeScript hiểu cấu trúc dữ liệu
    const settingsData = data as unknown as { 
      footer_text?: string; 
      x_url?: string; 
      telegram_url?: string; 
      facebook_url?: string 
    }
    
    form.footer_text = settingsData.footer_text || ''
    form.x_url = settingsData.x_url || ''
    form.telegram_url = settingsData.telegram_url || ''
    form.facebook_url = settingsData.facebook_url || ''
  }
  isLoading.value = false
})

const saveSettings = async () => {
  isSaving.value = true
  const { error } = await supabase
    .from('site_settings')
    .update({
      footer_text: form.footer_text,
      x_url: form.x_url,
      telegram_url: form.telegram_url,
      facebook_url: form.facebook_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'global')

  isSaving.value = false
  if (!error) {
    alert('設定を保存しました！ (Đã lưu cài đặt)')
  } else {
    alert('エラーが発生しました。(Có lỗi xảy ra)')
  }
}
</script>