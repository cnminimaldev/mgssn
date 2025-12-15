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

    <BaseModal 
      v-model="showQuickAdd" 
      title="エピソード一括追加 (Quick Add)"
      widthClass="max-w-6xl"
    >
      <div class="space-y-6">
        
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <h4 class="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">Generator Tools</h4>
          
          <div class="flex gap-4 mb-4 border-b border-zinc-700 pb-2">
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

            <div class="col-span-12 md:col-span-12 border-t border-zinc-800 my-2"></div>

            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Prefix</label>
                  <button @click="genConfig.titlePrefix = '第'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700" title="Click to use">第</button>
               </div>
               <input v-model="genConfig.titlePrefix" type="text" placeholder="e.g. 第, Episode..." class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>

            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Suffix</label>
                  <button @click="genConfig.titleSuffix = '話'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700" title="Click to use">話</button>
               </div>
               <input v-model="genConfig.titleSuffix" type="text" placeholder="e.g. 話" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>

            <div class="col-span-12 md:col-span-4">
              <button 
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-zinc-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Video Links (1 line/link)
              </label>
              <button @click="videoInput = ''" class="text-[10px] text-zinc-500 hover:text-red-400 hover:underline">Clear</button>
            </div>
            <div class="relative">
              <textarea 
                v-model="videoInput" 
                rows="8" 
                class="w-full bg-black border border-zinc-700 rounded-lg p-3 text-[11px] font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none whitespace-pre leading-relaxed"
                placeholder="https://server.com/ep1.m3u8&#10;https://server.com/ep2.m3u8"
              ></textarea>
              <div class="absolute bottom-2 right-3 text-[10px] text-zinc-600 bg-black/80 px-1 rounded">
                {{ videoLineCount }} lines
              </div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-zinc-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Subtitle Links (Optional)
              </label>
              <button @click="subInput = ''" class="text-[10px] text-zinc-500 hover:text-red-400 hover:underline">Clear</button>
            </div>
             <div class="relative">
              <textarea 
                v-model="subInput" 
                rows="8" 
                class="w-full bg-black border border-zinc-700 rounded-lg p-3 text-[11px] font-mono text-yellow-400 focus:border-yellow-500 outline-none resize-none whitespace-pre leading-relaxed"
                placeholder="https://server.com/ep1.vtt&#10;https://server.com/ep2.vtt"
              ></textarea>
               <div class="absolute bottom-2 right-3 text-[10px] text-zinc-600 bg-black/80 px-1 rounded">
                <span :class="{'text-red-500 font-bold': subLineCount > 0 && subLineCount !== videoLineCount}">
                  {{ subLineCount }}
                </span> lines
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-zinc-800 pt-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-zinc-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview & Save
            </h3>
            <button @click="addManualRow" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded border border-zinc-700 transition flex items-center gap-1">
              <span>+</span> 手動で行を追加 (Add Row)
            </button>
          </div>
          
          <div class="border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden max-h-[300px] overflow-y-auto">
             <table class="w-full text-left text-xs text-zinc-400">
               <thead class="bg-zinc-950 text-zinc-300 sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th class="px-3 py-2 w-12 text-center border-b border-zinc-800">Ep</th>
                   <th class="px-3 py-2 w-1/4 border-b border-zinc-800">Title ({{ genConfig.titlePrefix }}{n}{{ genConfig.titleSuffix }})</th>
                   <th class="px-3 py-2 border-b border-zinc-800">Video URL</th>
                   <th class="px-3 py-2 border-b border-zinc-800">Sub URL</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-zinc-800">
                 <tr v-if="previewList.length === 0">
                   <td colspan="4" class="px-4 py-12 text-center text-zinc-600 italic">
                     Generate links or type in textareas to preview
                   </td>
                 </tr>
                 <tr v-for="(item, idx) in previewList" :key="idx" class="hover:bg-zinc-800/30 transition-colors">
                   <td class="px-3 py-2 text-center font-mono text-zinc-500">{{ item.epNum }}</td>
                   <td class="px-3 py-2">
                      <input v-model="item.title" class="bg-transparent w-full text-zinc-300 focus:text-white outline-none border-b border-transparent focus:border-zinc-600 transition-colors" />
                   </td>
                   <td class="px-3 py-2 font-mono text-emerald-500 truncate max-w-[200px]" :title="item.video">
                     {{ item.video }}
                   </td>
                   <td class="px-3 py-2 font-mono text-yellow-500 truncate max-w-[200px]" :title="item.sub">
                     {{ item.sub }}
                   </td>
                 </tr>
               </tbody>
             </table>
          </div>

          <div v-if="errorMsg" class="mt-3 text-xs text-red-400 font-bold bg-red-900/10 p-3 rounded border border-red-900/30 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            {{ errorMsg }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button 
            @click="clearForm"
            class="px-4 py-2.5 rounded text-xs font-bold text-red-400 hover:bg-red-900/20 hover:text-red-300 transition flex items-center gap-1.5 group"
            title="Reset form data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 group-hover:scale-110 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            全てクリア (Clear Form)
          </button>

          <div class="flex gap-3">
            <button @click="showQuickAdd = false" class="px-5 py-2.5 rounded text-xs font-bold text-zinc-400 hover:text-white transition">キャンセル</button>
            <button 
              @click="saveBulk" 
              :disabled="!!errorMsg || previewList.length === 0 || isSaving"
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
import { ref, reactive, computed } from 'vue'
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

// --- SETUP ---
const route = useRoute()
const supabase = useSupabaseClient()
const seriesId = route.params.id as string
const collectionId = route.params.collectionId as string

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
//  QUICK BULK ADD LOGIC
// =========================================================
const showQuickAdd = ref(false)
const isSaving = ref(false)
const activeGenTab = ref<'video' | 'sub'>('video')
const videoInput = ref('')
const subInput = ref('')

const genConfig = reactive({
  pattern: '',
  start: 1,
  end: 12,
  titlePrefix: '', 
  titleSuffix: ''
})

// Generator Function
const runGenerator = () => {
  if (!genConfig.pattern) return
  
  const links: string[] = []
  for (let i = genConfig.start; i <= genConfig.end; i++) {
    links.push(genConfig.pattern.replace('{n}', String(i)))
  }
  
  const textToAppend = links.join('\n')
  
  if (activeGenTab.value === 'video') {
    videoInput.value = videoInput.value ? videoInput.value + '\n' + textToAppend : textToAppend
  } else {
    subInput.value = subInput.value ? subInput.value + '\n' + textToAppend : textToAppend
  }
}

// Clear Form Function
const clearForm = () => {
  if (!confirm('フォームの内容を全てクリアしますか？(Are you sure to clear all?)')) return
  genConfig.pattern = ''
  genConfig.start = 1
  genConfig.end = 12
  genConfig.titlePrefix = ''
  genConfig.titleSuffix = ''
  videoInput.value = ''
  subInput.value = ''
}

// Computed Lines
const videoLineCount = computed(() => videoInput.value.split('\n').filter(l => l.trim()).length)
const subLineCount = computed(() => subInput.value.split('\n').filter(l => l.trim()).length)

// Preview List Logic
const previewList = computed(() => {
  const vLines = videoInput.value.split('\n').filter(l => l.trim())
  const sLines = subInput.value.split('\n').filter(l => l.trim())
  
  // Xác định số tập tiếp theo dựa trên tập cuối cùng hiện có
  let startEpNum = 1
  if (episodes.value && episodes.value.length > 0) {
    const lastEp = episodes.value[episodes.value.length - 1]
    if (lastEp) startEpNum = Number(lastEp.episode_number) + 1
  }

  // Map ra object
  return vLines.map((vUrl, idx) => {
    const currentNum = startEpNum + idx
    const title = `${genConfig.titlePrefix}${currentNum}${genConfig.titleSuffix}`
    
    return {
      epNum: currentNum,
      title: title,
      video: vUrl,
      sub: sLines[idx] || ''
    }
  })
})

// Add Manual Row
const addManualRow = () => {
  videoInput.value += '\n'
  if (subInput.value) subInput.value += '\n'
}

// Validation
const errorMsg = computed(() => {
  if (subLineCount.value > 0 && subLineCount.value !== videoLineCount.value) {
    return `字幕リンク数 (${subLineCount.value}) と動画リンク数 (${videoLineCount.value}) が一致しません！`
  }
  return ''
})

// Save
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
        subtitles: subtitles, // JSONB
        duration_minutes: 0
      }
    })

    const { error } = await supabase.from('episodes').insert(payload)
    if (error) throw error

    // Success
    showQuickAdd.value = false
    videoInput.value = ''
    subInput.value = ''
    refresh()
    alert(`${payload.length} 件のエピソードを追加しました`)

  } catch (e: any) {
    alert('Save Error: ' + e.message)
  } finally {
    isSaving.value = false
  }
}
</script>