<template>
  <span style="display: none;"></span>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useAds } from '~~/app/composables/useAds'

// 1. Khai báo Props để nhận lệnh từ Component cha
const props = defineProps({
  position: {
    type: String,
    default: '' // VD: 'global_body', 'popunder_player'...
  },
  target: {
    type: String,
    default: 'body' // 'head' hoặc 'body'
  }
})

const { getAdCode } = useAds()

// 2. Tạo mảng theo dõi các Node đã được bơm vào DOM
const injectedNodes: Node[] = []

const injectToElement = (code: string | null, targetElement: HTMLElement) => {
  if (!code) return
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = code
  
  // Bơm các thẻ HTML thường (div, span, img...)
  Array.from(tempDiv.childNodes).forEach(node => {
    if (node.nodeName.toLowerCase() !== 'script') {
      const clonedNode = node.cloneNode(true)
      targetElement.appendChild(clonedNode)
      injectedNodes.push(clonedNode) // Ghi sổ để dọn dẹp
    }
  })

  // Bơm và kích hoạt các thẻ <script>
  const scripts = tempDiv.getElementsByTagName('script')
  Array.from(scripts).forEach(oldScript => {
    const newScript = document.createElement('script')
    
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    
    if (oldScript.text) {
      newScript.text = oldScript.text
    }
    
    targetElement.appendChild(newScript)
    injectedNodes.push(newScript) // Ghi sổ để dọn dẹp
  })
}

onMounted(() => {
  // 3. Nếu có truyền prop `position`, chỉ chạy riêng mã đó
  if (props.position) {
    const code = getAdCode(props.position)
    const targetElement = props.target === 'head' ? document.head : document.body
    if (code) injectToElement(code, targetElement)
  } 
  // 4. Nếu gọi <GlobalScripts /> trống (thường dùng ở file layout app.vue)
  else {
    const headCode = getAdCode('global_head')
    const bodyCode = getAdCode('global_body')
    
    if (headCode) injectToElement(headCode, document.head)
    if (bodyCode) injectToElement(bodyCode, document.body)
  }
})

// 5. [QUAN TRỌNG] Quét dọn rác DOM ngay trước khi Component bị hủy (khi chuyển trang)
onBeforeUnmount(() => {
  injectedNodes.forEach(node => {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }
  })
})
</script>