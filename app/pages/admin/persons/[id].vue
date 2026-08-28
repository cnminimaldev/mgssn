<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/admin/persons" class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          人物一覧に戻る (Quay lại danh sách)
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <span v-if="isNew">新規追加 (Thêm nhân vật mới)</span>
          <span v-else>人物編集 (Chỉnh sửa nhân vật)</span>
          <span v-if="!isNew" class="text-xs font-normal text-zinc-500 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
            ID: {{ route.params.id }}
          </span>
        </h1>
      </div>

      <div v-if="loading" class="py-20 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <form v-else @submit.prevent="handleSave" class="space-y-6 animate-fade-in">
        <!-- Thông tin cơ bản -->
        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
            基本情報 (Basic Info)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">名前 (Tên hiển thị) <span class="text-red-500">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="例: 南沙良"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">ローマ字 (Romaji - Tên URL)</label>
                <input
                  v-model="form.name_romaji"
                  type="text"
                  placeholder="例: Minami Sara"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
                />
              </div>
            </div>

            <!-- Ảnh đại diện -->
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-2">アバター (Avatar)</label>
              <!-- Dùng lại FormImageUpload, lưu vào thư mục 'avatars' -->
              <FormImageUpload
                v-model="form.avatar_url"
                folder="avatars"
                ratio="poster"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-medium text-zinc-400 mb-1">バイオグラフィー (Tiểu sử)</label>
            <textarea
              v-model="form.bio"
              rows="5"
              placeholder="人物の紹介文..."
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            ></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            v-if="!isNew"
            type="button"
            @click="handleDelete"
            class="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            削除する
          </button>
          <div v-else></div> <!-- Spacer -->

          <button
            type="submit"
            :disabled="saving"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>保存する (Lưu)</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter, definePageMeta, useSupabaseClient } from '#imports'
import FormImageUpload from '~/components/FormImageUpload.vue'

definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()

const personId = route.params.id
const isNew = personId === 'new'

const loading = ref(!isNew)
const saving = ref(false)

const form = reactive({
  name: '',
  name_romaji: '',
  bio: '',
  avatar_url: ''
})

onMounted(async () => {
  if (isNew) return

  try {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', personId)
      .single()

    if (error) throw error

    Object.assign(form, {
      name: data.name || '',
      name_romaji: data.name_romaji || '',
      bio: data.bio || '',
      avatar_url: data.avatar_url || ''
    })
  } catch (e: any) {
    alert('エラー: ' + e.message)
    router.push('/admin/persons')
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  if (!form.name) {
    alert('名前は必須です (Tên là bắt buộc)')
    return
  }

  saving.value = true
  try {
    // Đảm bảo null nếu chuỗi rỗng để Database không lưu rác
    const submitData = {
      name: form.name,
      name_romaji: form.name_romaji || null,
      bio: form.bio || null,
      avatar_url: form.avatar_url || null
    }

    if (isNew) {
      const { error } = await supabase.from('persons').insert([submitData])
      // Bắt lỗi trùng tên (do constraint UNIQUE dưới database)
      if (error && error.code === '23505') throw new Error('この名前は既に存在します (Tên này đã tồn tại trong hệ thống)')
      if (error) throw error
      
      alert('追加しました (Thêm thành công)')
      router.push('/admin/persons')
    } else {
      const { error } = await supabase.from('persons').update(submitData).eq('id', personId)
      if (error && error.code === '23505') throw new Error('この名前は既に存在します (Tên này đã tồn tại trong hệ thống)')
      if (error) throw error
      
      alert('更新しました (Cập nhật thành công)')
    }
  } catch (e: any) {
    alert('エラー: ' + e.message)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('本当に削除しますか？\n(Nếu bạn xóa, toàn bộ liên kết của diễn viên này với các bộ phim cũng sẽ bị gỡ bỏ)')) return
  
  saving.value = true
  try {
    const { error } = await supabase.from('persons').delete().eq('id', personId)
    if (error) throw error
    router.push('/admin/persons')
  } catch (e: any) {
    alert('エラー: ' + e.message)
    saving.value = false
  }
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>