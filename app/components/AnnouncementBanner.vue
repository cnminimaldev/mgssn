<template>
  <div v-if="notice" class="bg-yellow-900 border-l-4 border-yellow-500 p-3 mb-4 mx-auto max-w-7xl shadow-md rounded-r-md flex justify-between items-center">
    <!-- Render mã HTML từ database -->
    <div class="prose prose-invert max-w-none" v-html="notice.content"></div>
    
    <!-- Nút [X] để user tắt thông báo đi cho đỡ vướng mắt -->
    <button @click="hideNotice" class="text-gray-400 hover:text-white ml-4">
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const notice = ref(null)
const isHidden = ref(false)

onMounted(async () => {
  // Nếu user đã tắt thông báo này trước đó thì không hiện lại
  if (localStorage.getItem('hide_announcement')) return

  // Lấy thông báo đang active từ Supabase
  const { data } = await supabase
    .from('announcements')
    .select('content')
    .eq('is_active', true)
    .single()
  
  if (data) {
    notice.value = data
  }
})

const hideNotice = () => {
  notice.value = null
  // Lưu vào localStorage để lần sau load lại trang web không bị hiện lại gây phiền
  localStorage.setItem('hide_announcement', 'true')
}
</script>