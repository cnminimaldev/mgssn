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
          <h1 class="text-xl font-bold text-white">広告管理</h1>
          <p class="text-xs text-zinc-500 mt-1">
            Ads Management / バナーとスクリプトの設定
          </p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Cột trái: Form Thêm/Sửa -->
        <div class="lg:col-span-1">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-6 sticky top-6 shadow-sm">
            <h2 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-cyan-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              {{ isEditing ? '設定の更新 (Update)' : '新規追加 (Add New)' }}
            </h2>
            
            <form @submit.prevent="saveAd" class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">表示位置 (Position)</label>
                <select v-model="formData.position" required :disabled="isEditing" class="w-full bg-[#05060a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 appearance-none">
                    <optgroup label="ヘッダー下 (Header)">
                        <option value="header_desktop">Header - PC用 (PC)</option>
                        <option value="header_mobile">Header - SP用 (Mobile)</option>
                    </optgroup>
                    <optgroup label="プレイヤー周辺 (Player)">
                        <option value="player_top_desktop">Player Top - PC用 (PC)</option>
                        <option value="player_top_mobile">Player Top - SP用 (Mobile)</option>
                        <option value="player_bottom_desktop">Player Bottom - PC用 (PC)</option>
                        <option value="player_bottom_mobile">Player Bottom - SP用 (Mobile)</option>
                    </optgroup>
                    <optgroup label="フッター上 (Footer)">
                        <option value="footer_desktop">Footer - PC用 (PC)</option>
                        <option value="footer_mobile">Footer - SP用 (Mobile)</option>
                    </optgroup>
                    <optgroup label="画面固定 (Sticky - Chỉ dành cho PC)">
                        <option value="sticky_left">Sticky Left - 画面左固定</option>
                        <option value="sticky_right">Sticky Right - 画面右固定</option>
                    </optgroup>
                    <optgroup label="グローバル (Toàn cục - Ẩn)">
                        <option value="global_head">Global Head (Google Analytics, Meta...)</option>
                        <option value="global_body">Global Body (Popunder, Interstitial...)</option>
                        <option value="popunder_player">Popunder (Only for Player)</option>
                    </optgroup>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">コード (Ad Code)</label>
                <textarea v-model="formData.code" rows="6" required placeholder="<script> または <iframe> を入力..." class="w-full bg-[#05060a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono placeholder:text-zinc-700 resize-y"></textarea>
              </div>

              <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="formData.is_active" class="peer sr-only" />
                  <div class="w-10 h-5 bg-zinc-800 rounded-full peer-checked:bg-cyan-500 transition-colors"></div>
                  <div class="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">有効 (Active)</span>
              </label>

              <div class="pt-2 flex items-center gap-2">
                <button type="submit" class="flex-1 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold py-2.5 rounded-lg transition-colors text-sm">
                  保存 (Save)
                </button>
                <button v-if="isEditing" type="button" @click="resetForm" class="px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg font-bold transition-colors text-sm">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Cột phải: Bảng danh sách -->
        <div class="lg:col-span-2">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th class="bg-black/20 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">位置 (Position)</th>
                    <th class="bg-black/20 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">状態 (Status)</th>
                    <th class="bg-black/20 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">更新日 (Updated)</th>
                    <th class="bg-black/20 p-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap text-right">操作 (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ad in ads" :key="ad.id" class="hover:bg-white/[0.02] transition-colors group">
                    <td class="p-4 border-t border-white/5 text-sm font-bold text-white whitespace-nowrap">
                      {{ ad.position }}
                    </td>
                    <td class="p-4 border-t border-white/5 whitespace-nowrap">
                      <span v-if="ad.is_active" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                      <span v-else class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-xs font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Inactive
                      </span>
                    </td>
                    <td class="p-4 border-t border-white/5 text-sm text-zinc-400 whitespace-nowrap">
                      {{ ad.updated_at ? new Date(ad.updated_at).toLocaleDateString('ja-JP') : '-' }}
                    </td>
                    <td class="p-4 border-t border-white/5 whitespace-nowrap text-right">
                      <button @click="editAd(ad)" class="text-zinc-500 hover:text-cyan-400 p-2 transition-colors" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button @click="deleteAd(ad.id!)" class="text-zinc-500 hover:text-rose-500 p-2 transition-colors ml-1" title="Delete">
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
import { ref } from 'vue'
import { definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin',
})

interface AdConfig {
  id?: number
  position: string
  code: string
  is_active: boolean
  updated_at?: string
}

const ads = ref<AdConfig[]>([])
const isEditing = ref(false)

const formData = ref<AdConfig>({
  position: 'header',
  code: '',
  is_active: true
})

const fetchAds = async () => {
  try {
    const data = await $fetch<AdConfig[]>('/api/admin/ads')
    ads.value = data || []
  } catch (error) {
    console.error('Lỗi khi tải danh sách quảng cáo:', error)
  }
}

const saveAd = async () => {
  try {
    await $fetch('/api/admin/ads', {
      method: 'POST',
      body: formData.value
    })
    resetForm()
    await fetchAds()
  } catch (error) {
    alert('Có lỗi xảy ra khi lưu.')
    console.error(error)
  }
}

const editAd = (ad: AdConfig) => {
  isEditing.value = true
  formData.value = { ...ad }
}

const deleteAd = async (id: number) => {
  if (!confirm('この広告設定を削除してもよろしいですか？ (Are you sure?)')) return
  try {
    await $fetch(`/api/admin/ads/${id}`, {
      method: 'DELETE'
    })
    await fetchAds()
  } catch (error) {
    alert('Lỗi khi xóa.')
  }
}

const resetForm = () => {
  isEditing.value = false
  formData.value = {
    position: 'header',
    code: '',
    is_active: true
  }
}

await fetchAds()
</script>