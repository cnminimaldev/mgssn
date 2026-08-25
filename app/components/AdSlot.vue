<template>
  <!-- ClientOnly đảm bảo component chỉ render ở trình duyệt, tránh Hydration Mismatch -->
  <ClientOnly>
    <div 
      v-if="adCode" 
      ref="adContainer" 
      class="ad-slot-container" 
      :class="`ad-${position}`"
    ></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// Import composable chúng ta vừa viết ở Bước 3
import { useAds } from '~~/app/composables/useAds'

const props = defineProps<{
  position: string
}>()

const { getAdCode } = useAds()
const adCode = getAdCode(props.position)
const adContainer = ref<HTMLElement | null>(null)

// Hàm inject mã quảng cáo an toàn
const injectAd = () => {
  if (adContainer.value && adCode) {
    // Xóa nội dung cũ (nếu có)
    adContainer.value.innerHTML = ''
    
    try {
      // createContextualFragment là "chìa khóa" giúp các thẻ <script> bên trong chuỗi string được thực thi
      const fragment = document.createRange().createContextualFragment(adCode)
      adContainer.value.appendChild(fragment)
    } catch (error) {
      console.error(`Lỗi khi render quảng cáo ở vị trí ${props.position}:`, error)
    }
  }
}

onMounted(() => {
  // Đợi DOM mount xong mới bắt đầu nhúng script
  injectAd()
})

// Lắng nghe sự thay đổi nếu Nuxt chuyển trang và component được tái sử dụng
watch(() => adCode, () => {
  injectAd()
})
</script>

<style scoped>
.ad-slot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* Min-height giúp giảm thiểu CLS (Cumulative Layout Shift) khi quảng cáo chưa load xong */
  min-height: 50px; 
  margin: 1rem 0;
  overflow: hidden;
}

/* Tinh chỉnh riêng cho các quảng cáo dính (Sticky Ads) hai bên */
.ad-sticky_left, .ad-sticky_right {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  min-height: auto;
  margin: 0;
  /* Giữ z-index ở mức vừa phải (vd: 40) để không đè lên thanh Header hay màn hình Fullscreen Player */
  z-index: 40; 
}

.ad-sticky_left {
  left: 0;
}

.ad-sticky_right {
  right: 0;
}
</style>