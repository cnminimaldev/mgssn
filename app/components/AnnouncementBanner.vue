<template>
  <!-- Sử dụng max-w-7xl và px-4 giống hệt với container của Header để căn lề thẳng tắp -->
  <div v-if="notice && !isHidden" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 mb-2 transition-all duration-500 ease-out">
    
    <!-- Khối thông báo chính với hiệu ứng kính mờ và viền ngọc lục bảo -->
    <div class="relative overflow-hidden rounded-xl bg-zinc-900/80 backdrop-blur-md border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] p-3 sm:p-4 flex justify-between items-center group">
      
      <!-- Lớp phủ gradient nhẹ để tạo chiều sâu -->
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
      
      <!-- Icon loa thông báo nhỏ (Tùy chọn) -->
      <div class="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 mr-4 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 animate-pulse">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-1.598.92a5.904 5.904 0 01-2.743.687A5.903 5.903 0 014.5 21.054V12.1m4.34 3.74a33.193 33.193 0 00.985-2.783M10.34 15.84c1.208.136 2.433.204 3.66.204m-3.66-.204a33.472 33.472 0 003.66-.204m0 0c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-1.598-.92a5.904 5.904 0 01-2.743-.687A5.903 5.903 0 0113.5 8.946V17.9m-4.34-3.74a33.193 33.193 0 01.985-2.783M10.34 6.76c1.208-.136 2.433-.204 3.66-.204m-3.66.204a33.472 33.472 0 013.66.204m0 0c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-1.598.92a5.904 5.904 0 01-2.743.687A5.903 5.903 0 0113.5 21.054V12.1" />
        </svg>
      </div>

      <!-- Nội dung HTML -->
      <!-- Sử dụng text-zinc-300 để tiệp màu chữ với website -->
      <div class="prose prose-invert max-w-none text-sm text-zinc-300 flex-1 z-10" v-html="notice.content"></div>
      
      <!-- Nút Tắt -->
      <button @click="hideNotice" class="text-zinc-500 hover:text-white hover:bg-white/10 p-1.5 rounded-lg ml-4 flex-shrink-0 transition-colors z-10" title="閉じる (Đóng)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const notice = ref(null)

// Mặc định cho ẩn trước để tránh lỗi "giật giao diện" (Hydration mismatch) khi Nuxt render SSR
const isHidden = ref(true) 

onMounted(async () => {
  // 1. Lấy thông báo mới nhất đang bật từ Supabase
  const { data } = await supabase
    .from('announcements')
    .select('id, content')
    .eq('is_active', true)
    .single()
  
  if (data) {
    // 2. Lấy ID thông báo mà người dùng đã bấm ẩn (từ bộ nhớ trình duyệt)
    const savedHiddenId = localStorage.getItem('hidden_notice_id')
    
    // 3. So sánh: Nếu ID từ server KHÁC với ID đã lưu trong máy -> Hiện thông báo
    if (savedHiddenId !== data.id) {
      notice.value = data
      isHidden.value = false 
    }
  }
})

const hideNotice = () => {
  // Ẩn thông báo ngay lập tức trên màn hình
  isHidden.value = true
  
  // Lưu ID của thông báo này vào trình duyệt
  if (notice.value && notice.value.id) {
    localStorage.setItem('hidden_notice_id', notice.value.id)
  }
}
</script>