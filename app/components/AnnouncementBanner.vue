<template>
  <div v-if="notice" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 mb-2">
    
    <!-- Dùng hiệu ứng fade đã có sẵn trong app.vue để chuyển đổi mượt mà -->
    <Transition name="fade" mode="out-in">
      
      <!-- TRẠNG THÁI 1: KHI BỊ ẨN (Thu gọn thành nút nhỏ) -->
      <div v-if="isDismissed" class="flex justify-end">
        <button 
          @click="toggleNotice" 
          class="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          お知らせを表示
        </button>
      </div>

      <!-- TRẠNG THÁI 2: KHI HIỂN THỊ ĐẦY ĐỦ -->
      <div v-else class="relative overflow-hidden rounded-xl bg-[#0a0a0f] backdrop-blur-md border border-white/10 shadow-lg p-4 sm:p-5 flex justify-between items-start sm:items-center group">
        
        <!-- Icon to hơn, bo tròn với nền mờ tiệp với website -->
        <div class="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-zinc-300 mr-4 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 animate-pulse">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-1.598.92a5.904 5.904 0 01-2.743.687A5.903 5.903 0 014.5 21.054V12.1m4.34 3.74a33.193 33.193 0 00.985-2.783M10.34 15.84c1.208.136 2.433.204 3.66.204m-3.66-.204a33.472 33.472 0 003.66-.204m0 0c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-1.598-.92a5.904 5.904 0 01-2.743-.687A5.903 5.903 0 0113.5 8.946V17.9m-4.34-3.74a33.193 33.193 0 01.985-2.783M10.34 6.76c1.208-.136 2.433-.204 3.66-.204m-3.66.204a33.472 33.472 0 013.66.204m0 0c.253.962.584-1.892.985-2.783.247.55.06 1.21-.463 1.511l-1.598-.92a5.904 5.904 0 01-2.743.687A5.903 5.903 0 0113.5 21.054V12.1" />
          </svg>
        </div>

        <!-- Nội dung thông báo -->
        <div class="prose prose-invert max-w-none text-sm text-zinc-300 flex-1 z-10 leading-relaxed" v-html="notice.content"></div>
        
        <!-- Nút Tắt -->
        <button 
          @click="toggleNotice" 
          class="text-zinc-500 hover:text-white hover:bg-white/10 p-2 rounded-lg ml-4 flex-shrink-0 transition-colors z-10" 
          title="閉じる (Đóng)"
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
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const notice = ref(null)

// Biến trạng thái: true = bị thu nhỏ, false = đang mở to
const isDismissed = ref(true) 

onMounted(async () => {
  const { data } = await supabase
    .from('announcements')
    .select('id, content')
    .eq('is_active', true)
    .single()
  
  if (data) {
    notice.value = data
    
    const savedHiddenId = localStorage.getItem('hidden_notice_id')
    
    // Nếu có thông báo mới (ID chưa lưu trong máy) thì mở to ra
    if (savedHiddenId !== data.id) {
      isDismissed.value = false 
    }
  }
})

// Hàm dùng chung cho cả nút Đóng và nút Mở
const toggleNotice = () => {
  isDismissed.value = !isDismissed.value
  
  if (isDismissed.value && notice.value && notice.value.id) {
    // Nếu thu nhỏ -> Lưu ID vào bộ nhớ để lần sau không tự bật ra
    localStorage.setItem('hidden_notice_id', notice.value.id)
  } else {
    // Nếu bấm mở lại -> Xóa ID khỏi bộ nhớ
    localStorage.removeItem('hidden_notice_id')
  }
}
</script>