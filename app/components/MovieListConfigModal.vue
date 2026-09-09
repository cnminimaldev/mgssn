<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Lớp nền đen mờ -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
        
        <!-- Khối Modal -->
        <div class="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          
          <!-- Header -->
          <div class="p-6 border-b border-white/5 bg-zinc-900/50">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
              作品リストブロックの設定 (Cấu hình danh sách)
            </h3>
            <p class="text-xs text-zinc-400 mt-1">
              表示する作品の条件（フィルター）を選択してください。
            </p>
          </div>

          <!-- Body (Form) -->
          <div class="p-6 space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <!-- Loại phim -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">タイプ (Loại)</label>
                <select v-model="form.type" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                  <option value="all">すべて (Tất cả)</option>
                  <option value="series">シリーズ (Phim bộ)</option>
                  <option value="movie">映画 (Phim lẻ)</option>
                </select>
              </div>
              
              <!-- Quốc gia -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">国・地域 (Quốc gia)</label>
                <select v-model="form.country" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                  <option value="all">すべて (Tất cả)</option>
                  <option value="KR">韓国 (Hàn Quốc)</option>
                  <option value="JP">日本 (Nhật Bản)</option>
                  <option value="US">米国 (Mỹ)</option>
                  <option value="CN">中国 (Trung Quốc)</option>
                </select>
              </div>
            </div>

            <!-- Sắp xếp -->
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">並び順 (Sắp xếp theo)</label>
              <select v-model="form.sort" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                <option value="updated_at_desc">更新日時の新しい順 (Mới cập nhật)</option>
                <option value="created_at_desc">登録日時の新しい順 (Mới đăng)</option>
                <option value="year_desc">公開年が新しい順 (Năm sản xuất mới nhất)</option>
              </select>
            </div>

            <!-- Giới hạn số lượng -->
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">表示件数 (Số lượng hiển thị)</label>
              <input 
                v-model.number="form.limit" 
                type="number" min="1" max="50" 
                class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" 
              />
              <p class="text-[10px] text-zinc-500 mt-1">※ Tối đa 50 phim.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-white/5 bg-zinc-950 flex justify-end gap-3">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              キャンセル (Hủy)
            </button>
            <button 
              type="button" 
              @click="handleApply" 
              class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded shadow-lg shadow-emerald-900/20 transition-all"
            >
              挿入する (Chèn)
            </button>
          </div>
          
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'apply'])

// Khởi tạo form mặc định
const form = reactive({
  type: 'all',
  country: 'all',
  sort: 'updated_at_desc',
  limit: 12
})

// Reset form mỗi khi mở modal lại
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.type = 'all'
    form.country = 'all'
    form.sort = 'updated_at_desc'
    form.limit = 12
  }
})

const handleApply = () => {
  // Gửi toàn bộ dữ liệu cấu hình ra ngoài cho Editor
  emit('apply', { ...form })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
  animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>