<template>
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useAds } from '~~/app/composables/useAds'

const props = defineProps<{
  position: string
}>()

const { getAdCode } = useAds()
const adCode = getAdCode(props.position)
const adContainer = ref<HTMLElement | null>(null)

const injectAd = async () => {
  // Đợi DOM cập nhật xong
  await nextTick()
  
  if (adContainer.value && adCode) {
    // Xóa nội dung cũ
    adContainer.value.innerHTML = ''
    
    // Tạo một div ảo để phân tích chuỗi HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = adCode

    // 1. Chèn các element bình thường (div, a, img, iframe...) vào trước
    Array.from(tempDiv.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== 'script') {
        adContainer.value!.appendChild(node.cloneNode(true))
      }
    })

    // 2. Tìm tất cả các thẻ script và TẠO MỚI chúng
    const scripts = tempDiv.getElementsByTagName('script')
    Array.from(scripts).forEach(oldScript => {
      const newScript = document.createElement('script')
      
      // Sao chép toàn bộ thuộc tính (src, async, defer, type...)
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      
      // Sao chép nội dung code bên trong (nếu có)
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML
      }
      
      // Gắn thẻ script mới vào DOM -> Trình duyệt sẽ ngay lập tức tải và thực thi nó
      adContainer.value!.appendChild(newScript)
    })
  }
}

onMounted(() => {
  injectAd()
})

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
  min-height: 50px; 
  margin: 1rem 0;
  overflow: hidden;
}

.ad-sticky_left, .ad-sticky_right {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  min-height: auto;
  margin: 0;
  z-index: 40; 
}

.ad-sticky_left {
  left: 0;
}

.ad-sticky_right {
  right: 0;
}
</style>