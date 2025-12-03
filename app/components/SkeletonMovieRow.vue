<template>
  <section class="mt-6">
    <div class="mb-2 flex items-center justify-between px-1">
      <h2 class="text-sm font-semibold text-zinc-200 sm:text-base">
        {{ title }}
      </h2>
    </div>
    <div class="relative">
      <div class="flex gap-3 overflow-hidden">
        <div
          v-for="n in skeletonCount"
          :key="n"
          class="h-40 w-32 flex-shrink-0 rounded-2xl bg-zinc-800/70 ring-1 ring-white/5 sm:h-48 sm:w-40"
        >
          <div class="h-full w-full animate-pulse bg-zinc-700/70"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  skeletonCount?: number
}>()

const skeletonCount = computed(() => props.skeletonCount ?? 7)
</script>
