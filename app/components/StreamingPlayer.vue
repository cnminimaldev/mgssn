<template>
  <div
    ref="containerRef"
    class="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-white/10"
  >
    <div class="aspect-video w-full bg-black">
      <video
        ref="videoRef"
        class="h-full w-full bg-black"
        :poster="poster"
        preload="metadata"
        @click="togglePlay"
      >
        <source :src="currentSource.src" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

    <!-- Gradient overlay top & bottom -->
    <div
      class="pointer-events-none absolute inset-0 flex flex-col justify-between"
    >
      <div class="h-24 bg-gradient-to-b from-black/70 to-transparent"></div>
      <div class="h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
    </div>

    <!-- Controls -->
    <div
      class="pointer-events-none absolute inset-0 flex flex-col justify-between"
    >
      <!-- Top bar -->
      <div class="flex items-start justify-between px-3 pt-2 sm:px-4">
        <div
          class="pointer-events-auto max-w-[70%] rounded-full bg-black/40 px-3 py-1 text-[11px] text-zinc-100 ring-1 ring-white/10 sm:text-xs"
        >
          {{ title }}
        </div>

        <div class="pointer-events-auto flex items-center gap-2 text-xs">
          <!-- Quality -->
          <div class="relative">
            <button
              class="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-zinc-100 ring-1 ring-white/10 hover:bg-black/80"
              @click.stop="toggleQualityMenu"
            >
              <span class="hidden sm:inline">画質</span>
              <span>{{ currentSource.label }}</span>
            </button>
            <div
              v-if="showQualityMenu"
              class="absolute right-0 mt-1 w-28 rounded-xl bg-black/90 p-1 text-[11px] text-zinc-100 ring-1 ring-white/10"
            >
              <button
                v-for="q in qualitySources"
                :key="q.label"
                class="flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-white/10"
                @click.stop="selectQuality(q.label)"
              >
                <span>{{ q.label }}</span>
                <span v-if="q.label === selectedQualityLabel">✓</span>
              </button>
            </div>
          </div>

          <!-- Settings (subtitle style demo) -->
          <div class="relative">
            <button
              class="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-zinc-100 ring-1 ring-white/10 hover:bg-black/80"
              @click.stop="toggleSettingsMenu"
            >
              <span>設定</span>
            </button>
            <div
              v-if="showSettingsMenu"
              class="absolute right-0 mt-1 w-40 rounded-xl bg-black/90 p-2 text-[11px] text-zinc-100 ring-1 ring-white/10"
            >
              <p class="mb-1 text-[10px] text-zinc-400">字幕スタイル（デモ）</p>
              <div class="mb-2 space-y-1">
                <div class="flex items-center justify-between">
                  <span>サイズ</span>
                  <select
                    v-model="subtitleSize"
                    class="rounded bg-black/70 px-2 py-0.5 text-[11px]"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>
                <div class="flex items-center justify-between">
                  <span>背景</span>
                  <select
                    v-model="subtitleBg"
                    class="rounded bg-black/70 px-2 py-0.5 text-[11px]"
                  >
                    <option value="none">なし</option>
                    <option value="dark">ダーク</option>
                  </select>
                </div>
              </div>
              <div
                class="rounded bg-zinc-900/80 px-2 py-1 text-center text-[11px]"
              >
                <span
                  :class="subtitlePreviewClass"
                  class="inline-block rounded px-1"
                >
                  サンプル字幕
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom controls -->
      <div class="pointer-events-auto px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
        <!-- Progress bar -->
        <div class="flex items-center gap-2">
          <input
            ref="progressRef"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            v-model.number="scrubTime"
            class="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-400"
            @input="handleScrub"
          />
        </div>

        <div class="mt-2 flex items-center justify-between text-[11px] sm:text-xs">
          <div class="flex items-center gap-2">
            <!-- Play/Pause -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200"
              @click="togglePlay"
            >
              <span v-if="!isPlaying">▶</span>
              <span v-else class="-translate-x-[1px]">⏸</span>
            </button>

            <!-- Seek -5 / +5 -->
            <button
              class="hidden h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-100 hover:bg-zinc-700 sm:flex"
              @click="seekBy(-5)"
            >
              -5s
            </button>
            <button
              class="hidden h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-100 hover:bg-zinc-700 sm:flex"
              @click="seekBy(5)"
            >
              +5s
            </button>

            <!-- Time -->
            <span class="tabular-nums text-[11px] text-zinc-300">
              {{ formattedCurrentTime }} / {{ formattedDuration }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Volume -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-100 hover:bg-zinc-700"
              @click="toggleMute"
            >
              <span v-if="isMuted || volume === 0">🔇</span>
              <span v-else-if="volume < 0.5">🔉</span>
              <span v-else>🔊</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              v-model.number="volume"
              class="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-400 sm:block"
              @input="applyVolume"
            />

            <!-- Fullscreen -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-100 hover:bg-zinc-700"
              @click="toggleFullscreen"
            >
              <span v-if="!isFullscreen">⛶</span>
              <span v-else>⤢</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue'

const props = defineProps<{
  src: string
  poster?: string
  title?: string
  startTime?: number
  sources?: { label: string; src: string }[]
}>()

const emit = defineEmits<{
  (e: 'timeupdate', payload: { currentTime: number; duration: number }): void
  (e: 'ended'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const progressRef = ref<HTMLInputElement | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const scrubTime = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)

const showQualityMenu = ref(false)
const showSettingsMenu = ref(false)

// Subtitle style (demo)
const subtitleSize = ref<'small' | 'medium' | 'large'>('medium')
const subtitleBg = ref<'none' | 'dark'>('dark')

const subtitlePreviewClass = computed(() => {
  const classes: string[] = []
  if (subtitleBg.value === 'dark') {
    classes.push('bg-black/70')
  }
  if (subtitleSize.value === 'small') {
    classes.push('text-[10px]')
  } else if (subtitleSize.value === 'medium') {
    classes.push('text-xs')
  } else {
    classes.push('text-sm')
  }
  return classes.join(' ')
})

// Quality sources
const qualitySources = computed(() => {
  if (props.sources && props.sources.length > 0) return props.sources
  // demo: 1 chất lượng "自動"
  return [{ label: '自動', src: props.src }]
})

const selectedQualityLabel = ref(
  qualitySources.value[0]?.label ?? '自動',
)

const currentSource = computed(() => {
  const found = qualitySources.value.find(
    (q) => q.label === selectedQualityLabel.value,
  )
  return (
    found ??
    qualitySources.value[0] ?? {
      label: '自動',
      src: props.src,
    }
  )
})

watch(
  () => props.src,
  () => {
    // khi đổi phim
    selectedQualityLabel.value =
      qualitySources.value[0]?.label ?? '自動'
  },
)

// format time
const formatTime = (sec: number): string => {
  if (!sec || Number.isNaN(sec) || sec < 0) return '00:00'
  const total = Math.floor(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${pad(m)}:${pad(s)}`
}

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

const applyVolume = () => {
  const el = videoRef.value
  if (!el) return
  el.volume = volume.value
  el.muted = isMuted.value
}

const togglePlay = () => {
  const el = videoRef.value
  if (!el) return
  if (isPlaying.value) {
    el.pause()
    isPlaying.value = false
  } else {
    el
      .play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(() => {
        // autoplay có thể bị chặn
      })
  }
}

const seekBy = (offset: number) => {
  const el = videoRef.value
  if (!el || !duration.value) return
  const target = Math.min(
    Math.max(el.currentTime + offset, 0),
    duration.value,
  )
  el.currentTime = target
  scrubTime.value = target
}

const handleScrub = () => {
  const el = videoRef.value
  if (!el || !duration.value) return
  el.currentTime = scrubTime.value
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  applyVolume()
}

const toggleQualityMenu = () => {
  showQualityMenu.value = !showQualityMenu.value
  if (showQualityMenu.value) {
    showSettingsMenu.value = false
  }
}

const toggleSettingsMenu = () => {
  showSettingsMenu.value = !showSettingsMenu.value
  if (showSettingsMenu.value) {
    showQualityMenu.value = false
  }
}

const selectQuality = (label: string) => {
  selectedQualityLabel.value = label
  showQualityMenu.value = false
  // đơn giản: để video load lại, không preserve time
  const el = videoRef.value
  if (!el) return
  const wasPlaying = isPlaying.value
  el.load()
  if (wasPlaying) {
    el.play().catch(() => {})
  }
}

const toggleFullscreen = async () => {
  const container = containerRef.value
  if (!container) return

  if (!isFullscreen.value) {
    if (container.requestFullscreen) {
      await container.requestFullscreen()
      isFullscreen.value = true
    }
  } else if (document.fullscreenElement) {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleTimeUpdate = () => {
  const el = videoRef.value
  if (!el) return
  currentTime.value = el.currentTime
  scrubTime.value = el.currentTime
  duration.value = el.duration || duration.value
  emit('timeupdate', {
    currentTime: el.currentTime,
    duration: el.duration || 0,
  })
}

const handleEnded = () => {
  isPlaying.value = false
  emit('ended')
}

onMounted(async () => {
  await nextTick()
  const el = videoRef.value
  if (!el) return

  // event listeners
  el.addEventListener('timeupdate', handleTimeUpdate)
  el.addEventListener('ended', handleEnded)
  el.addEventListener('loadedmetadata', () => {
    duration.value = el.duration || duration.value
    // áp dụng startTime nếu có
    if (props.startTime && props.startTime > 0 && props.startTime < el.duration) {
      try {
        el.currentTime = props.startTime
        currentTime.value = props.startTime
        scrubTime.value = props.startTime
      } catch {
        // ignore
      }
    }
    applyVolume()
  })

  // default volume
  applyVolume()
})

onBeforeUnmount(() => {
  const el = videoRef.value
  if (!el) return
  el.removeEventListener('timeupdate', handleTimeUpdate)
  el.removeEventListener('ended', handleEnded)
})
</script>
