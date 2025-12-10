<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/admin" class="text-xs text-emerald-400 hover:underline mb-2 block">
            &larr; 管理画面に戻る (Back to Admin)
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">ユーザー管理 (User Management)</h1>
          <p class="text-sm text-zinc-400 mt-1">
            全ユーザー: {{ users.length }}名
          </p>
        </div>
        <button 
          @click="() => refresh()" 
          class="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition text-white"
          title="Reload"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div v-if="pending" class="py-20 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"></div>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <th class="px-6 py-4 font-medium">Email</th>
                <th class="px-6 py-4 font-medium">ID</th>
                <th class="px-6 py-4 font-medium">Created At</th>
                <th class="px-6 py-4 font-medium">Role</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="u in users" 
                :key="u.id" 
                class="hover:bg-white/5 transition-colors"
              >
                <td class="px-6 py-4 text-white font-medium">
                  {{ u.email }}
                  <span v-if="currentUser?.id === u.id" class="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">YOU</span>
                </td>

                <td class="px-6 py-4 font-mono text-xs text-zinc-500">
                  {{ u.id }}
                </td>

                <td class="px-6 py-4 text-zinc-400">
                  {{ u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP') : '-' }}
                </td>

                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                    :class="u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'"
                  >
                    {{ u.role.toUpperCase() }}
                  </span>
                </td>

                <td class="px-6 py-4 text-right">
                  <div v-if="currentUser?.id !== u.id" class="flex items-center justify-end gap-3">
                    
                    <select 
                      :value="u.role" 
                      @change="(e) => confirmChangeRole(u, (e.target as HTMLSelectElement).value)"
                      class="bg-black border border-zinc-700 text-xs rounded px-2 py-1 focus:border-emerald-500 outline-none text-zinc-300 cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button 
                      @click="confirmDeleteUser(u)"
                      class="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition border border-red-500/20"
                      title="ユーザーを削除 (Delete User)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useSupabaseUser, definePageMeta, useSupabaseClient } from '#imports'

definePageMeta({
  middleware: 'admin'
})

const currentUser = useSupabaseUser()
const supabase = useSupabaseClient() // Dùng client này để lấy session token

// 1. Định nghĩa kiểu dữ liệu
type AdminUser = {
  id: string
  email: string
  role: string
  created_at: string
}

// 2. Lấy Token từ session hiện tại
const { data: sessionData } = await supabase.auth.getSession()
const token = sessionData.session?.access_token

// 3. Fetch Data (Gửi kèm Token để tránh lỗi 403/401)
const { data: usersData, pending, refresh } = await useFetch<AdminUser[]>('/api/admin/users', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

const users = computed(() => usersData.value || [])

// 4. Hàm đổi quyền (Change Role)
const confirmChangeRole = async (userRow: AdminUser, newRole: string) => {
  if (!confirm(`${userRow.email} の権限を "${newRole}" に変更しますか？`)) {
    refresh() // Reset lại select nếu hủy
    return
  }

  try {
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: { id: userRow.id, role: newRole },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    // Cập nhật UI ngay lập tức
    userRow.role = newRole
    alert('変更しました (Updated successfully)')
  } catch (e: any) {
    alert('エラー: ' + e.message)
    refresh() // Rollback nếu lỗi
  }
}

// 5. Hàm xóa user (Delete User)
const confirmDeleteUser = async (userRow: AdminUser) => {
  if (!confirm(`本当に削除しますか？ (Delete ${userRow.email}?)\nこの操作は取り消せません。`)) {
    return
  }

  try {
    // Gọi API xóa (method DELETE)
    // Lưu ý: Bạn phải có file server/api/admin/users.delete.ts để xử lý request này
    await $fetch('/api/admin/users', {
      method: 'DELETE',
      body: { id: userRow.id },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    alert('削除しました (Deleted successfully)')
    refresh() // Tải lại danh sách
  } catch (e: any) {
    alert('エラー: ' + e.message)
  }
}
</script>