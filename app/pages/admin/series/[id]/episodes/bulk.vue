<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">エピソード一括登録 (Bulk Import)</h1>
          <p class="text-sm text-zinc-400 mt-1">シリーズID: {{ seriesId }}</p>
        </div>
        <NuxtLink :to="`/admin/series/${seriesId}`" class="text-sm text-zinc-400 hover:text-white transition">
          &larr; シリーズ詳細へ戻る
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1 space-y-6">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sticky top-4">
            <h2 class="font-semibold text-emerald-400 mb-4 border-b border-zinc-800 pb-2">1. リンク生成設定</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1.5">コレクション (Collection)</label>
                <select v-model="selectedCollectionId" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white">
                  <option :value="null">-- 指定なし (Default) --</option>
                  <option v-for="c in collections" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <p class="text-[10px] text-zinc-500 mt-1">シーズンやバージョン（例：TV版、OVA）を選択してください。</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-1.5">開始話数</label>
                  <input v-model.number="config.start" type="number" min="0" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-center focus:border-emerald-500 outline-none text-white" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-1.5">終了話数</label>
                  <input v-model.number="config.end" type="number" min="0" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-center focus:border-emerald-500 outline-none text-white" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-emerald-400 mb-1.5">動画URLパターン (Video M3U8)</label>
                <textarea 
                  v-model="config.urlPattern" 
                  rows="3"
                  class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm font-mono text-emerald-300 focus:border-emerald-500 outline-none placeholder-zinc-700"
                  placeholder="https://host.com/series/{n}/master.m3u8"
                ></textarea>
                <p class="text-[10px] text-zinc-500 mt-1">
                  <code class="bg-zinc-800 px-1 rounded text-white">{n}</code> が話数に置換されます。
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-yellow-400 mb-1.5">字幕URLパターン (Subtitle VTT/SRT)</label>
                <textarea 
                  v-model="config.subtitlePattern" 
                  rows="2"
                  class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm font-mono text-yellow-200 focus:border-yellow-500 outline-none placeholder-zinc-700"
                  placeholder="https://host.com/series/{n}/sub.vtt (任意)"
                ></textarea>
              </div>

              <div class="flex flex-col gap-2 pt-2">
                <button 
                  @click="generatePreview"
                  class="w-full rounded-md bg-zinc-100 py-2 text-sm font-bold text-black hover:bg-zinc-300 transition"
                >
                  リスト生成 (Generate)
                </button>
                
                <button 
                  @click="addManualRow" 
                  class="w-full rounded-md border border-zinc-700 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <span>+</span> 手動追加 (Manual Add)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 h-full flex flex-col min-h-[500px]">
            <div class="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <h2 class="font-semibold text-emerald-400">2. プレビュー ({{ previewList.length }} 話)</h2>
              <div class="flex gap-2">
                <button 
                  v-if="previewList.length"
                  @click="previewList = []"
                  class="text-xs text-red-400 hover:text-red-300 underline mr-4 transition"
                >
                  全てクリア
                </button>
                <button 
                  v-if="previewList.length"
                  @click="submitBulk" 
                  :disabled="submitting"
                  class="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition"
                >
                  <span v-if="submitting" class="animate-spin">⏳</span>
                  <span>{{ submitting ? '保存中...' : 'データベースに保存' }}</span>
                </button>
              </div>
            </div>

            <div v-if="previewList.length === 0" class="flex-1 flex flex-col items-center justify-center text-zinc-600 text-sm italic gap-2">
              <span class="text-4xl opacity-20">📝</span>
              <p>データがありません。</p>
              <p>左側の設定を入力して「リスト生成」を押すか、手動で追加してください。</p>
            </div>

            <div v-else class="flex-1 overflow-auto max-h-[70vh] pr-2 custom-scrollbar">
              <div class="space-y-3">
                <div 
                  v-for="(item, index) in previewList" 
                  :key="index"
                  class="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-black/40 p-3 hover:border-zinc-600 transition-colors"
                >
                  <div class="w-16 pt-1 flex flex-col items-center">
                    <span class="text-[10px] font-bold text-zinc-500 uppercase mb-1">話数</span>
                    <input 
                      v-model.number="item.episode_number" 
                      type="number" 
                      step="0.1"
                      class="w-full bg-transparent text-center text-lg font-bold text-white outline-none border-b border-transparent focus:border-emerald-500 focus:text-emerald-400 transition-colors" 
                    />
                  </div>
                  
                  <div class="flex-1 space-y-2">
                    <input 
                      v-model="item.title" 
                      type="text" 
                      class="w-full bg-transparent text-sm font-bold text-white placeholder-zinc-600 outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                      placeholder="タイトル（任意）"
                    />
                    
                    <div class="flex items-center gap-2 bg-zinc-900/50 rounded px-2 py-1 border border-transparent focus-within:border-emerald-500/50">
                      <span class="text-[9px] text-emerald-500 font-bold w-8">VIDEO</span>
                      <input 
                        v-model="item.video_path" 
                        type="text" 
                        class="flex-1 bg-transparent text-[11px] font-mono text-zinc-300 placeholder-zinc-700 outline-none"
                        placeholder="M3U8 URL..." 
                      />
                    </div>

                    <div class="flex items-center gap-2 bg-zinc-900/50 rounded px-2 py-1 border border-transparent focus-within:border-yellow-500/50">
                      <span class="text-[9px] text-yellow-500 font-bold w-8">SUB</span>
                      <input 
                        v-model="item.subtitle_path" 
                        type="text" 
                        class="flex-1 bg-transparent text-[11px] font-mono text-zinc-300 placeholder-zinc-700 outline-none"
                        placeholder="字幕 URL... (任意)" 
                      />
                    </div>
                  </div>

                  <button 
                    @click="removeRow(index)" 
                    class="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition"
                    title="この行を削除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter, useSupabaseClient, useFetch, definePageMeta } from '#imports'

definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
// Dùng <any> để tránh lỗi type strict của Supabase client
const supabase = useSupabaseClient<any>()

// SỬA LỖI: Ép kiểu id thành string để tránh lỗi (string | string[])
const seriesId = route.params.id as string

// Types
type PreviewItem = {
  episode_number: number
  title: string
  video_path: string
  subtitle_path: string
}

// State
const collections = ref<any[]>([])
const selectedCollectionId = ref<number | null>(null)
const submitting = ref(false)
const previewList = ref<PreviewItem[]>([])

const config = reactive({
  start: 1,
  end: 12,
  urlPattern: '',
  subtitlePattern: ''
})

// --- Load Data ---
const fetchCollections = async () => {
  const { data } = await supabase
    .from('episode_collections')
    .select('id, name')
    .eq('series_id', seriesId)
    .order('sort_order')
  
  collections.value = data || []
  // Auto select default collection if exists
  if (collections.value.length > 0) {
    selectedCollectionId.value = collections.value[0].id
  }
}
fetchCollections()

// --- Actions ---

// 1. Tạo danh sách tự động
const generatePreview = () => {
  if (!config.urlPattern.includes('{n}')) {
    alert('エラー: 動画URLパターンには、話数を表す {n} を含めてください。\n例: .../ep{n}/master.m3u8')
    return
  }
  
  if (config.end < config.start) {
    alert('エラー: 終了話数は開始話数以上である必要があります。')
    return
  }

  // Generate logic
  for (let i = config.start; i <= config.end; i++) {
    const vPath = config.urlPattern.replace('{n}', i.toString())
    
    // Tạo link sub nếu có pattern
    const sPath = config.subtitlePattern && config.subtitlePattern.includes('{n}')
      ? config.subtitlePattern.replace('{n}', i.toString())
      : ''
    
    // Kiểm tra trùng lặp
    const exists = previewList.value.some(item => item.episode_number === i)
    if (!exists) {
      previewList.value.push({
        episode_number: i,
        title: `第${i}話`,
        video_path: vPath,
        subtitle_path: sPath
      })
    }
  }
  
  // Auto sort
  sortList()
}

// 2. Thêm thủ công (Manual)
const addManualRow = () => {
  // Tìm số tập lớn nhất để gợi ý
  const maxEp = previewList.value.reduce((max, item) => Math.max(max, item.episode_number), 0)
  
  previewList.value.push({
    episode_number: maxEp + 1,
    title: '',
    video_path: '',
    subtitle_path: ''
  })
}

// 3. Xóa dòng
const removeRow = (index: number) => {
  previewList.value.splice(index, 1)
}

// 4. Sắp xếp danh sách
const sortList = () => {
  previewList.value.sort((a, b) => a.episode_number - b.episode_number)
}

// 5. Gửi lên Server
const submitBulk = async () => {
  if (previewList.value.length === 0) return

  // Sort lại lần cuối
  sortList()

  if (!confirm(`${previewList.value.length} 件のエピソードを追加しますか？`)) return

  submitting.value = true
  try {
    const { error } = await useFetch('/api/admin/episodes/bulk', {
      method: 'POST',
      body: {
        series_id: seriesId,
        collection_id: selectedCollectionId.value,
        episodes: previewList.value
      }
    })

    if (error.value) throw error.value

    alert('追加が完了しました！')
    router.push(`/admin/series/${seriesId}`)
  } catch (e: any) {
    console.error(e)
    alert('エラーが発生しました: ' + (e.message || e.statusMessage || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>