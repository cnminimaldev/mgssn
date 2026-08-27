<template>
  <span style="display: none;"></span>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAds } from '~~/app/composables/useAds'

const { getAdCode } = useAds()

const injectToElement = (code: string | null, target: HTMLElement) => {
  if (!code) return
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = code
  
  Array.from(tempDiv.childNodes).forEach(node => {
    if (node.nodeName.toLowerCase() !== 'script') {
      target.appendChild(node.cloneNode(true))
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
    
    target.appendChild(newScript)
  })
}

onMounted(() => {
  const headCode = getAdCode('global_head')
  const bodyCode = getAdCode('global_body')
  
  if (headCode) injectToElement(headCode, document.head)
  if (bodyCode) injectToElement(bodyCode, document.body)
})
</script>