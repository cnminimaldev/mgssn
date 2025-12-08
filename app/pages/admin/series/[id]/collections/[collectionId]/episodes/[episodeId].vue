<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">エピソード編集 (Edit Episode)</h1>
          <p class="text-sm text-zinc-400 mt-1">
            ID: {{ episodeId }}
          </p>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/admin/series/${seriesId}/collections/${collectionId}/episodes`" class="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 text-zinc-300 transition">
            &larr; 一覧に戻る
          </NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="py-10 text-center text-zinc-500">Loading...</div>
      <div v-else-if="!form.id" class="py-10 text-center text-red-400">エピソードが見つかりません。</div>

      <form v-else @submit.prevent="handleUpdate" class="space-y-8">
        
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 class="text-lg font-semibold text-emerald-400 border-b border-zinc-800 pb-2 mb-4">基本情報 (Basic Info)</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1.5">話数 (Ep No.)</label>
              <input v-model.number="form.episode_number" type="number" step="0.1" required class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white text-center font-bold" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1.5">時間 (Duration - Minutes)</label>
              <input v-model.number="form.duration_minutes" type="number" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white text-center" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1.5">タイトル (Title)</label>
            <input v-model="form.title" type="text" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" placeholder="例: 第1話 冒険の始まり" />
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1.5">動画パス (Video M3U8)</label>
            <input v-model="form.video_path" type="text" required class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" placeholder="https://..." />
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1.5">サムネイル (Thumbnail URL)</label>
            <input v-model="form.thumbnail_url" type="text" class="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-zinc-300" placeholder="https://..." />
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
            <h2 class="text-lg font-semibold text-yellow-400">字幕管理 (Subtitles)</h2>
            <button type="button" @click="addSubtitle" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded transition">
              + 追加
            </button>
          </div>

          <div v-if="form.subtitles.length === 0" class="text-center text-zinc-600 text-sm py-4 italic">
            字幕は登録されていません。
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(sub, index) in form.subtitles" 
              :key="index"
              class="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-black/40 p-3 rounded border border-zinc-800"
            >
              <div class="w-full sm:w-32">
                <input 
                  v-model="sub.label" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-yellow-500 outline-none"
                  placeholder="Label (Ex: 日本語)"
                />
              </div>

              <div class="w-full sm:w-20">
                <input 
                  v-model="sub.lang" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-center text-zinc-300 focus:border-yellow-500 outline-none"
                  placeholder="Lang (ja)"
                />
              </div>

              <div class="flex-1 w-full">
                <input 
                  v-model="sub.src" 
                  type="text" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono text-zinc-300 focus:border-yellow-500 outline-none"
                  placeholder="https://.../sub.vtt"
                />
              </div>

              <button 
                type="button" 
                @click="removeSubtitle(index)"
                class="text-zinc-500 hover:text-red-400 p-1 transition"
                title="削除"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button 
            type="submit" 
            :disabled="saving"
            class="rounded-md bg-emerald-600 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 transition transform active:scale-95"
          >
            <span v-if="saving" class="animate-spin mr-2">⏳</span>
            {{ saving ? '保存中...' : '変更を保存 (Save Changes)' }}
          </button>
        </div>

        <div v-if="saveError" class="mt-4 p-4 rounded bg-red-900/20 border border-red-800 text-red-200 text-sm">
          {{ saveError }}
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const router = useRouter()
// Dùng <any> để bypass lỗi type strict khi update JSON
const supabase = useSupabaseClient<any>()

const seriesId = route.params.id as string
const collectionId = route.params.collectionId as string
const episodeId = route.params.episodeId as string

// Types
type SubtitleItem = {
  src: string
  label: string
  lang: string
}

type EpisodeData = {
  id: number
  episode_number: number
  title: string | null
  video_path: string | null
  thumbnail_url: string | null
  duration_minutes: number | null
  subtitles: SubtitleItem[] | null // JSONB
}

// Form State
const form = reactive({
  id: 0,
  episode_number: 0,
  title: '',
  video_path: '',
  thumbnail_url: '',
  duration_minutes: 0,
  subtitles: [] as SubtitleItem[]
})

const saving = ref(false)
const saveError = ref('')

// 1. Fetch Data
const { pending } = await useAsyncData(
  `edit-episode-${episodeId}`,
  async () => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single()

    if (error) throw error
    if (data) {
      const ep = data as unknown as EpisodeData
      
      form.id = ep.id
      form.episode_number = ep.episode_number
      form.title = ep.title || ''
      form.video_path = ep.video_path || ''
      form.thumbnail_url = ep.thumbnail_url || ''
      form.duration_minutes = ep.duration_minutes || 0
      
      // Parse subtitles JSON safely
      // Nếu null hoặc không phải mảng thì gán mảng rỗng
      form.subtitles = Array.isArray(ep.subtitles) ? ep.subtitles : []
    }
    return true
  }
)

// 2. Subtitle Actions
const addSubtitle = () => {
  form.subtitles.push({
    src: '',
    label: '日本語', // Default label
    lang: 'ja'      // Default lang
  })
}

const removeSubtitle = (index: number) => {
  form.subtitles.splice(index, 1)
}

// 3. Update Logic
const handleUpdate = async () => {
  saving.value = true
  saveError.value = ''

  try {
    // Filter out empty subtitles
    const validSubtitles = form.subtitles.filter(sub => sub.src && sub.src.trim() !== '')

    const payload = {
      episode_number: form.episode_number,
      title: form.title,
      video_path: form.video_path,
      thumbnail_url: form.thumbnail_url || null,
      duration_minutes: form.duration_minutes,
      subtitles: validSubtitles // Supabase sẽ tự convert mảng object sang JSONB
    }

    const { error } = await supabase
      .from('episodes')
      .update(payload)
      .eq('id', episodeId)

    if (error) throw error

    alert('保存しました！')
    // Có thể redirect hoặc giữ nguyên trang
    // router.push(`/admin/series/${seriesId}/collections/${collectionId}/episodes`)
  } catch (e: any) {
    saveError.value = 'エラー: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>