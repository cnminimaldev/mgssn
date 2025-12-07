<template>
  <div>
    <div 
      v-if="!isAdmin" 
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 text-white backdrop-blur-sm"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      <p class="mt-4 text-sm font-medium text-zinc-300 animate-pulse">
        確認中... (Đang kiểm tra quyền truy cập)
      </p>
    </div>

    <div v-else>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useAuth } from '~/composables/useAuth'

// Kích hoạt middleware
definePageMeta({
  middleware: 'admin',
})

// Lấy trạng thái Admin
const { isAdmin } = useAuth()
</script>