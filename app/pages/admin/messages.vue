<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-6xl">
      
      <!-- Header Trang -->
      <header class="mb-6 border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <NuxtLink to="/admin" class="text-zinc-500 hover:text-white transition" title="戻る (Quay lại)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </NuxtLink>
            受信トレイ (Hòm thư liên hệ)
          </h1>
        </div>
        
        <!-- Bộ lọc (Tabs: Tất cả / Chưa đọc) -->
        <div class="flex bg-zinc-900 rounded-lg p-1 border border-white/5 w-fit">
          <button 
            @click="filter = 'all'" 
            :class="['px-4 py-1.5 text-xs font-bold rounded-md transition', filter === 'all' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300']"
          >
            全て (Tất cả)
          </button>
          <button 
            @click="filter = 'unread'" 
            :class="['px-4 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5', filter === 'unread' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300']"
          >
            未読 (Chưa đọc)
            <span v-if="unreadCount > 0" class="bg-amber-500 text-black px-1.5 py-0.5 rounded-full text-[10px] leading-none">{{ unreadCount }}</span>
          </button>
        </div>
      </header>

      <!-- Khối Danh sách tin nhắn -->
      <div class="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden shadow-sm">
        
        <!-- Trạng thái Loading -->
        <div v-if="isLoading" class="p-12 text-center flex flex-col items-center justify-center">
          <svg class="animate-spin h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-zinc-400 text-sm">読み込み中... (Đang tải)</span>
        </div>
        
        <!-- Trạng thái Trống -->
        <div v-else-if="filteredMessages.length === 0" class="p-12 text-center text-zinc-500 text-sm">
          メッセージがありません。(Không có tin nhắn nào)
        </div>

        <!-- Danh sách thư -->
        <div v-else class="divide-y divide-white/5">
          <div v-for="msg in filteredMessages" :key="msg.id" class="group transition-colors border-l-2" :class="msg.is_read ? 'bg-transparent border-transparent' : 'bg-amber-500/5 border-amber-500 hover:bg-amber-500/10'">
            
            <!-- Dòng tiêu đề (Click để xổ ra) -->
            <div @click="toggleMessage(msg)" class="p-4 cursor-pointer hover:bg-white/5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              
              <!-- Chấm tròn báo chưa đọc -->
              <div class="hidden sm:flex w-3 flex-shrink-0 justify-center">
                <div v-if="!msg.is_read" class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
              </div>
              
              <!-- Tên người gửi -->
              <div class="w-full sm:w-32 flex-shrink-0 truncate text-sm" :class="msg.is_read ? 'text-zinc-400' : 'text-white font-bold'">
                {{ msg.name }}
              </div>
              
              <!-- Lý do + Tiêu đề -->
              <div class="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 overflow-hidden">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/10 w-fit whitespace-nowrap">
                  {{ msg.reason }}
                </span>
                <span class="text-sm truncate" :class="msg.is_read ? 'text-zinc-300' : 'text-white font-bold'">
                  {{ msg.title }}
                </span>
              </div>
              
              <!-- Thời gian -->
              <div class="text-xs text-zinc-500 whitespace-nowrap sm:text-right mt-1 sm:mt-0">
                {{ formatDate(msg.created_at) }}
              </div>
            </div>

            <!-- Nội dung chi tiết (Accordion) -->
            <div v-if="activeMessageId === msg.id" class="p-4 sm:p-6 bg-[#0a0a0f] border-t border-white/5 relative">
              
              <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                <div>
                  <div class="text-xs text-zinc-500 mb-1">送信者 (Người gửi): <span class="text-zinc-300 font-bold ml-1">{{ msg.name }}</span></div>
                  <div class="text-xs text-zinc-500 mb-1">種類 (Lý do): <span class="text-amber-400 font-bold ml-1">{{ msg.reason }}</span></div>
                  <div class="text-xs text-zinc-500">受信日時 (Thời gian): <span class="text-zinc-300 ml-1">{{ formatFullDate(msg.created_at) }}</span></div>
                </div>
                
                <!-- Nút Xoá -->
                <button 
                  @click.stop="deleteMessage(msg.id)" 
                  class="text-xs font-bold flex items-center justify-center gap-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-2 rounded-lg border border-rose-500/20 transition-all w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  削除 (Xoá)
                </button>
              </div>
              
              <!-- Hộp Nội Dung -->
              <div class="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed p-4 bg-white/5 rounded-lg border border-white/5">
                {{ msg.content }}
              </div>
              
            </div>

          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { definePageMeta, useSupabaseClient } from '#imports'

// Yêu cầu phải là Admin mới được vào trang này
definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()

// Định nghĩa cấu trúc dữ liệu cho TypeScript hiểu
interface Message {
  id: string
  name: string
  reason: string
  title: string
  content: string
  is_read: boolean
  created_at: string
}

const messages = ref<Message[]>([])
const isLoading = ref(true)
const filter = ref<'all' | 'unread'>('all')
const activeMessageId = ref<string | null>(null)

// Tải dữ liệu từ Supabase khi mở trang
const loadMessages = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (data) {
    // Sửa lại dòng này: Thêm "unknown as" vào giữa
    messages.value = data as unknown as Message[]
  } else if (error) {
    console.error('Lỗi khi tải tin nhắn:', error)
  }
  
  isLoading.value = false
}

onMounted(() => {
  loadMessages()
})

// Tính toán danh sách hiển thị dựa trên Tab (Tất cả / Chưa đọc)
const filteredMessages = computed(() => {
  if (filter.value === 'unread') {
    // Giữ lại các tin chưa đọc HOẶC tin đang được mở (activeMessageId)
    return messages.value.filter(m => !m.is_read || m.id === activeMessageId.value)
  }
  return messages.value
})

// Đếm số lượng tin chưa đọc để hiển thị trên Tab
const unreadCount = computed(() => messages.value.filter(m => !m.is_read).length)

// Hàm xử lý khi bấm vào 1 dòng tin nhắn
const toggleMessage = async (msg: Message) => {
  // Nếu đang mở thì đóng lại
  if (activeMessageId.value === msg.id) {
    activeMessageId.value = null
  } else {
    // Mở tin nhắn này ra
    activeMessageId.value = msg.id
    
    // Nếu tin này chưa đọc, thì đánh dấu đã đọc
    if (!msg.is_read) {
      msg.is_read = true // Đổi giao diện lập tức cho mượt
      
      // Gửi lệnh cập nhật ngầm xuống Database
      await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', msg.id)
    }
  }
}

// Hàm Xoá tin nhắn
const deleteMessage = async (id: string) => {
  const isConfirm = window.confirm('このメッセージを削除してもよろしいですか？\n(Bạn có chắc chắn muốn xoá tin nhắn này vĩnh viễn không?)')
  
  if (isConfirm) {
    // Xoá khỏi giao diện ngay lập tức
    messages.value = messages.value.filter(m => m.id !== id)
    activeMessageId.value = null
    
    // Xoá trên Supabase Database
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
      
    if (error) {
      alert('削除に失敗しました。(Xoá thất bại)')
      console.error(error)
    }
  }
}

// Helpers format thời gian
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit', second: '2-digit' })
}
</script>