<template>
  <ClientOnly>
    <!-- v-if chặn hoàn toàn render DOM nếu không khớp thiết bị -->
    <div 
      v-if="adCode && isMatchDevice && !isStickyOnHomePage" 
      ref="adContainer" 
      class="ad-slot-container" 
      :class="`ad-${position}`"
    ></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useAds } from '~~/app/composables/useAds'
import { useRoute } from '#imports'

const props = defineProps<{
  position: string
  device?: 'desktop' | 'mobile' | 'all' // Thêm prop này (mặc định là 'all')
}>()

const route = useRoute()
const { getAdCode } = useAds()
const adCode = computed(() => getAdCode(props.position))
const adContainer = ref<HTMLElement | null>(null)
const isMatchDevice = ref(false)

const isStickyOnHomePage = computed(() => {
  return route.path === '/' && (props.position === 'sticky_left' || props.position === 'sticky_right')
})

// Kiểm tra kích thước màn hình bằng JS thuần
const checkDevice = () => {
  if (typeof window === 'undefined') return
  
  // 640px tương đương với breakpoint 'sm' của Tailwind
  const isDesktopScreen = window.matchMedia('(min-width: 640px)').matches 
  
  if (props.device === 'desktop') {
    isMatchDevice.value = isDesktopScreen
  } else if (props.device === 'mobile') {
    isMatchDevice.value = !isDesktopScreen
  } else {
    isMatchDevice.value = true
  }
}

const injectAd = async () => {
  await nextTick() // Đợi v-if render DOM xong
  
  if (adContainer.value && adCode.value && isMatchDevice.value) {
    adContainer.value.innerHTML = ''
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = adCode.value

    Array.from(tempDiv.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== 'script') {
        adContainer.value!.appendChild(node.cloneNode(true))
      }
    })

    const scripts = tempDiv.getElementsByTagName('script')
    Array.from(scripts).forEach(oldScript => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML
      }
      adContainer.value!.appendChild(newScript)
    })
  }
}

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  
  // Chỉ chạy inject khi thiết bị khớp
  if (isMatchDevice.value) {
    injectAd()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})

// Lắng nghe khi điều kiện thiết bị thay đổi (người dùng xoay điện thoại hoặc kéo lại cửa sổ)
watch(isMatchDevice, (newVal) => {
  if (newVal) {
    injectAd()
  }
})

watch(() => adCode.value, () => {
  if (isMatchDevice.value) injectAd()
})

watch(() => route.path, () => {
  if (isMatchDevice.value) injectAd()
})
</script>

<style scoped>
.ad-slot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 50px; 
  margin: 1rem 0;
  overflow: hidden;
}

.ad-sticky_left, .ad-sticky_right {
  display: none; 
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  min-height: auto;
  margin: 0;
  z-index: 40; 
}

@media (min-width: 1650px) {
  .ad-sticky_left, .ad-sticky_right {
    display: block; 
  }
}

.ad-sticky_left { left: 0; }
.ad-sticky_right { right: 0; }
</style>