<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-4 sm:p-6">
    <div class="mx-auto max-w-7xl">
      
      <!-- Header -->
      <header class="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <NuxtLink to="/admin" class="text-zinc-500 hover:text-white transition flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              ダッシュボードに戻る (Back)
            </NuxtLink>
          </div>
          <h1 class="text-xl font-bold text-white">広告管理 (Ads Management)</h1>
          <p class="text-xs text-zinc-500 mt-1">
            複数ネットワークのローテーション・A/Bテスト設定
          </p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Cột trái: Form Thêm/Sửa (Làm rộng hơn để chứa danh sách source) -->
        <div class="lg:col-span-5">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-5 sticky top-6 shadow-sm">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-cyan-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                {{ isEditing ? '設定の更新 (Edit Position)' : '新規追加 (Add Position)' }}
              </h2>
              <span v-if="totalWeight !== 100" class="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">
                Total: {{ totalWeight }}% (100%推奨)
              </span>
            </div>
            
            <form @submit.prevent="saveAd" class="space-y-5">
              <!-- Chọn vị trí -->
              <div>
                <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">表示位置 (Position)</label>
                <select v-model="formData.position" required :disabled="isEditing" class="w-full bg-[#05060a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 appearance-none">
                    <optgroup label="ヘッダー下 (Header)">
                        <option value="header_desktop">Header - PC用</option>
                        <option value="header_mobile">Header - SP用</option>
                    </optgroup>
                    <optgroup label="プレイヤー周辺 (Player)">
                        <option value="player_top_desktop">Player Top - PC用</option>
                        <option value="player_top_mobile">Player Top - SP用</option>
                        <option value="player_bottom_desktop">Player Bottom - PC用</option>
                        <option value="player_bottom_mobile">Player Bottom - SP用</option>
                    </optgroup>
                    <optgroup label="画面固定 (Sticky)">
                        <option value="sticky_left">Sticky Left - 画面左</option>
                        <option value="sticky_right">Sticky Right - 画面右</option>
                    </optgroup>
                    <optgroup label="グローバル (Toàn cục - Ẩn)">
                        <option value="global_head">Global Head (GA, Meta...)</option>
                        <option value="global_body">Global Body (Popunder...)</option>
                        <option value="popunder_player">Popunder (Player Click)</option>
                    </optgroup>
                </select>
              </div>

              <!-- Danh sách các mã quảng cáo xoay vòng -->
              <div class="space-y-3">
                <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Ad Sources (ローテーション)</label>
                
                <div 
                  v-for="(variant, idx) in formData.variants" 
                  :key="variant.id" 
                  class="p-3 bg-black/40 border border-white/5 rounded-lg space-y-3 relative group"
                >
                  <button type="button" @click="removeVariant(idx)" class="absolute top-2 right-2 p-1 text-zinc-600 hover:text-rose-400 transition bg-black rounded shadow-sm opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div class="flex gap-2">
                    <div class="flex-1">
                      <input v-model="variant.name" type="text" placeholder="Source Name (e.g. PopAds)" class="w-full bg-[#05060a] border border-white/10 rounded px-2.5 py-1.5 text-xs text-cyan-400 focus:border-cyan-500 outline-none" required />
                    </div>
                    <div class="w-20 relative">
                      <input v-model.number="variant.weight" type="number" min="0" max="100" placeholder="%" class="w-full bg-[#05060a] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white text-center focus:border-cyan-500 outline-none pr-5" required />
                      <span class="absolute right-2 top-1.5 text-xs text-zinc-600 pointer-events-none">%</span>
                    </div>
                  </div>

                  <textarea v-model="variant.code" rows="3" required placeholder="<script>..." class="w-full bg-[#05060a] border border-white/10 rounded px-2.5 py-2 text-[10px] text-emerald-400 focus:border-cyan-500 outline-none font-mono resize-y"></textarea>

                  <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="variant.is_active" :id="'var-'+variant.id" class="w-3 h-3 accent-cyan-500 bg-zinc-900 border-zinc-700 rounded" />
                    <label :for="'var-'+variant.id" class="text-[10px] text-zinc-400 cursor-pointer select-none">このソースを有効化 (Enable Source)</label>
                  </div>
                </div>

                <button type="button" @click="addVariant" class="w-full py-2 border border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-zinc-500 hover:text-cyan-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  ソースを追加 (Add Source)
                </button>
              </div>

              <!-- Trạng thái tổng -->
              <label class="flex items-center gap-2 cursor-pointer group pt-2 border-t border-white/5">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="formData.is_active" class="peer sr-only" />
                  <div class="w-10 h-5 bg-zinc-800 rounded-full peer-checked:bg-cyan-500 transition-colors"></div>
                  <div class="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">ポジション全体を有効化 (Enable Position)</span>
              </label>

              <!-- Buttons -->
              <div class="pt-2 flex items-center gap-2">
                <button type="submit" :disabled="formData.variants.length === 0" class="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  保存 (Save Config)
                </button>
                <button v-if="isEditing" type="button" @click="resetForm" class="px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg font-bold transition-colors text-sm">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Cột phải: Bảng danh sách -->
        <div class="lg:col-span-7">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th class="bg-black/40 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">位置 (Position)</th>
                    <th class="bg-black/40 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">配信ソース (Sources & Weight)</th>
                    <th class="bg-black/40 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">状態 (Status)</th>
                    <th class="bg-black/40 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="ad in ads" :key="ad.id" class="hover:bg-white/[0.02] transition-colors group">
                    <td class="p-4 text-sm font-bold text-white whitespace-nowrap">
                      {{ ad.position }}
                    </td>
                    <td class="p-4">
                      <div class="flex flex-wrap gap-1.5">
                        <template v-if="ad._parsedVariants && ad._parsedVariants.length > 0">
                          <span 
                            v-for="v in ad._parsedVariants" 
                            :key="v.id"
                            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
                            :class="v.is_active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'"
                          >
                            {{ v.name }} ({{ v.weight }}%)
                          </span>
                        </template>
                        <span v-else class="text-[10px] text-zinc-600 italic">No sources</span>
                      </div>
                    </td>
                    <td class="p-4 whitespace-nowrap">
                      <span v-if="ad.is_active" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span> Active
                      </span>
                      <span v-else class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                        <span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Inactive
                      </span>
                    </td>
                    <td class="p-4 whitespace-nowrap text-right">
                      <button @click="editAd(ad)" class="text-zinc-500 hover:text-cyan-400 p-2 transition-colors bg-zinc-800/50 hover:bg-zinc-800 rounded-md" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button @click="deleteAd(ad.id!)" class="text-zinc-500 hover:text-rose-500 p-2 transition-colors bg-zinc-800/50 hover:bg-zinc-800 rounded-md ml-1" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!ads.length">
                    <td colspan="4" class="p-8 text-center text-zinc-500 text-sm">
                      登録されている広告データはありません。(No ad configurations found.)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

// --- TYPES ---
interface AdVariant {
  id: string;
  name: string;
  code: string;
  weight: number;
  is_active: boolean;
}

interface AdConfig {
  id?: number
  position: string
  code: string // Sẽ dùng để lưu chuỗi JSON
  is_active: boolean
  updated_at?: string
  _parsedVariants?: AdVariant[] // Dùng riêng cho UI
}

interface FormState {
  id?: number;
  position: string;
  is_active: boolean;
  variants: AdVariant[];
}

// --- STATE ---
const ads = ref<AdConfig[]>([])
const isEditing = ref(false)

const formData = ref<FormState>({
  position: 'header_desktop',
  is_active: true,
  variants: []
})

// Tính tổng % để cảnh báo nếu không bằng 100
const totalWeight = computed(() => {
  return formData.value.variants
    .filter(v => v.is_active)
    .reduce((sum, v) => sum + (v.weight || 0), 0);
})

// --- HELPER: Parse JSON an toàn ---
const parseAdCode = (rawCode: string): AdVariant[] => {
  if (!rawCode) return [];
  try {
    const parsed = JSON.parse(rawCode);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Nếu lỗi Parse -> Đây là Raw HTML code từ bản cũ
    // Tự động bọc nó vào thành 1 Variant tên là "Legacy Code" với tỉ lệ 100%
  }
  return [{
    id: Date.now().toString(),
    name: 'Legacy Code',
    code: rawCode,
    weight: 100,
    is_active: true
  }];
}

// --- ACTIONS ---
const fetchAds = async () => {
  try {
    const data = await $fetch<AdConfig[]>('/api/admin/ads')
    ads.value = (data || []).map(ad => ({
      ...ad,
      _parsedVariants: parseAdCode(ad.code)
    }))
  } catch (error) {
    console.error('Lỗi khi tải danh sách quảng cáo:', error)
  }
}

const addVariant = () => {
  formData.value.variants.push({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    code: '',
    weight: formData.value.variants.length === 0 ? 100 : 0, // Code đầu tiên mặc định 100%
    is_active: true
  })
}

const removeVariant = (index: number) => {
  formData.value.variants.splice(index, 1)
}

const editAd = (ad: AdConfig) => {
  isEditing.value = true
  formData.value = {
    id: ad.id,
    position: ad.position,
    is_active: ad.is_active,
    variants: parseAdCode(ad.code) // Khôi phục JSON thành mảng
  }
}

const saveAd = async () => {
  try {
    // Lọc bỏ những variant không có nội dung code
    const validVariants = formData.value.variants.filter(v => v.code && v.code.trim() !== '');
    
    const payload = {
      id: formData.value.id,
      position: formData.value.position,
      is_active: formData.value.is_active,
      code: JSON.stringify(validVariants) // Nén toàn bộ mảng thành String JSON
    }

    await $fetch('/api/admin/ads', {
      method: 'POST',
      body: payload
    })
    
    resetForm()
    await fetchAds()
  } catch (error) {
    alert('Có lỗi xảy ra khi lưu.')
    console.error(error)
  }
}

const deleteAd = async (id: number) => {
  if (!confirm('この広告設定を削除してもよろしいですか？ (Are you sure?)')) return
  try {
    await $fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
    await fetchAds()
  } catch (error) {
    alert('Lỗi khi xóa.')
  }
}

const resetForm = () => {
  isEditing.value = false
  formData.value = {
    position: 'header_desktop',
    is_active: true,
    variants: []
  }
}

// Khởi tạo
await fetchAds()
</script>