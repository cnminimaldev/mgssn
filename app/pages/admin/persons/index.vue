<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">人物管理 (Persons)</h1>
          <p class="text-sm text-zinc-400 mt-1">俳優や監督のデータを管理します。</p>
        </div>
        <NuxtLink
          to="/admin/persons/new"
          class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>新規追加</span>
        </NuxtLink>
      </div>

      <!-- Search Bar -->
      <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="名前で検索... (Tìm kiếm theo tên)"
            class="w-full bg-black border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            @keydown.enter="fetchPersons"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 absolute left-3 top-2.5 text-zinc-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <button
          @click="fetchPersons"
          class="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          検索
        </button>
      </div>

      <!-- Table -->
      <div class="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-black/40 border-b border-white/5 text-zinc-400">
              <tr>
                <th class="px-6 py-4 font-medium w-16">ID</th>
                <th class="px-6 py-4 font-medium w-24">画像</th>
                <th class="px-6 py-4 font-medium">名前</th>
                <th class="px-6 py-4 font-medium hidden md:table-cell">Romaji</th>
                <th class="px-6 py-4 font-medium text-right">アクション</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">読み込み中...</td>
              </tr>
              <tr v-else-if="!persons.length">
                <td colspan="5" class="px-6 py-10 text-center text-zinc-500">データが見つかりません。</td>
              </tr>
              <tr v-else v-for="person in persons" :key="person.id" class="hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4 text-zinc-500">#{{ person.id }}</td>
                <td class="px-6 py-4">
                  <div class="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                    <img v-if="person.avatar_url" :src="person.avatar_url" class="h-full w-full object-cover" />
                    <span v-else class="text-xs font-bold text-zinc-500">{{ person.name.charAt(0) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 font-medium text-zinc-200">{{ person.name }}</td>
                <td class="px-6 py-4 text-zinc-400 hidden md:table-cell">{{ person.name_romaji || '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <NuxtLink
                      :to="`/admin/persons/${person.id}`"
                      class="text-emerald-400 hover:text-emerald-300 transition"
                    >
                      編集
                    </NuxtLink>
                    <button
                      @click="deletePerson(person.id, person.name)"
                      class="text-rose-400 hover:text-rose-300 transition"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20">
          <p class="text-xs text-zinc-500">全 {{ total }} 件</p>
          <div class="flex gap-2">
            <button
              :disabled="page === 1"
              @click="page--; fetchPersons()"
              class="px-3 py-1.5 rounded bg-zinc-800 text-xs disabled:opacity-50 hover:bg-zinc-700 transition"
            >
              前へ
            </button>
            <button
              :disabled="page * pageSize >= total"
              @click="page++; fetchPersons()"
              class="px-3 py-1.5 rounded bg-zinc-800 text-xs disabled:opacity-50 hover:bg-zinc-700 transition"
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { definePageMeta, useSupabaseClient } from '#imports'

definePageMeta({
  middleware: 'admin'
})

const supabase = useSupabaseClient<any>()

const persons = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

const page = ref(1)
const pageSize = 20
const total = ref(0)

const fetchPersons = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('persons')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })

    if (searchQuery.value) {
      query = query.ilike('name', `%${searchQuery.value}%`)
      page.value = 1 // Reset page when searching
    }

    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) throw error
    persons.value = data || []
    total.value = count || 0
  } catch (err: any) {
    alert('エラー: ' + err.message)
  } finally {
    loading.value = false
  }
}

const deletePerson = async (id: number, name: string) => {
  if (!confirm(`「${name}」を削除してもよろしいですか？\n(Nếu bạn xóa, toàn bộ liên kết của diễn viên này với các bộ phim cũng sẽ bị gỡ bỏ)`)) return
  
  try {
    const { error } = await supabase.from('persons').delete().eq('id', id)
    if (error) throw error
    await fetchPersons()
  } catch (err: any) {
    alert('削除エラー: ' + err.message)
  }
}

onMounted(() => {
  fetchPersons()
})
</script>