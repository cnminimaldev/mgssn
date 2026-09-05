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

// Mảng chứa "danh sách đen" (Tất cả script bơm vào và rác do quảng cáo tự sinh ra)
const garbageNodes: Node[] = []
let domObserver: MutationObserver | null = null

const injectToElement = (code: string | null, targetElement: HTMLElement) => {
  if (!code) return
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = code
  
  Array.from(tempDiv.childNodes).forEach(node => {
    if (node.nodeName.toLowerCase() !== 'script') {
      const clonedNode = node.cloneNode(true)
      targetElement.appendChild(clonedNode)
      garbageNodes.push(clonedNode) // Ghi sổ
    }
  })

  const scripts = tempDiv.getElementsByTagName('script')
  Array.from(scripts).forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    if (oldScript.text) newScript.text = oldScript.text
    
    targetElement.appendChild(newScript)
    garbageNodes.push(newScript) // Ghi sổ
  })
}

onMounted(() => {
  // 1. Bật RADAR THEO DÕI trước khi quảng cáo chạy
  domObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        // Nếu có thẻ bị nhét thêm vào body/head (bởi script quảng cáo)
        if (mutation.target === document.body || mutation.target === document.head) {
          
          // Bỏ qua các thành phần cốt lõi của Nuxt (tránh xóa nhầm web)
          if (node instanceof HTMLElement) {
            if (node.id === '__nuxt' || node.id === 'teleports') return
            if (node.tagName.toLowerCase() === 'script' && node.id.includes('nuxt')) return
          }
          
          // Đưa tàn dư quảng cáo vào danh sách đen để tiêu diệt
          garbageNodes.push(node)
        }
      })
    })
  })

  // Kích hoạt Radar soi toàn bộ thẻ body và head
  domObserver.observe(document.body, { childList: true })
  domObserver.observe(document.head, { childList: true })

  // 2. Bắt đầu bơm mã quảng cáo
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

onBeforeUnmount(() => {
  // 1. Tắt Radar
  if (domObserver) domObserver.disconnect()
  
  // 2. Lệnh hành quyết: Đốt sạch mọi tàn dư trong "Danh sách đen"
  garbageNodes.forEach(node => {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node)
    }
  })
})
</script>