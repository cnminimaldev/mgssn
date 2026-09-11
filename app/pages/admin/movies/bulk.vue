<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/admin/movies" class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            映画一覧に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">映画一括登録</h1>
          <p class="text-xs text-zinc-500 mt-1">.txt ファイルをアップロードするか、テキストを貼り付けてください。</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-white uppercase tracking-wider">データ入力</h2>
              <label class="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 text-xs rounded transition flex items-center gap-2 border border-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                .txt 読み込み
                <input type="file" accept=".txt" class="hidden" @change="handleFileUpload" />
              </label>
            </div>
            
            <textarea 
              v-model="rawText" 
              rows="15" 
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-zinc-300 font-mono custom-scrollbar"
              placeholder="[title]&#10;映画のタイトル&#10;&#10;[kana_title]&#10;えいがのたいとる&#10;..."
              :disabled="isProcessing"
            ></textarea>

            <button 
              @click="startImport" 
              :disabled="isProcessing || !rawText.trim()"
              class="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!isProcessing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span v-else class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isProcessing ? '処理中...' : 'インポート開始' }}
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6 h-full flex flex-col">
            <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">進捗状況</h2>
            
            <div class="mb-6">
              <div class="flex justify-between items-end text-xs text-zinc-400 mb-2">
                <span>Total: {{ totalItems }}</span>
                <span class="flex items-center gap-2">
                  <span>Success: <span class="text-emerald-400 font-bold">{{ successCount }}</span></span>
                  <span class="text-zinc-700">|</span>
                  
                  <span>
                    Warning: 
                    <button 
                      type="button" 
                      @click="showWarningList = !showWarningList"
                      :disabled="warningCount === 0"
                      class="font-bold transition-colors"
                      :class="warningCount > 0 ? 'text-yellow-400 hover:text-yellow-300 hover:underline cursor-pointer' : 'text-zinc-600 cursor-default'"
                    >
                      {{ warningCount }}
                    </button>
                  </span>
                  <span class="text-zinc-700">|</span>
                  
                  <span>
                    Error: 
                    <button 
                      type="button"
                      @click="showErrorList = !showErrorList"
                      :disabled="errorCount === 0"
                      class="font-bold transition-colors"
                      :class="errorCount > 0 ? 'text-red-400 hover:text-red-300 hover:underline cursor-pointer' : 'text-zinc-600 cursor-default'"
                    >
                      {{ errorCount }}
                    </button>
                  </span>
                </span>
              </div>
              
              <div class="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div class="bg-emerald-500 h-3 transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <p class="text-center text-xs text-zinc-500 mt-2">{{ currentItem }} / {{ totalItems }}</p>

              <div v-if="showWarningList && warningTitles.length > 0" class="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs animate-fade-in">
                <div class="flex justify-between items-center mb-2 border-b border-yellow-500/20 pb-1">
                  <strong class="text-yellow-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    警告
                  </strong>
                  <button @click="showWarningList = false" class="text-zinc-500 hover:text-white transition-colors">&times;</button>
                </div>
                <ul class="list-disc pl-5 text-zinc-300 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  <li v-for="(t, i) in warningTitles" :key="i">{{ t }}</li>
                </ul>
              </div>

              <div v-if="showErrorList && errorTitles.length > 0" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs animate-fade-in">
                <div class="flex justify-between items-center mb-2 border-b border-red-500/20 pb-1">
                  <strong class="text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    エラー
                  </strong>
                  <button @click="showErrorList = false" class="text-zinc-500 hover:text-white transition-colors">&times;</button>
                </div>
                <ul class="list-disc pl-5 text-zinc-300 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  <li v-for="(t, i) in errorTitles" :key="i">{{ t }}</li>
                </ul>
              </div>
            </div>

            <h2 class="text-xs font-bold text-zinc-400 mb-2 border-b border-white/5 pb-1">処理ログ</h2>
            <div class="flex-1 overflow-y-auto bg-black border border-zinc-700 rounded p-3 text-xs font-mono space-y-1 custom-scrollbar min-h-[250px] max-h-[400px]">
              <div v-if="logs.length === 0" class="text-zinc-600">待機中...</div>
              <div 
                v-for="(log, idx) in logs" 
                :key="idx" 
                :class="{
                  'text-red-400': log.type === 'error',
                  'text-emerald-400': log.type === 'success',
                  'text-yellow-400': log.type === 'warning',
                  'text-zinc-400': log.type === 'info'
                }"
              >
                <span class="text-zinc-600">[{{ log.time }}]</span> {{ log.msg }}
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

definePageMeta({ middleware: 'admin' })
const supabase = useSupabaseClient<any>()

// State
const rawText = ref('')
const isProcessing = ref(false)
const totalItems = ref(0)
const currentItem = ref(0)
const successCount = ref(0)
const errorCount = ref(0)
const warningCount = ref(0)
const warningTitles = ref<string[]>([])
const errorTitles = ref<string[]>([])
const showWarningList = ref(false)
const showErrorList = ref(false)
const logs = ref<{ time: string, msg: string, type: 'info' | 'success' | 'error' | 'warning' }[]>([])
const genresList = ref<any[]>([])

const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((currentItem.value / totalItems.value) * 100)
})

const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const time = new Date().toLocaleTimeString('ja-JP', { hour12: false })
  logs.value.unshift({ time, msg, type }) 
}

onMounted(async () => {
  const { data } = await supabase.from('genres').select('id, name, name_ja')
  if (data) genresList.value = data
})

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const file = input.files[0]
  if (!file) return 

  const reader = new FileReader()
  reader.onload = (e) => {
    rawText.value = (e.target?.result as string) || ''
    addLog(`ファイル読み込み完了: ${file.name}`, 'info')
  }
  reader.readAsText(file)
}

const extractField = (text: string, tag: string) => {
  const regex = new RegExp(`\\[${tag}\\]\\s*\\n(.*?)(?=\\n\\s*\\[|$)`, 'is')
  const match = text.match(regex)
  return (match && match[1]) ? match[1].trim() : ''
}

const syncCrewBulk = async (movieId: number, crewString: string, role: string) => {
  if (!crewString) return []
  const names = crewString.split(',').map(n => n.trim()).filter(Boolean)
  const toLink = []
  
  for (const name of names) {
    let personId = null
    const { data: pData } = await supabase
      .from('persons')
      .upsert({ name: name }, { onConflict: 'name' })
      .select('id').single()
      
    if (pData) {
      toLink.push({ content_id: movieId, person_id: pData.id, type: 'movie', role: role })
    }
  }
  return toLink
}

const startImport = async () => {
  if (isProcessing.value) return
  
  let sanitizedText = rawText.value
    .replace(/```[a-zA-Z]*\n?/g, '') 
    .replace(/```\n?/g, '')          
    .trim()

  const blocks = sanitizedText.split(/(?=\[title\])/i).filter(b => b.trim().length > 10)
  
  if (blocks.length === 0) {
    addLog('有効なデータが見つかりません。[title]タグを確認してください。', 'error')
    return
  }

  isProcessing.value = true
  totalItems.value = blocks.length
  currentItem.value = 0
  successCount.value = 0
  errorCount.value = 0
  warningCount.value = 0      
  warningTitles.value = []    
  errorTitles.value = []      
  showWarningList.value = false 
  showErrorList.value = false   
  logs.value = []
  
  addLog(`一括登録を開始します。全 ${totalItems.value} 件`, 'info')

  for (let i = 0; i < blocks.length; i++) {
    currentItem.value = i + 1
    const block = blocks[i]

    if (!block) continue
    
    const title = extractField(block, 'title') || `Untitled-${Date.now()}`
    const slug = extractField(block, 'slug') || `movie-${Date.now()}-${i}`
    addLog(`処理中: ${title}`, 'info')

    try {
      let releaseDate = null
      const dateRaw = extractField(block, 'date')
      if (dateRaw) {
        const d = new Date(dateRaw)
        if (!isNaN(d.getTime())) releaseDate = d.toISOString().split('T')[0]
      }

      const insertData = {
        is_public: false, 
        title: title,
        original_title: extractField(block, 'original_title'),
        title_kana: extractField(block, 'kana_title'),
        slug: slug,
        description: extractField(block, 'description'),
        year: parseInt(extractField(block, 'year')) || new Date().getFullYear(),
        duration_minutes: parseInt(extractField(block, 'duration')) || 0,
        origin_country: extractField(block, 'country') || 'JP',
        release_date: releaseDate,
        created_at: new Date(),
        updated_at: new Date(),
      }

      let movieId = null;
      const { data: newVal, error: insertError } = await supabase
        .from('movies')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505' || insertError.message.includes('movies_slug_key')) {
          
          insertData.slug = `${slug}-2` 
          addLog(`警告: スラッグ重複を回避するため「${insertData.slug}」に変更しました`, 'warning')

          warningCount.value++
          warningTitles.value.push(title)
          
          const { data: retryVal, error: retryError } = await supabase
            .from('movies')
            .insert(insertData)
            .select()
            .single()
            
          if (retryError) throw retryError 
          movieId = retryVal.id
          
        } else {
          throw insertError 
        }
      } else {
        movieId = newVal.id
      }

      // CHÈN THỂ LOẠI (GENRES) ĐÃ ĐƯỢC BỔ SUNG LẠI
      const genresRaw = extractField(block, 'genres')
      if (genresRaw) {
        const genreNames = genresRaw.split(',').map(g => g.trim().toLowerCase())
        const matchedIds: number[] = []
        
        for (const gName of genreNames) {
          const found = genresList.value.find(g => 
            g.name.toLowerCase() === gName || (g.name_ja && g.name_ja.toLowerCase() === gName)
          )
          if (found) matchedIds.push(found.id)
        }
        
        if (matchedIds.length > 0) {
          const genreInserts = matchedIds.map(gid => ({ movie_id: movieId, genre_id: gid }))
          const { error: genreError } = await supabase.from('movie_genres').insert(genreInserts)
          if (genreError) {
            addLog(`警告 [${title}]: ジャンルの登録に失敗しました`, 'warning')
          }
        }
      }

      // CHÈN ĐẠO DIỄN VÀ DIỄN VIÊN
      const directorLinks = await syncCrewBulk(movieId, extractField(block, 'director'), 'director')
      const castLinks = await syncCrewBulk(movieId, extractField(block, 'main_cast'), 'cast')
      const allCrewLinks = [...directorLinks, ...castLinks]
      
      if (allCrewLinks.length > 0) {
        await supabase.from('content_crew').insert(allCrewLinks)
      }

      successCount.value++
      addLog(`成功: ${title} (ID:${movieId})`, 'success')

    } catch (e: any) {
      errorCount.value++
      errorTitles.value.push(title)
      addLog(`エラー [${title}]: ${e.message}`, 'error')
    }
  }

  isProcessing.value = false
  addLog('一括登録が完了しました！', 'info')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
</style>