<template>
  <BaseModal :model-value="modelValue" title="シェア (共有)" @update:model-value="$emit('update:modelValue', $event)">
    <div class="space-y-4">
      <p class="text-sm text-zinc-400">
        このエピソードを友達と共有しましょう。
      </p>

      <div class="grid grid-cols-4 gap-2">
        <a
          :href="twitterUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 transition"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </div>
          <span class="text-[10px] text-zinc-300">X (Twitter)</span>
        </a>

        <a
          :href="facebookUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 transition"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white">
            <svg fill="currentColor" viewBox="0 0 24 24" class="h-6 w-6"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 2.87v1.126h3.255l-.589 3.667h-2.666v7.956c3.975-.023 7.237-3.285 7.237-7.266a7.276 7.276 0 0 0-7.275-7.276 7.276 7.276 0 0 0-7.275 7.276c0 3.996 3.295 7.275 7.275 7.266z"></path></svg>
          </div>
          <span class="text-[10px] text-zinc-300">Facebook</span>
        </a>

        <a
          :href="lineUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 transition"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755] text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.495 3.415V8.108c0-.345.282-.63.63-.63.345 0 .627.285.627.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.259 1.058.59.12.301.079.74.038 1.02l-.183 1.126c-.053.317-.25 1.247 1.093.68 1.343-.568 7.311-4.333 9.982-7.416 1.354-1.566 2-3.465 2-5.608"></path></svg>
          </div>
          <span class="text-[10px] text-zinc-300">LINE</span>
        </a>

        <button
          @click="copyLink"
          class="flex flex-col items-center gap-2 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 transition group"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-600 text-white group-hover:bg-emerald-600 transition-colors">
            <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          </div>
          <span class="text-[10px] text-zinc-300">{{ copied ? 'コピー完了' : 'Copy Link' }}</span>
        </button>
      </div>

      <div class="rounded bg-zinc-900 p-3 border border-zinc-800 flex items-center gap-2">
        <span class="text-xs text-zinc-500 truncate flex-1 font-mono">{{ url }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '~/components/BaseModal.vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  url: string
}>()

const emit = defineEmits(['update:modelValue'])

const copied = ref(false)

// Tạo URL chia sẻ
const twitterUrl = computed(() => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`
})

const facebookUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
})

const lineUrl = computed(() => {
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(props.url)}`
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
      emit('update:modelValue', false)
    }, 1500)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}
</script>