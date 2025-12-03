<template>
  <section class="row">
    <!-- Header kiểu Nhật -->
    <div class="row-header">
      <div class="row-header-left">
        <h2 class="row-title">{{ title }}</h2>
        <span v-if="subLabel" class="row-sublabel">
          {{ subLabel }}
        </span>
      </div>

      <button
        type="button"
        class="row-view-all"
      >
        すべて見る
        <span class="row-view-all-arrow">›</span>
      </button>
    </div>

    <!-- Khu vực scroll ngang + drag -->
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
      <NuxtLink
        v-for="movie in movies"
        :key="movie.id"
        class="card"
        :to="`/movie/${movie.id}`"
        draggable="false"
        @click.capture="onCardClick"
      >
        <img
          :src="movie.thumbnail || fallbackImage"
          :alt="movie.title"
          class="card-image"
          draggable="false"
          @error="onImageError($event)"
        />
        <div class="card-overlay">
          <p class="card-title">
            {{ movie.title }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

interface Movie {
  id: number | string
  title: string
  thumbnail?: string
}

defineProps<{
  title: string
  movies: Movie[]
  subLabel?: string
}>()

const fallbackImage = '/images/fallback-poster.webp'

// --- Fallback ảnh khi lỗi ---
const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (!target) return
  if (target.src.includes(fallbackImage)) return
  target.src = fallbackImage
}

// --- Drag + inertia scroll ---
const rowRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
const isPointerDown = ref(false)
const hasDragged = ref(false)

const startX = ref(0)
const scrollLeft = ref(0)

const lastX = ref(0)
const lastTime = ref(0)
const velocity = ref(0) // px/ms

const frameId = ref<number | null>(null)

// Có thể chỉnh lại cho hợp tay
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

    const delta = velocity.value * 16 // ~16ms/frame
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

// --- Mouse handlers ---
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

// --- Touch handlers (mobile) ---
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

// --- Chặn click nếu vừa drag ---
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
.row {
  margin-bottom: 24px;
}

/* Header hàng phim */
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

/* "すべて見る" chỉ hiện trên màn hình rộng */
.row-view-all {
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #a1a1aa;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
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

/* Hàng ngang + cuộn */
.row-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  cursor: grab;
  scroll-behavior: auto;
}

.row-scroll.is-dragging {
  cursor: grabbing;
  user-select: none;
}

.row-scroll::-webkit-scrollbar {
  height: 6px;
}

.row-scroll::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 3px;
}

/* Card là NuxtLink (<a>) */
.card {
  position: relative;
  flex: 0 0 auto;
  width: 200px;
  height: 112px; /* 16:9 */
  cursor: pointer;
  border-radius: 0.9rem;
  overflow: hidden;
  background: radial-gradient(circle at top left, #27272f, #18181b);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
}

.card:link,
.card:visited,
.card:hover,
.card:active {
  color: inherit;
  text-decoration: none;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.18s ease-out;
}

/* Hover: zoom nhẹ */
.card:hover .card-image {
  transform: scale(1.05);
}

/* Overlay & title */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 10px;
}

.card-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #f4f4f5;
  letter-spacing: 0.02em;
}
</style>
