<template>
  <div 
    v-if="notice" 
    :class="[
      'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-[45] pointer-events-none',
      isHomePage ? 'absolute top-16 left-0 right-0 mt-4' : 'relative mt-4 mb-6'
    ]"
  >
    <Transition name="fade" mode="out-in">
      
      <div v-if="isDismissed" class="flex justify-end pointer-events-auto">
        <button 
          @click="toggleNotice" 
          class="flex items-center gap-2 text-xs font-bold text-white transition-all bg-zinc-900/90 hover:bg-zinc-800 px-4 py-2.5 rounded-full border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          <!-- Giữ nguyên icon loa nhỏ (megaphone) ở nút bấm vì nó vẫn đẹp -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-emerald-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          お知らせを表示
        </button>
      </div>

      <div v-else class="relative overflow-hidden rounded-xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-5 flex justify-between items-start sm:items-center group pointer-events-auto">
        
        <div class="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-zinc-300 mr-4 flex-shrink-0">
          <!-- [ĐÃ SỬA] Đổi sang icon Loa (Speaker Wave) rõ ràng và sắc nét hơn -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 animate-pulse">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>

        <div class="prose prose-invert max-w-none text-sm text-zinc-300 flex-1 z-10 leading-relaxed" v-html="notice.content"></div>
        
        <button 
          @click="toggleNotice" 
          class="text-zinc-500 hover:text-white hover:bg-white/10 p-2 rounded-lg ml-4 flex-shrink-0 transition-colors z-10" 
          title="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from '#imports' // Thêm thư viện nhận diện URL

const supabase = useSupabaseClient()
const route = useRoute()
const notice = ref(null)
const isDismissed = ref(true) 

// Tự động kiểm tra xem người dùng có đang ở trang chủ (/) hay không
const isHomePage = computed(() => route.path === '/')

onMounted(async () => {
  const { data } = await supabase
    .from('announcements')
    .select('id, content')
    .eq('is_active', true)
    .single()
  
  if (data) {
    notice.value = data
    const savedHiddenId = localStorage.getItem('hidden_notice_id')
    if (savedHiddenId !== data.id) {
      isDismissed.value = false 
    }
  }
})

const toggleNotice = () => {
  isDismissed.value = !isDismissed.value
  if (isDismissed.value && notice.value && notice.value.id) {
    localStorage.setItem('hidden_notice_id', notice.value.id)
  } else {
    localStorage.removeItem('hidden_notice_id')
  }
}
</script>