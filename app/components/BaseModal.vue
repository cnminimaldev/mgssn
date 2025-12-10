<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          @click="$emit('update:modelValue', false)"
        ></div>

        <div 
          class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 text-left align-middle shadow-2xl transition-all"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold leading-6 text-white">
              {{ title }}
            </h3>
            <button 
              @click="$emit('update:modelValue', false)"
              class="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-2">
            <slot></slot>
          </div>

          <div class="mt-6 flex justify-end gap-3" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
}>()

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active > div:last-child,
.fade-leave-active > div:last-child {
  transition: transform 0.2s ease-out;
}

.fade-enter-from > div:last-child {
  transform: scale(0.95);
}
.fade-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>