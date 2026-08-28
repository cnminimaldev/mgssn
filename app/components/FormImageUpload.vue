<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-zinc-300">
      {{ label }}
    </label>
    
    <div class="flex items-start gap-4">
      <div 
        class="relative flex-shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 group"
        :class="aspectClass"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="h-full w-full object-cover transition duration-200 group-hover:opacity-30"
          alt="Preview"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-zinc-600">
          <span class="text-xs">No Image</span>
        </div>

        <!-- Nút Xóa Ảnh (Sẽ hiện lên khi rê chuột vào) -->
        <button
          v-if="previewUrl"
          type="button"
          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          @click="handleRemoveImage"
          title="画像を削除 (Xóa ảnh)"
        >
          <div class="bg-rose-500/90 p-2 rounded-full text-white hover:bg-rose-500 transition-colors shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
        </button>

        <div v-if="uploading || deleting" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <input
          ref="fileInput"
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
          Upload an image or input a direct URL
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageUpload } from '~/composables/useImageUpload'

const props = defineProps<{
  label?: string
  modelValue: string | null
  folder?: string
  ratio?: 'poster' | 'banner'
}>()

const emit = defineEmits(['update:modelValue'])

// Đã bổ sung hàm deleteImage từ composable
const { uploadImage, deleteImage, uploading } = useImageUpload()
const deleting = ref(false)
const localPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const aspectClass = computed(() => {
  return props.ratio === 'banner' ? 'w-48 h-27 aspect-video' : 'w-24 h-36 aspect-[2/3]'
})

const previewUrl = computed(() => localPreview.value || props.modelValue)

// --- 1. XỬ LÝ UPLOAD VÀ TỰ ĐỘNG DỌN RÁC ---
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  if (!file) return

  // Nếu đang có link ảnh cũ thuộc về Supabase, tự động xóa nó đi trước
  if (props.modelValue && props.modelValue.includes('supabase')) {
    deleting.value = true
    try {
      await deleteImage(props.modelValue)
    } catch (e) {
      console.warn('Failed to delete old image:', e)
    }
    deleting.value = false
  }

  localPreview.value = URL.createObjectURL(file)

  try {
    const publicUrl = await uploadImage(file, props.folder || 'misc')
    emit('update:modelValue', publicUrl)
  } catch (e) {
    alert('Upload failed!')
    localPreview.value = null
  }
}

// --- 2. XỬ LÝ NÚT XÓA THỦ CÔNG ---
const handleRemoveImage = async () => {
  if (!confirm('この画像を削除してもよろしいですか？\n(Bạn có chắc chắn muốn xóa ảnh này vĩnh viễn không?)')) return

  if (props.modelValue && props.modelValue.includes('supabase')) {
    deleting.value = true
    try {
      await deleteImage(props.modelValue)
    } catch (e) {
      alert('Delete failed!')
      deleting.value = false
      return
    }
    deleting.value = false
  }

  // Làm sạch giao diện
  localPreview.value = null
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>