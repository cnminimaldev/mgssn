<template>
  <div
    ref="containerRef"
    class="group relative w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-white/10 outline-none"
    tabindex="0"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
    @click="focusPlayer"
  >
    <div class="aspect-video w-full bg-black">
      <video
        ref="videoRef"
        class="h-full w-full bg-black cursor-pointer outline-none"
        :poster="poster"
        playsinline
        tabindex="-1"
        @click.stop="togglePlay"
      >
      </video>
    </div>

    <div
      v-if="isBuffering"
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-500"></div>
    </div>

    <div 
      v-if="!isPlaying && !isBuffering" 
      class="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300"
      @click.stop="togglePlay"
    >
      <button 
        class="group/btn flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm ring-1 ring-white/20 transition-transform hover:scale-110 hover:bg-emerald-500 hover:text-black hover:ring-emerald-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8 ml-1">
          <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div
      class="pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-300"
      :class="{ 'opacity-0': !showControls && isPlaying, 'opacity-100': showControls || !isPlaying }"
    >
      <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent"></div>
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent"></div>

      <div class="pointer-events-auto relative z-10 flex items-start justify-between px-4 pt-4">
        <h3 class="max-w-[70%] truncate text-sm font-medium text-white drop-shadow-md">
          {{ title }}
        </h3>
      </div>

      <div class="pointer-events-auto relative z-10 px-4 pb-4 pt-8">
        <div 
          class="group/progress relative mb-4 h-1.5 w-full cursor-pointer touch-none select-none rounded-full bg-white/20 hover:h-2 transition-all"
          @click="handleSeek"
          @mousedown="startDragging"
          @mousemove="handleDragging"
        >
          <div 
            class="absolute h-full rounded-full bg-white/30 transition-all duration-300" 
            :style="{ width: `${bufferedPercentage}%` }"
          ></div>
          <div 
            class="absolute h-full rounded-full bg-emerald-500 transition-all duration-100" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
          <div 
            class="absolute top-1/2 -mt-2 h-4 w-4 -translate-x-1/2 scale-0 rounded-full bg-white shadow-lg transition-transform group-hover/progress:scale-100"
            :style="{ left: `${progressPercentage}%` }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button class="text-white hover:text-emerald-400 transition-colors" @click.stop="togglePlay">
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
                <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
              </svg>
            </button>

            <div class="group/vol flex items-center gap-3">
              <button class="text-white hover:text-emerald-400 w-6 mr-1" @click.stop="toggleMute">
                <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                </svg>
                <svg v-else-if="volume < 0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a4.5 4.5 0 00-2.25-3.9.75.75 0 00-.75 1.3 3 3 0 010 5.2.75.75 0 10.75 1.3A4.5 4.5 0 0018.5 12zM20.5 12a6.5 6.5 0 00-3.25-5.63.75.75 0 10-.75 1.3 5 5 0 010 8.66.75.75 0 10.75 1.3A6.5 6.5 0 0020.5 12z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a4.5 4.5 0 00-2.25-3.9.75.75 0 00-.75 1.3 3 3 0 010 5.2.75.75 0 10.75 1.3A4.5 4.5 0 0018.5 12zM20.5 12a6.5 6.5 0 00-3.25-5.63.75.75 0 10-.75 1.3 5 5 0 010 8.66.75.75 0 10.75 1.3A6.5 6.5 0 0020.5 12z" />
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                v-model.number="volume"
                class="h-1 w-0 cursor-pointer appearance-none rounded-full bg-zinc-500 accent-emerald-400 transition-all group-hover/vol:w-20"
                @input="applyVolume"
                @click.stop
              />
            </div>

            <div class="text-xs text-zinc-300 font-mono">
              {{ formattedCurrentTime }} / {{ formattedDuration }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative">
              <button 
                class="text-white hover:text-emerald-400 transition-colors"
                @click.stop="toggleSettings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path fill-rule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.043.044a1.875 1.875 0 00-.204 2.415l.325.452c.16.223.18.52.064.796-.055.158-.12.317-.197.476a.798.798 0 01-.608.517l-.55.091a1.875 1.875 0 00-1.566 1.85v.02c0 .915.662 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.044.043a1.875 1.875 0 002.415.204l.452-.325a.798.798 0 01.796-.064c.158.055.317.12.476.197a.798.798 0 01.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.02c.916 0 1.699-.662 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.043-.044a1.875 1.875 0 00.204-2.415l-.325-.452a.798.798 0 01-.064-.796c.055-.158.12-.317.197-.476a.798.798 0 01.608-.517l.55-.091a1.875 1.875 0 001.566-1.85v-.02c0-.915-.662-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.044-.043a1.875 1.875 0 00-2.415-.204l-.452.325a.798.798 0 01-.796.064 7.462 7.462 0 00-.476-.197.798.798 0 01-.517-.608l-.091-.55a1.875 1.875 0 00-1.85-1.566h-.02zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clip-rule="evenodd" />
                </svg>
              </button>

              <div v-if="showSettings" class="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl bg-black/90 p-2 shadow-2xl ring-1 ring-white/10">
                <p class="mb-2 px-2 text-[10px] font-bold uppercase text-zinc-400">画質設定 (Quality)</p>
                <div class="space-y-1">
                   <button 
                    v-for="lvl in qualityLevels" 
                    :key="lvl.id"
                    class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-zinc-100 hover:bg-white/10"
                    @click.stop="changeQuality(lvl.id)"
                  >
                    <span>{{ lvl.label }}</span>
                    <span v-if="currentQuality === lvl.id" class="text-emerald-400">✓</span>
                  </button>
                </div>
              </div>
            </div>
            
            <button class="text-white hover:text-emerald-400 transition-colors" @click.stop="toggleFullscreen">
              <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                <path fill-rule="evenodd" d="M3.75 3.75v4.5c0 .414.336.75.75.75h.75a.75.75 0 01.75.75v.75c0 .414.336.75.75.75h4.5a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-.75a.75.75 0 01-.75-.75h-.75a.75.75 0 01-.75-.75v-4.5zM3.75 15.75c0-.414.336-.75.75-.75h.75a.75.75 0 01.75-.75v-.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75.75v.75a.75.75 0 01-.75.75h.75a.75.75 0 00.75.75v-4.5zM20.25 3.75v4.5c0 .414-.336.75-.75.75h-.75a.75.75 0 00-.75.75v.75c0 .414-.336.75-.75.75h-4.5a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-.75a.75.75 0 00.75-.75h.75a.75.75 0 00.75-.75v-4.5zM20.25 15.75c0-.414-.336-.75-.75-.75h-.75a.75.75 0 00-.75-.75v-.75a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h4.5a.75.75 0 00.75.75v.75a.75.75 0 00.75.75h.75a.75.75 0 00.75.75v-4.5z" clip-rule="evenodd" />
                 <path d="M15 3.75H20.25V9h-1.5V5.25H15V3.75zM3.75 3.75H9v1.5H5.25V9h-1.5V3.75zM3.75 20.25V15h1.5v3.75H9v1.5H3.75zM20.25 20.25h-5.25v-1.5H18.75V15h1.5v5.25z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                 <path d="M3.75 9h5.25V3.75h-1.5v3.75H3.75V9zM3.75 15v1.5h3.75v3.75h1.5V15H3.75zM15 20.25h1.5v-3.75h3.75V15H15v5.25zM20.25 9v-1.5h-3.75V3.75h-1.5V9h5.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Hls from 'hls.js'

const props = defineProps<{
  src: string
  poster?: string
  title?: string
  startTime?: number
}>()

const emit = defineEmits<{
  (e: 'timeupdate', payload: { currentTime: number; duration: number }): void
  (e: 'ended'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
let hls: Hls | null = null

// State
const isPlaying = ref(false)
const isBuffering = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const bufferedEnd = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const showSettings = ref(false)
let controlsTimeout: any = null
let isDragging = false

// Quality State
type QualityLevel = { id: number; label: string }
const qualityLevels = ref<QualityLevel[]>([])
const currentQuality = ref<number>(-1) // -1 = Auto

// Computed
const progressPercentage = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const bufferedPercentage = computed(() => {
  if (!duration.value) return 0
  return (bufferedEnd.value / duration.value) * 100
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

// Helper: Show controls temporary then hide
const showControlsTemporary = () => {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false
      showSettings.value = false
    }, 2500)
  }
}

// Logic: Init Player
const initPlayer = () => {
  const video = videoRef.value
  if (!video) return

  if (hls) {
    hls.destroy()
    hls = null
  }
  
  // Reset Quality
  qualityLevels.value = [{ id: -1, label: '自動 (Auto)' }]
  currentQuality.value = -1

  if (Hls.isSupported() && props.src.endsWith('.m3u8')) {
    hls = new Hls({ maxBufferLength: 30 })
    hls.loadSource(props.src)
    hls.attachMedia(video)
    
    // Auto play if startTime
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (props.startTime) video.currentTime = props.startTime
      // Get levels
      if (hls && hls.levels.length > 0) {
        const levels = hls.levels.map((lvl, index) => ({
          id: index,
          label: lvl.height ? `${lvl.height}p` : `Level ${index}`
        }))
        // Đảo ngược để cao nhất lên đầu
        qualityLevels.value = [{ id: -1, label: '自動 (Auto)' }, ...levels.reverse()]
      }
    })
    
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls?.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError()
            break
          default:
            hls?.destroy()
            break
        }
      }
    })
  } else {
    // Native (MP4 or Safari HLS)
    video.src = props.src
    if (props.startTime) video.currentTime = props.startTime
  }
}

// --- Event Handlers ---
const focusPlayer = () => {
  containerRef.value?.focus()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return

  switch(e.code) {
    case 'Space':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      e.preventDefault()
      seekBy(-5)
      break
    case 'ArrowRight':
      e.preventDefault()
      seekBy(5)
      break
  }
}

const seekBy = (seconds: number) => {
  if (!videoRef.value) return
  const newTime = Math.min(Math.max(videoRef.value.currentTime + seconds, 0), duration.value)
  videoRef.value.currentTime = newTime
  currentTime.value = newTime
  
  // Show controls when seeking
  showControlsTemporary()
}

const togglePlay = () => {
  focusPlayer() 
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {})
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
  showSettings.value = false 
  showControlsTemporary()
}

const toggleMute = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
  if (!isMuted.value && volume.value === 0) {
    volume.value = 1
    videoRef.value.volume = 1
  }
  showControlsTemporary()
}

const applyVolume = () => {
  if (!videoRef.value) return
  videoRef.value.volume = volume.value
  if (volume.value > 0) {
    isMuted.value = false
    videoRef.value.muted = false
  }
  showControlsTemporary()
}

// Seek & Dragging Logic
const handleSeek = (e: MouseEvent) => {
  if (!videoRef.value || !duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  videoRef.value.currentTime = percentage * duration.value
  showControlsTemporary()
}

const startDragging = () => { isDragging = true }
const stopDragging = () => { isDragging = false }

const handleDragging = (e: MouseEvent) => {
  if (isDragging && videoRef.value && duration.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    videoRef.value.currentTime = percentage * duration.value
    showControlsTemporary()
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.value?.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  showControlsTemporary()
}

const changeQuality = (levelId: number) => {
  currentQuality.value = levelId
  if (hls) {
    hls.currentLevel = levelId
  }
  showSettings.value = false
  showControlsTemporary()
}

// Controls visibility
const handleMouseMove = () => {
  showControlsTemporary()
}

const handleMouseLeave = () => {
  if (isPlaying.value) {
    showControls.value = false
    showSettings.value = false
  }
}

// Video Events
const onTimeUpdate = () => {
  if (!videoRef.value || isDragging) return 
  currentTime.value = videoRef.value.currentTime
  emit('timeupdate', { currentTime: currentTime.value, duration: duration.value })
}

const onDurationChange = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

const onProgress = () => {
  if (!videoRef.value || !videoRef.value.buffered.length) return
  bufferedEnd.value = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
}

const onWaiting = () => { isBuffering.value = true }
const onPlaying = () => { isBuffering.value = false; isPlaying.value = true }
const onPause = () => { isPlaying.value = false; showControls.value = true }
const onEnded = () => { isPlaying.value = false; showControls.value = true; emit('ended') }

watch(() => props.src, initPlayer)

onMounted(() => {
  const v = videoRef.value
  if (v) {
    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('durationchange', onDurationChange)
    v.addEventListener('progress', onProgress)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnded)
  }
  window.addEventListener('mouseup', stopDragging)
  initPlayer()
})

onBeforeUnmount(() => {
  const v = videoRef.value
  if (v) {
    v.removeEventListener('timeupdate', onTimeUpdate)
    v.removeEventListener('durationchange', onDurationChange)
    v.removeEventListener('progress', onProgress)
    v.removeEventListener('waiting', onWaiting)
    v.removeEventListener('playing', onPlaying)
    v.removeEventListener('pause', onPause)
    v.removeEventListener('ended', onEnded)
  }
  window.removeEventListener('mouseup', stopDragging)
  window.removeEventListener('keydown', handleKeydown)
  if (hls) hls.destroy()
  if (controlsTimeout) clearTimeout(controlsTimeout)
})
</script>

<style scoped>
/* Custom range input styling */
input[type=range] {
  -webkit-appearance: none;
  background: transparent;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #10b981; /* Emerald-500 */
  cursor: pointer;
  margin-top: -4px;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #52525b; /* Zinc-600 */
  border-radius: 2px;
}
</style>