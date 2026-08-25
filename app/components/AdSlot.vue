<template>
  <ClientOnly>
    <!-- Thêm v-show để ẩn quảng cáo sticky ở trang chủ (path === '/') -->
    <div 
      v-if="adCode" 
      v-show="!isStickyOnHomePage"
      ref="adContainer" 
      class="ad-slot-container" 
      :class="`ad-${position}`"
    ></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useAds } from '~~/app/composables/useAds'
import { useRoute } from '#imports'

const props = defineProps<{
  position: string
}>()

const route = useRoute()
const { getAdCode } = useAds()
const adCode = computed(() => getAdCode(props.position))
const adContainer = ref<HTMLElement | null>(null)

// Computed property để xác định có phải đang hiển thị sticky ads trên trang chủ không
const isStickyOnHomePage = computed(() => {
  const isHomePage = route.path === '/'
  const isSticky = props.position === 'sticky_left' || props.position === 'sticky_right'
  return isHomePage && isSticky
})

const injectAd = async () => {
  await nextTick()
  
  if (adContainer.value && adCode.value) {
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
  injectAd()
})

watch(() => adCode.value, () => {
  injectAd()
})

// Chạy lại injectAd nếu route thay đổi (để đảm bảo quảng cáo load đúng khi chuyển trang)
watch(() => route.path, () => {
  injectAd()
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

/* Thiết lập mặc định cho Sticky Ads là ẨN trên màn hình nhỏ */
.ad-sticky_left, .ad-sticky_right {
  display: none; /* ẨN MẶC ĐỊNH */
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  min-height: auto;
  margin: 0;
  z-index: 40; 
}

/* Chỉ HIỂN THỊ Sticky Ads khi màn hình rộng từ 1520px trở lên */
@media (min-width: 1520px) {
  .ad-sticky_left, .ad-sticky_right {
    display: block; 
  }
}

.ad-sticky_left {
  left: 0;
}

.ad-sticky_right {
  right: 0;
}
</style>