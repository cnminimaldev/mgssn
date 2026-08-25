<template>
  <!-- Component này không render bất kỳ HTML nào ra giao diện -->
  <span style="display: none;"></span>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAds } from '~~/app/composables/useAds'

const { getAdCode } = useAds()

// Tái sử dụng logic parse Script an toàn
const injectToElement = (code: string | null, target: HTMLElement) => {
  if (!code) return
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = code
  
  // Xử lý các thẻ bình thường (như <noscript> của tracking pixel)
  Array.from(tempDiv.childNodes).forEach(node => {
    if (node.nodeName.toLowerCase() !== 'script') {
      target.appendChild(node.cloneNode(true))
    }
  })

  // Xử lý và thực thi các thẻ <script>
  const scripts = tempDiv.getElementsByTagName('script')
  Array.from(scripts).forEach(oldScript => {
    const newScript = document.createElement('script')
    
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    
    if (oldScript.innerHTML) {
      newScript.innerHTML = oldScript.innerHTML
    }
    
    target.appendChild(newScript)
  })
}

onMounted(() => {
  // Lấy mã toàn trang từ Store
  const headCode = getAdCode('global_head')
  const bodyCode = getAdCode('global_body')
  
  // Bơm vào Head và Body
  if (headCode) injectToElement(headCode, document.head)
  if (bodyCode) injectToElement(bodyCode, document.body)
})
</script>