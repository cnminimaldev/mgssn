<template>
  <section class="row">
    <div class="row-header">
      <div class="row-header-left">
        <h2 class="row-title">{{ title }}</h2>
        <span v-if="subLabel" class="row-sublabel">
          {{ subLabel }}
        </span>
      </div>

      <NuxtLink
        v-if="viewAllLink"
        :to="viewAllLink"
        class="row-view-all"
      >
        すべて見る
        <span class="row-view-all-arrow">›</span>
      </NuxtLink>
    </div>

    <div
      ref="rowRef"
      class="row-scroll"
      :class="{ 'is-dragging': isDragging }"
      @mousedown.prevent="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="card-wrapper"
        @click.capture="onCardClick"
      >
        <MovieCard :item="movie" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import MovieCard from '~/components/MovieCard.vue'

interface Movie {
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

defineProps<{
  title: string
  movies: Movie[]
  subLabel?: string
  viewAllLink?: string // UPDATE: Thêm prop nhận link
}>()

// ... (Giữ nguyên toàn bộ logic Drag & Scroll cũ bên dưới không thay đổi) ...

const rowRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isPointerDown = ref(false)
const hasDragged = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const lastX = ref(0)
const lastTime = ref(0)
const velocity = ref(0) 
const frameId = ref<number | null>(null)
const DRAG_THRESHOLD = 3
const VELOCITY_MIN = 0.02
const FRICTION = 0.95

const cancelInertia = () => {
  if (frameId.value !== null) {
    cancelAnimationFrame(frameId.value)
    frameId.value = null
  }
}
const startInertia = () => {
  if (!rowRef.value) return
  if (Math.abs(velocity.value) < VELOCITY_MIN) return
  cancelInertia()
  const step = () => {
    if (!rowRef.value) return
    const delta = velocity.value * 16 
    rowRef.value.scrollLeft -= delta
    velocity.value *= FRICTION
    if (Math.abs(velocity.value) >= VELOCITY_MIN) {
      frameId.value = requestAnimationFrame(step)
    } else {
      frameId.value = null
    }
  }
  frameId.value = requestAnimationFrame(step)
}
const onMouseDown = (e: MouseEvent) => {
  if (!rowRef.value) return
  cancelInertia()
  isPointerDown.value = true
  isDragging.value = false
  hasDragged.value = false
  const x = e.pageX - rowRef.value.offsetLeft
  startX.value = x
  scrollLeft.value = rowRef.value.scrollLeft
  lastX.value = x
  lastTime.value = performance.now()
  velocity.value = 0
}
const onMouseMove = (e: MouseEvent) => {
  if (!isPointerDown.value || !rowRef.value) return
  const x = e.pageX - rowRef.value.offsetLeft
  const walk = x - startX.value
  if (Math.abs(walk) > DRAG_THRESHOLD) {
    isDragging.value = true
    hasDragged.value = true
  }
  if (isDragging.value) {
    rowRef.value.scrollLeft = scrollLeft.value - walk
    const now = performance.now()
    const dt = now - lastTime.value
    if (dt > 0) {
      const dx = x - lastX.value
      velocity.value = dx / dt
    }
    lastX.value = x
    lastTime.value = now
  }
}
const onMouseUp = () => {
  if (isPointerDown.value && hasDragged.value) {
    startInertia()
  }
  isPointerDown.value = false
  isDragging.value = false
}
const onTouchStart = (e: TouchEvent) => {
  if (!rowRef.value || e.touches.length === 0) return
  cancelInertia()
  isDragging.value = false
  hasDragged.value = false
  const touch = e.touches[0]!
  const x = touch.pageX - rowRef.value.offsetLeft
  startX.value = x
  scrollLeft.value = rowRef.value.scrollLeft
  lastX.value = x
  lastTime.value = performance.now()
  velocity.value = 0
}
const onTouchMove = (e: TouchEvent) => {
  if (!rowRef.value || e.touches.length === 0) return
  const touch = e.touches[0]!
  const x = touch.pageX - rowRef.value.offsetLeft
  const walk = x - startX.value
  if (Math.abs(walk) > DRAG_THRESHOLD) {
    isDragging.value = true
    hasDragged.value = true
  }
  if (isDragging.value) {
    rowRef.value.scrollLeft = scrollLeft.value - walk
    const now = performance.now()
    const dt = now - lastTime.value
    if (dt > 0) {
      const dx = x - lastX.value
      velocity.value = dx / dt
    }
    lastX.value = x
    lastTime.value = now
  }
}
const onTouchEnd = () => {
  if (hasDragged.value) {
    startInertia()
  }
  isDragging.value = false
}
const onCardClick = (e: MouseEvent) => {
  if (hasDragged.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}
onBeforeUnmount(() => {
  cancelInertia()
})
</script>

<style scoped>
/* Giữ nguyên style cũ */
.row {
  margin-bottom: 24px;
}

.row-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.row-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.row-sublabel {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.68rem;
  color: #e4e4e7;
}

/* Cập nhật style cho NuxtLink (thẻ a) */
.row-view-all {
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #a1a1aa;
  text-decoration: none; /* Thêm: bỏ gạch chân */
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s; /* Thêm: hiệu ứng mượt */
}

.row-view-all-arrow {
  font-size: 0.75rem;
}

.row-view-all:hover {
  color: #f4f4f5;
}

@media (min-width: 640px) {
  .row-view-all {
    display: inline-flex;
  }
}

.row-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  cursor: grab;
  scroll-behavior: auto;
  scrollbar-width: none;
}

.row-scroll::-webkit-scrollbar {
  display: none;
}

.row-scroll.is-dragging {
  cursor: grabbing;
  user-select: none;
}

.card-wrapper {
  flex: 0 0 auto;
  width: 200px;
}
</style>