<template>
  <div class="flex min-h-screen items-center justify-center bg-black text-white">
    <div class="max-w-md px-6 text-center">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        申し訳ありません。問題が発生しました。
      </h1>
      <p class="mt-3 text-sm text-zinc-300">
        一時的なエラーによりページを表示できませんでした。<br />
        お手数ですが、しばらく時間をおいてから再度お試しください。
      </p>

      <p class="mt-4 text-xs text-zinc-500">
        エラーコード:
        <span class="font-mono">
          {{ safeError.statusCode || '不明' }}
        </span>
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <button
          class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
          @click="handleReload"
        >
          再読み込み
        </button>
        <button
          class="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          @click="handleBackHome"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clearError, useError } from '#imports'
import { computed } from 'vue'

const rawError = useError()

// always have an object cho template, tránh undefined
const safeError = computed(() => {
  return rawError.value ?? { statusCode: undefined }
})

const handleReload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  } else {
    clearError()
  }
}

const handleBackHome = () => {
  clearError({ redirect: '/' })
}
</script>
