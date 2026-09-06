<template>
  <span style="display: none;"></span>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useAds } from '~~/app/composables/useAds'

const props = defineProps({
  position: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    default: 'body'
  }
})

const { getAdCode } = useAds()

// 1. SỔ GHI CHÉP 1: Chứa "mã mồi" do chúng ta chủ động bơm
const injectedNodes: Node[] = []

// 2. SỔ GHI CHÉP 2: Chứa "rác" (Social Bar) do Adsterra lén sinh ra
const dynamicNodes: Node[] = []
let observer: MutationObserver | null = null

const injectToElement = (code: string | null, targetElement: HTMLElement) => {
  if (!code) return
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = code
  
  Array.from(tempDiv.childNodes).forEach(node => {
    if (node.nodeName.toLowerCase() !== 'script') {
      const clonedNode = node.cloneNode(true)
      targetElement.appendChild(clonedNode)
      injectedNodes.push(clonedNode)
    }
  })

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
    injectedNodes.push(newScript)
  })
}

onMounted(() => {
  // --- BẬT RADAR QUÉT RÁC TRƯỚC KHI BƠM QUẢNG CÁO ---
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Bỏ qua các thành phần cốt lõi của Nuxt để tránh xóa nhầm app
          if (
            node.id === '__nuxt' || 
            node.id === 'teleports' || 
            node.hasAttribute('data-v-app') ||
            (node.tagName === 'SCRIPT' && node.id.includes('nuxt'))
          ) {
            return
          }
          
          // Chắc chắn 99% đây là các thẻ <div>, <iframe> do Adsterra sinh ra
          // Ghi vào sổ theo dõi ngay!
          dynamicNodes.push(node)
        }
      })
    })
  })

  // Theo dõi mọi biến động TRỰC TIẾP (childList) trên thẻ <body>
  observer.observe(document.body, { childList: true, subtree: false })
  // ------------------------------------------------

  // Sau khi bật Radar, tiến hành bơm mã quảng cáo
  if (props.position) {
    const code = getAdCode(props.position)
    const targetElement = props.target === 'head' ? document.head : document.body
    if (code) injectToElement(code, targetElement)
  } else {
    const headCode = getAdCode('global_head')
    const bodyCode = getAdCode('global_body')
    
    if (headCode) injectToElement(headCode, document.head)
    if (bodyCode) injectToElement(bodyCode, document.body)
  }
})

// [QUAN TRỌNG NHẤT] Dọn dẹp DOM khi Component bị hủy (Chuyển tập phim)
onBeforeUnmount(() => {
  // 1. Tắt Radar
  if (observer) observer.disconnect()

  // 2. Dọn sạch "mã mồi" ban đầu
  injectedNodes.forEach(node => {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }
  })

  // 3. Tiêu diệt toàn bộ "rác" (Social Bar, Popup) do Adsterra lén sinh ra
  dynamicNodes.forEach(node => {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
    }
  })
})
</script>