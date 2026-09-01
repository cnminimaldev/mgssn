<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">エピソード一覧</h1>
          <p class="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <span class="bg-zinc-800 px-2 py-0.5 rounded text-xs">Series: {{ seriesId }}</span>
            <span class="text-zinc-600">/</span>
            <span class="bg-zinc-800 px-2 py-0.5 rounded text-xs">Collection: {{ collectionId }}</span>
            <span v-if="seriesSlug" class="text-zinc-600">| Slug: {{ seriesSlug }}</span>
          </p>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/admin/series/${seriesId}/collections`" class="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 text-zinc-300">
            &larr; 戻る
          </NuxtLink>
          
          <button 
            v-if="episodes && episodes.length > 0"
            @click="deleteAllEpisodes"
            class="rounded-md bg-red-900/80 border border-red-700 px-3 py-2 text-sm text-red-100 hover:bg-red-800 transition"
          >
            🗑 全て削除
          </button>

          <button 
            @click="showQuickAdd = true"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            クイック追加 (Quick Add)
          </button>

          <NuxtLink :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes/new`" class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">
            + 追加
          </NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="py-12 text-center text-zinc-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
        <p>Loading...</p>
      </div>
      
      <div v-else>
        <div v-if="!episodes || episodes.length === 0" class="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-500">
          <p class="text-lg mb-2">📭 エピソードがありません</p>
        </div>

        <div v-else class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
          <table class="w-full text-left text-sm text-zinc-400">
            <thead class="bg-zinc-950 text-zinc-200 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-3 text-center w-16">#</th>
                <th class="px-4 py-3">タイトル</th>
                <th class="px-4 py-3">動画パス (M3U8)</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr v-for="ep in episodes" :key="ep.id" class="hover:bg-zinc-800/50 transition-colors group">
                <td class="px-4 py-3 text-center font-bold text-white bg-zinc-900/50">{{ ep.episode_number }}</td>
                <td class="px-4 py-3 font-medium text-zinc-200">{{ ep.title }}</td>
                
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 max-w-md">
                    <div 
                      class="font-mono text-xs text-emerald-500/80 bg-black/30 px-2 py-1 rounded select-all truncate flex-1 min-w-0" 
                      :title="ep.video_path || ''"
                    >
                      {{ ep.video_path }}
                    </div>
                    
                    <div v-if="ep.subtitles && ep.subtitles.length > 0" class="flex gap-1 shrink-0">
                      <span 
                        v-for="(sub, sIdx) in ep.subtitles" 
                        :key="sIdx" 
                        class="text-[10px] font-bold bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-900/50 uppercase tracking-wider"
                      >
                        {{ sub.lang || 'sub' }}
                      </span>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <NuxtLink 
                      :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes/${ep.id}`" 
                      class="px-2 py-1 rounded hover:bg-indigo-900/30 text-indigo-400 hover:text-indigo-300 transition"
                    >
                      編集
                    </NuxtLink>
                    <button 
                      @click="deleteEpisode(ep.id)"
                      class="px-2 py-1 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- QUICK ADD MODAL -->
    <BaseModal 
      v-model="showQuickAdd" 
      title="エピソード一括追加 (Quick Add)"
      widthClass="max-w-6xl"
    >
      <div class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        
        <!-- GENERATOR TOOLS -->
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div class="flex justify-between items-center mb-4 border-b border-zinc-700 pb-2">
            <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Generator Tools</h4>
            <div class="flex gap-2">
              <button @click="applyQuickPattern" title="Sử dụng Pattern mẫu" class="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded text-[10px] text-emerald-400 font-bold transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                自動入力 (Quick Fill)
              </button>
              <button @click="showPatternSettings = !showPatternSettings" title="Cài đặt Pattern" class="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-1 rounded text-zinc-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>

          <div v-if="showPatternSettings" class="mb-4 bg-black/40 border border-zinc-700 rounded-lg p-3 space-y-3 animate-fade-in">
            <p class="text-[10px] text-zinc-400">※ Cài đặt này được lưu trữ tự động trên thiết bị. Hỗ trợ biến: <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{slug}</code> và <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{n}</code>.</p>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Video Pattern</label>
              <input v-model="savedVideoPattern" @change="savePatternsToLocal" type="text" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Subtitle Pattern</label>
              <input v-model="savedSubPattern" @change="savePatternsToLocal" type="text" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-yellow-400 focus:border-yellow-500 outline-none" />
            </div>
          </div>

          <div class="flex gap-4 mb-4">
            <button 
              @click="activeGenTab = 'video'" 
              class="text-xs font-bold px-3 py-1.5 rounded transition"
              :class="activeGenTab === 'video' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'"
            >
              Video Links
            </button>
            <button 
              @click="activeGenTab = 'sub'" 
              class="text-xs font-bold px-3 py-1.5 rounded transition"
              :class="activeGenTab === 'sub' ? 'bg-yellow-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'"
            >
              Subtitle Links
            </button>
          </div>

          <div class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-12 md:col-span-8">
              <label class="block text-[10px] text-zinc-500 mb-1 uppercase">Link Pattern</label>
              <input 
                v-model="genConfig.pattern" 
                type="text" 
                class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono focus:border-emerald-500 outline-none transition-colors"
                :class="activeGenTab === 'video' ? 'text-emerald-400' : 'text-yellow-400'"
                :placeholder="activeGenTab === 'video' ? 'https://host.com/ep{n}.m3u8' : 'https://host.com/ep{n}.vtt'"
              />
              <p class="text-[9px] text-zinc-600 mt-1">
                Sử dụng <code>{n}</code> cho số tập. Ví dụ: <code>.../ep{n}.m3u8</code>
              </p>
            </div>

            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">Start Ep</label>
              <input v-model.number="genConfig.start" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">End Ep</label>
              <input v-model.number="genConfig.end" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>

            <div class="col-span-12 border-t border-zinc-800 my-2"></div>

            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Prefix</label>
                  <button type="button" @click="genConfig.titlePrefix = '第'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700" title="Click to use">第</button>
               </div>
               <input v-model="genConfig.titlePrefix" type="text" placeholder="e.g. 第" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>

            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Suffix</label>
                  <button type="button" @click="genConfig.titleSuffix = '話'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700" title="Click to use">話</button>
               </div>
               <input v-model="genConfig.titleSuffix" type="text" placeholder="e.g. 話" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>

            <div class="col-span-12 md:col-span-4">
              <button 
                type="button"
                @click="runGenerator"
                class="w-full py-1.5 rounded text-xs font-bold text-white transition border shadow-lg flex items-center justify-center gap-1 h-[34px]"
                :class="activeGenTab === 'video' ? 'bg-emerald-700 border-emerald-600 hover:bg-emerald-600' : 'bg-yellow-700 border-yellow-600 hover:bg-yellow-600'"
              >
                <span>Generate Links</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- PREVIEW BẢNG ĐỂ CHỈNH SỬA TẬP PHIM -->
        <div class="border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden mt-6">
          <div class="flex justify-between items-center p-3 bg-zinc-950 border-b border-zinc-800">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Preview & Edit</h4>
            <button @click="addManualRow" type="button" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded border border-zinc-700 transition flex items-center gap-1">
              <span>+</span> 手動で行を追加 (Add Row)
            </button>
          </div>
          
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
             <table class="w-full text-left text-xs text-zinc-400 min-w-[800px]">
               <thead class="bg-zinc-950/80 text-zinc-300 sticky top-0 z-10 shadow-sm backdrop-blur">
                 <tr>
                   <th class="px-2 py-2 w-16 text-center border-b border-zinc-800">Ep</th>
                   <th class="px-2 py-2 w-1/4 border-b border-zinc-800">Title</th>
                   <th class="px-2 py-2 border-b border-zinc-800">Video URL</th>
                   <th class="px-2 py-2 border-b border-zinc-800">Sub URL</th>
                   <th class="px-2 py-2 w-28 text-center border-b border-zinc-800">操作</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-zinc-800">
                 <tr v-if="previewList.length === 0">
                   <td colspan="5" class="px-4 py-12 text-center text-zinc-600 italic">
                     Generatorでリンクを生成するか、行を手動で追加してください。<br/>(Bấm Generate Links để tự sinh hoặc Add Row để thêm thủ công)
                   </td>
                 </tr>
                 <tr v-for="(item, idx) in previewList" :key="item.id" class="hover:bg-zinc-800/30 transition-colors">
                   <td class="px-2 py-2">
                      <input v-model.number="item.epNum" type="number" step="0.1" class="bg-zinc-950 border border-zinc-700 w-full text-center font-bold text-zinc-300 focus:text-white focus:border-emerald-500 rounded px-1 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.title" class="bg-zinc-950 border border-zinc-700 w-full text-zinc-300 focus:text-white focus:border-emerald-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.video" placeholder="https://..." class="bg-zinc-950 border border-zinc-700 w-full font-mono text-[10px] text-emerald-500 focus:border-emerald-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.sub" placeholder="https://..." class="bg-zinc-950 border border-zinc-700 w-full font-mono text-[10px] text-yellow-500 focus:border-yellow-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2 text-center">
                     <div class="flex items-center justify-center gap-1">
                        <button type="button" @click="moveUp(idx)" :disabled="idx === 0" class="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition">▲</button>
                        <button type="button" @click="moveDown(idx)" :disabled="idx === previewList.length - 1" class="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition">▼</button>
                        <button type="button" @click="insertAfter(idx)" class="p-1 rounded text-emerald-500 hover:text-white hover:bg-emerald-700 transition" title="下に挿入 (Insert)">＋</button>
                        <button type="button" @click="removeRow(idx)" class="p-1 rounded text-red-500 hover:text-white hover:bg-red-700 transition" title="削除 (Delete)">✕</button>
                     </div>
                   </td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
           <div class="text-xs text-zinc-500">
             <button type="button" @click="clearForm" class="text-red-400 hover:text-red-300 transition flex items-center gap-1 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                全てクリア (Clear All)
             </button>
           </div>
          <div class="flex gap-3">
            <button type="button" @click="showQuickAdd = false" class="px-5 py-2.5 rounded text-xs font-bold text-zinc-400 hover:text-white transition">キャンセル</button>
            <button 
              @click="saveBulk" 
              :disabled="previewList.length === 0 || isSaving"
              class="px-8 py-2.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-lg shadow-emerald-900/20"
            >
              <span v-if="isSaving" class="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></span>
              保存する (Save {{ previewList.length }} eps)
            </button>
          </div>
        </div>

      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

// --- TYPES ---
type Episode = {
  id: number
  episode_number: number
  title: string | null
  video_path: string | null
  collection_id: number
  subtitles: any[]
}

type PreviewItem = { 
  id: number; 
  epNum: number; 
  title: string; 
  video: string; 
  sub: string 
}

// --- SETUP ---
const route = useRoute()
// 1. Thêm <any> vào đây nếu file hiện tại chưa có
const supabase = useSupabaseClient<any>() 
const seriesId = route.params.id as string
const collectionId = route.params.collectionId as string

// 2. Ép kiểu rõ ràng cho block lấy Slug
const { data: seriesData } = await useAsyncData<{ slug: string } | null>(
  `series-slug-${seriesId}`, 
  async () => {
    const { data } = await supabase.from('series').select('slug').eq('id', seriesId).single()
    return data as any // Ép kiểu để bypass lỗi SelectQueryError
  }
)
const seriesSlug = computed(() => seriesData.value?.slug || '')

// --- FETCH DATA ---
const { data: episodes, pending, refresh } = await useAsyncData<Episode[]>(
  `admin-episodes-${collectionId}`,
  async () => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('collection_id', collectionId)
      .order('episode_number', { ascending: true }) 
    if (error) throw error
    return (data as unknown as Episode[]) || []
  }
)

// --- DELETE ACTIONS ---
const deleteEpisode = async (id: number) => {
  if (!confirm('このエピソードを削除してもよろしいですか？')) return
  try {
    const { error } = await supabase.from('episodes').delete().eq('id', id)
    if (error) throw error
    refresh()
  } catch (e: any) { alert(e.message) }
}

const deleteAllEpisodes = async () => {
  if (!confirm(`全エピソードを削除しますか？`)) return
  try {
    const { error } = await supabase.from('episodes').delete().eq('collection_id', collectionId)
    if (error) throw error
    refresh()
  } catch (e: any) { alert(e.message) }
}

// =========================================================
//  QUICK BULK ADD LOGIC KÈM BẢNG PREVIEW
// =========================================================
const showQuickAdd = ref(false)
const isSaving = ref(false)
const activeGenTab = ref<'video' | 'sub'>('video')
const previewList = ref<PreviewItem[]>([])

const genConfig = reactive({
  pattern: '',
  start: 1,
  end: 12,
  titlePrefix: '', 
  titleSuffix: ''
})

// === CÀI ĐẶT QUẢN LÝ PATTERN (LOCAL STORAGE) ===
const showPatternSettings = ref(false)
const savedVideoPattern = ref('')
const savedSubPattern = ref('')

onMounted(() => {
  if (import.meta.client) {
    savedVideoPattern.value = localStorage.getItem('defaultVideoPattern') || ''
    savedSubPattern.value = localStorage.getItem('defaultSubPattern') || ''
    genConfig.titlePrefix = localStorage.getItem('genTitlePrefix') ?? ''
    genConfig.titleSuffix = localStorage.getItem('genTitleSuffix') ?? ''
  }
})

const savePatternsToLocal = () => {
  if (import.meta.client) {
    localStorage.setItem('defaultVideoPattern', savedVideoPattern.value)
    localStorage.setItem('defaultSubPattern', savedSubPattern.value)
  }
}

watch(() => genConfig.titlePrefix, (newVal) => {
  if (import.meta.client) localStorage.setItem('genTitlePrefix', newVal)
})

watch(() => genConfig.titleSuffix, (newVal) => {
  if (import.meta.client) localStorage.setItem('genTitleSuffix', newVal)
})

const applyQuickPattern = () => {
  const template = activeGenTab.value === 'video' ? savedVideoPattern.value : savedSubPattern.value
  if (!template) {
    alert('Vui lòng cài đặt Default Pattern trong mục Bánh răng trước nhé!')
    return
  }
  genConfig.pattern = template.replace(/{slug}/g, seriesSlug.value)
}

// Clear Form
const clearForm = () => {
  if (!confirm('フォームの内容を全てクリアしますか？(Are you sure to clear all?)')) return
  genConfig.pattern = ''
  genConfig.start = 1
  genConfig.end = 12
  previewList.value = []
}

// === TẠO VÀ CHỈNH SỬA TABLE PREVIEW ===
const runGenerator = () => {
  if (!genConfig.pattern) return
  
  for (let i = genConfig.start; i <= genConfig.end; i++) {
    const url = genConfig.pattern.replace(/{n}/g, String(i))
    const title = `${genConfig.titlePrefix}${i}${genConfig.titleSuffix}`

    const existing = previewList.value.find(item => item.epNum === i)
    if (existing) {
       if (activeGenTab.value === 'video') existing.video = url
       if (activeGenTab.value === 'sub') existing.sub = url
       if (!existing.title) existing.title = title
    } else {
       previewList.value.push({
         id: Date.now() + Math.random(),
         epNum: i,
         title: title,
         video: activeGenTab.value === 'video' ? url : '',
         sub: activeGenTab.value === 'sub' ? url : ''
       })
    }
  }
  previewList.value.sort((a, b) => a.epNum - b.epNum)
}

const moveUp = (idx: number) => {
    if (idx > 0) {
        const temp = previewList.value[idx]!
        previewList.value[idx] = previewList.value[idx - 1]!
        previewList.value[idx - 1] = temp
    }
}

const moveDown = (idx: number) => {
    if (idx < previewList.value.length - 1) {
        const temp = previewList.value[idx]!
        previewList.value[idx] = previewList.value[idx + 1]!
        previewList.value[idx + 1] = temp
    }
}

const insertAfter = (idx: number) => {
    const currentEp = previewList.value[idx]!.epNum
    previewList.value.splice(idx + 1, 0, {
        id: Date.now() + Math.random(),
        epNum: currentEp + 0.1, 
        title: '',
        video: '',
        sub: ''
    })
}

const removeRow = (idx: number) => {
    previewList.value.splice(idx, 1)
}

const addManualRow = () => {
    let nextEp = 1
    if (previewList.value.length > 0) {
        const lastItem = previewList.value[previewList.value.length - 1]!
        nextEp = Math.floor(lastItem.epNum) + 1
    } else if (episodes.value && episodes.value.length > 0) {
        const lastEp = episodes.value[episodes.value.length - 1]!
        nextEp = Math.floor(Number(lastEp.episode_number)) + 1
    }
    previewList.value.push({
        id: Date.now() + Math.random(),
        epNum: nextEp,
        title: `${genConfig.titlePrefix}${nextEp}${genConfig.titleSuffix}`,
        video: '',
        sub: ''
    })
}

// === LƯU XUỐNG DATABASE ===
const saveBulk = async () => {
  if (previewList.value.length === 0) return
  isSaving.value = true
  
  try {
    const payload = previewList.value.map(item => {
      const subtitles = []
      if (item.sub) {
        subtitles.push({ src: item.sub, label: 'Japanese', lang: 'ja' })
      }
      return {
        series_id: Number(seriesId),
        collection_id: Number(collectionId),
        episode_number: item.epNum,
        title: item.title,
        video_path: item.video,
        subtitles: subtitles, 
        duration_minutes: 0
      }
    })

    const { error } = await supabase.from('episodes').insert(payload)
    if (error) throw error

    // Success
    showQuickAdd.value = false
    previewList.value = []
    refresh()
    alert(`${payload.length} 件のエピソードを追加しました`)

  } catch (e: any) {
    alert('Save Error: ' + e.message)
  } finally {
    isSaving.value = false
  }
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>