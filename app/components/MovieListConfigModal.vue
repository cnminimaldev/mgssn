<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Lớp nền đen mờ -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
        
        <!-- Khối Modal -->
        <div class="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="p-6 border-b border-white/5 bg-zinc-900/50 shrink-0">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
              作品リストブロックの設定
            </h3>
            <p class="text-xs text-zinc-400 mt-1">
              埋め込む作品リストの表示モードと条件を選択してください。
            </p>
          </div>

          <!-- Body (Scrollable) -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            
            <!-- CHUYỂN ĐỔI CHẾ ĐỘ (TABS) -->
            <div class="flex gap-2 p-1 bg-black border border-zinc-700 rounded-lg mb-6">
              <button 
                @click="form.mode = 'auto'" 
                :class="form.mode === 'auto' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'" 
                class="flex-1 py-2 text-xs rounded-md font-bold transition-all"
              >
                自動抽出 (Lọc Tự Động)
              </button>
              <button 
                @click="form.mode = 'manual'" 
                :class="form.mode === 'manual' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'" 
                class="flex-1 py-2 text-xs rounded-md font-bold transition-all"
              >
                個別指定 (Chọn Thủ Công)
              </button>
            </div>

            <!-- CHẾ ĐỘ 1: LỌC TỰ ĐỘNG -->
            <div v-if="form.mode === 'auto'" class="space-y-5 animate-fade-in">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-1">タイプ (Loại)</label>
                  <select v-model="form.type" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                    <option value="all">すべて (Tất cả)</option>
                    <option value="series">シリーズ (Phim bộ)</option>
                    <option value="movie">映画 (Phim lẻ)</option>
                  </select>
                </div>
                
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

              <!-- CHỌN THỂ LOẠI -->
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">ジャンル (Thể loại)</label>
                <div v-if="genresLoading" class="text-xs text-zinc-500 flex items-center gap-2">
                  <span class="animate-spin h-3 w-3 border-2 border-zinc-500 border-t-transparent rounded-full"></span> 読み込み中...
                </div>
                <div v-else class="max-h-32 overflow-y-auto bg-black border border-zinc-700 rounded p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 custom-scrollbar">
                  <label v-for="genre in genres" :key="genre.slug" class="flex items-center gap-2 cursor-pointer group">
                    <!-- Lưu ý: Dùng genre.slug vì API của bạn lọc theo slug -->
                    <input type="checkbox" :value="genre.slug" v-model="form.genre_slugs" class="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0">
                    <span class="text-xs text-zinc-400 group-hover:text-white transition-colors truncate">
                      {{ genre.name_ja || genre.name }}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">並び順 (Sắp xếp theo)</label>
                <select v-model="form.sort" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                  <option value="updated_at_desc">更新日時の新しい順 (Mới cập nhật)</option>
                  <option value="created_at_desc">登録日時の新しい順 (Mới đăng)</option>
                  <option value="year_desc">公開年が新しい順 (Năm sản xuất mới nhất)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">表示件数 (Số lượng hiển thị)</label>
                <input v-model.number="form.limit" type="number" min="1" max="50" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>

            <!-- CHẾ ĐỘ 2: CHỌN THỦ CÔNG (MANUAL) -->
            <div v-else class="space-y-5 animate-fade-in">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">作品のスラッグ指定 (Nhập Slug phim)</label>
                <textarea 
                  v-model="form.specific_slugs" 
                  rows="5" 
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none font-mono" 
                  placeholder="例: squid-game, crash-landing-on-you"
                ></textarea>
                <p class="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                  ※ カンマ（,）区切りで入力してください。<br/>
                  ※ IDではなくURLの末尾にある「スラッグ (Slug)」を入力すると正確です。<br/>
                  (Nhập cách nhau bằng dấu phẩy. Khuyên dùng Slug thay vì ID để không bị trùng lặp giữa Movie và Series).
                </p>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-white/5 bg-zinc-950 flex justify-end gap-3 shrink-0">
            <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              キャンセル (Hủy)
            </button>
            <button type="button" @click="handleApply" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded shadow-lg shadow-emerald-900/20 transition-all">
              挿入する (Chèn)
            </button>
          </div>
          
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'apply'])
const supabase = useSupabaseClient<any>()

const genres = ref<any[]>([])
const genresLoading = ref(true)

// Khởi tạo form với thuộc tính mới
const form = reactive({
  mode: 'auto', // 'auto' | 'manual'
  type: 'all',
  country: 'all',
  genre_slugs: [] as string[],
  sort: 'updated_at_desc',
  limit: 12,
  specific_slugs: ''
})

onMounted(async () => {
  try {
    // Tải danh sách thể loại từ DB
    const { data, error } = await supabase
      .from("genres")
      .select("slug, name, name_ja") // Lấy cột slug thay vì id
      .order("sort_order", { ascending: true });

    if (!error && data) {
      genres.value = data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    genresLoading.value = false;
  }
})

// Reset form sạch sẽ mỗi khi mở lại Modal
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.mode = 'auto'
    form.type = 'all'
    form.country = 'all'
    form.genre_slugs = []
    form.sort = 'updated_at_desc'
    form.limit = 12
    form.specific_slugs = ''
  }
})

const handleApply = () => {
  emit('apply', { ...form })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fade-in { animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Tùy chỉnh thanh cuộn cho Modal */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
</style>