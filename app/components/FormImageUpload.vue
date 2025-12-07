<template>
  <div>
    <label class="mb-1 block text-sm font-medium text-zinc-300">
      {{ label }}
    </label>
    
    <div class="flex items-start gap-4">
      <div 
        class="relative flex-shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900"
        :class="aspectClass"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="h-full w-full object-cover"
          alt="Preview"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-zinc-600">
          <span class="text-xs">No Image</span>
        </div>

        <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black/60">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <input
          type="file"
          accept="image/*"
          class="block w-full text-xs text-zinc-400 file:mr-2 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-xs file:text-zinc-200 hover:file:bg-zinc-700"
          @change="handleFileChange"
        />
        
        <input
          :value="modelValue"
          type="text"
          class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
          placeholder="https://..."
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <p class="text-[10px] text-zinc-500">
          Upload ảnh hoặc dán đường dẫn trực tiếp.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageUpload } from '~/composables/useImageUpload'

const props = defineProps<{
  label: string
  modelValue: string | null
  folder?: string
  ratio?: 'poster' | 'banner'
}>()

const emit = defineEmits(['update:modelValue'])

const { uploadImage, uploading } = useImageUpload()
const localPreview = ref<string | null>(null)

const aspectClass = computed(() => {
  return props.ratio === 'banner' ? 'w-48 h-27 aspect-video' : 'w-24 h-36 aspect-[2/3]'
})

const previewUrl = computed(() => localPreview.value || props.modelValue)

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  
  // FIX: Kiểm tra file tồn tại để TypeScript không báo lỗi
  if (!file) return

  localPreview.value = URL.createObjectURL(file)

  try {
    const publicUrl = await uploadImage(file, props.folder || 'misc')
    emit('update:modelValue', publicUrl)
  } catch (e) {
    alert('Upload failed!')
    localPreview.value = null
  }
}
</script>