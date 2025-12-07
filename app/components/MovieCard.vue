<template>
  <div
    ref="cardRef"
    class="relative aspect-video cursor-pointer overflow-hidden rounded-md bg-zinc-900 transition-all duration-300"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <img
      :src="item.thumbnail || '/images/fallback-poster.webp'"
      :alt="item.title"
      class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      loading="lazy"
    />

    <div v-if="item.type === 'series'" class="absolute right-1 top-1 z-10">
      <span class="rounded bg-indigo-500/90 px-1 py-0.5 text-[8px] font-bold text-white shadow-sm backdrop-blur-sm">
        SERIES
      </span>
    </div>

    <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-transparent to-transparent p-2">
      <p class="line-clamp-1 text-xs font-medium text-zinc-100">
        {{ item.title }}
      </p>
    </div>

    <Teleport to="body">
      <div
        v-if="isHovered"
        ref="popupRef"
        class="fixed z-[9999] overflow-hidden rounded-lg bg-[#141414] shadow-2xl transition-all duration-300 ease-out"
        :style="popupStyle"
        @mouseenter="handlePopupEnter"
        @mouseleave="handleMouseLeave"
      >
        <div 
          class="relative aspect-video w-full cursor-pointer"
          @click="handleClick"
        >
          <img
            :src="item.thumbnail || '/images/fallback-poster.webp'"
            :alt="item.title"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-40"></div>
          
          <div class="absolute bottom-2 left-3 right-3">
            <h3 class="line-clamp-1 text-lg font-bold text-white drop-shadow-md">
              {{ item.title }}
            </h3>
          </div>
        </div>

        <div class="p-3">
          <div class="mb-3 flex items-center gap-2">
            <NuxtLink
              :to="linkTo"
              class="flex items-center gap-1 rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-neutral-200"
            >
              <span class="text-sm">▶</span> 再生
            </NuxtLink>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 text-gray-300 hover:border-white hover:text-white"
              :class="{ 'border-emerald-400 text-emerald-400 hover:border-emerald-300 hover:text-emerald-300': inMyList }"
              title="マイリスト"
              @click.stop="handleToggleList"
            >
              <span v-if="inMyList" class="text-sm font-bold">✔</span>
              <span v-else class="text-lg">＋</span>
            </button>
            
             <NuxtLink
              :to="linkTo"
              class="ml-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 text-gray-300 hover:border-white hover:text-white"
              title="詳細情報"
            >
              <span class="text-xs">▼</span>
            </NuxtLink>
          </div>

          <div class="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-400">
            <span class="text-white">{{ item.year }}</span>
            <span v-if="item.episodeCount" class="text-zinc-300">{{ item.episodeCount }}エピソード</span>
            <span class="rounded border border-zinc-600 px-1 text-[9px] text-zinc-400">HD</span>
          </div>

          <div class="mb-2 flex flex-wrap gap-x-2 text-[11px] text-zinc-300">
             <span v-if="item.genre">{{ item.genre }}</span>
             <span v-if="item.country">・{{ item.country }}</span>
          </div>

          <p v-if="item.description" class="line-clamp-3 text-[10px] leading-relaxed text-zinc-400">
            {{ item.description }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useMyList } from '~/composables/useMyList'
import { navigateTo } from '#imports'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  item: {
    id: number
    type: 'movie' | 'series'
    slug: string
    title: string
    thumbnail?: string
    posterUrl?: string
    year?: number
    genre?: string
    country?: string
    episodeCount?: number
    description?: string
  }
}>()

const linkTo = computed(() => 
  props.item.type === 'series' ? `/series/${props.item.slug}` : `/movie/${props.item.slug}`
)

const handleClick = () => {
  navigateTo(linkTo.value)
}

const { isInMyList, toggleMyList } = useMyList()
const inMyList = computed(() => isInMyList(props.item.id, props.item.type))

const handleToggleList = () => {
  toggleMyList(props.item.id, props.item.type)
}

// --- Logic Hover & Popup Position ---
const isHovered = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const timer = ref<any>(null)

const coords = ref({ top: 0, left: 0, width: 0 })

// Hàm tính toán vị trí thông minh (Smart Positioning)
const calculatePosition = () => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  
  // Kích thước Viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 24 // Khoảng cách an toàn với mép màn hình

  // Scale 1.5 lần
  const scale = 1.5
  const popupWidth = rect.width * scale
  
  // 1. TÍNH TOÁN LEFT (Xử lý tràn ngang)
  // Mặc định: Căn giữa popup so với card
  let left = rect.left - (popupWidth - rect.width) / 2

  // Nếu tràn bên TRÁI: Gán bằng margin trái
  if (left < margin) {
    left = margin
  }
  // Nếu tràn bên PHẢI: Đẩy ngược lại để sát lề phải
  else if (left + popupWidth > viewportWidth - margin) {
    left = viewportWidth - popupWidth - margin
  }

  // 2. TÍNH TOÁN TOP (Xử lý tràn dọc)
  // Mặc định: Căn giữa theo chiều dọc của ảnh card
  // (Popup có phần thông tin bên dưới nên sẽ dài hơn)
  let top = rect.top - (rect.height * (scale - 1)) / 2

  // Ước lượng chiều cao của Popup (Ảnh + Info ~ 160px)
  const estimatedHeight = (rect.height * scale) + 160

  // Nếu tràn bên DƯỚI: Đẩy lên trên
  if (top + estimatedHeight > viewportHeight - margin) {
    // Đặt đáy popup cách mép dưới màn hình một khoảng margin
    top = viewportHeight - estimatedHeight - margin
  }

  // Chặn tràn bên TRÊN (phòng trường hợp đẩy lên quá cao chạm header)
  if (top < margin + 60) { // 60px cho header
    top = margin + 60
  }

  coords.value = {
    top,
    left,
    width: popupWidth
  }
}

const popupStyle = computed<CSSProperties>(() => ({
  top: `${coords.value.top}px`,
  left: `${coords.value.left}px`,
  width: `${coords.value.width}px`,
  // Chỉ scale nhẹ 0.95 -> 1 để tạo cảm giác nảy (pop), không cần scale từ 0
  transform: isHovered.value ? 'scale(1)' : 'scale(0.95)', 
  opacity: isHovered.value ? 1 : 0,
  pointerEvents: (isHovered.value ? 'auto' : 'none') as 'auto' | 'none',
  // Thêm transform-origin để hiệu ứng scale mượt từ tâm (hoặc có thể chỉnh tùy ý)
  transformOrigin: 'center center'
}))

const handleMouseEnter = () => {
  timer.value = setTimeout(() => {
    calculatePosition()
    isHovered.value = true
  }, 500) // Delay 500ms
}

const handlePopupEnter = () => {
  if (timer.value) clearTimeout(timer.value)
  isHovered.value = true
}

const handleMouseLeave = () => {
  if (timer.value) clearTimeout(timer.value)
  isHovered.value = false
}

const closeOnScroll = () => {
  if (isHovered.value) isHovered.value = false
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', closeOnScroll)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', closeOnScroll)
  }
})
</script>