<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">管理ダッシュボード</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画の登録・編集や各種マスターデータの管理を行います。
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink
            to="/admin/series"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-400 transition"
          >
            シリーズ管理
          </NuxtLink>

          <NuxtLink
            to="/admin/countries"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-400 transition"
          >
            国・地域
          </NuxtLink>

          <NuxtLink
            to="/admin/genres"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-400 transition"
          >
            ジャンル
          </NuxtLink>

          <NuxtLink
            to="/admin/providers"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-400 transition"
          >
            プロバイダー
          </NuxtLink>

          <NuxtLink
            to="/admin/movies/new"
            class="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 transition"
          >
            ＋ 映画を追加
          </NuxtLink>
        </div>
      </div>

      <div class="mb-6 grid gap-4 rounded-lg border border-white/5 bg-zinc-950/70 p-4 md:grid-cols-[1fr,auto]">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full rounded-md border border-zinc-700 bg-zinc-900 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="タイトル、原題、かな..."
            @keydown.enter="page = 1" 
          />
          <span class="absolute left-3 top-2.5 text-zinc-500">🔍</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-400">並び替え:</span>
          <select
            v-model="sortOrder"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="newest">作成日 (新しい順)</option>
            <option value="oldest">作成日 (古い順)</option>
            <option value="year_desc">公開年 (新しい順)</option>
            <option value="title_asc">タイトル (A-Z)</option>
          </select>
        </div>
      </div>

      <div class="rounded-lg border border-white/5 bg-zinc-950/70 overflow-hidden">
        <div v-if="pending" class="py-12 text-center text-sm text-zinc-400">
          読み込み中...
        </div>

        <div v-else-if="error" class="py-12 text-center text-sm text-red-400">
          {{ error.message }}
        </div>

        <div v-else>
          <div v-if="movies.length === 0" class="py-12 text-center text-sm text-zinc-400">
            条件に一致する映画が見つかりませんでした。
          </div>

          <table v-else class="w-full text-left text-sm">
            <thead class="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <th class="px-4 py-3">ポスター</th>
                <th class="px-4 py-3">タイトル / 原題</th>
                <th class="px-4 py-3">公開年 / 国</th>
                <th class="px-4 py-3 text-center">注目</th>
                <th class="px-4 py-3 text-right">アクション</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="movie in movies" :key="movie.id" class="group hover:bg-white/5 transition">
                <td class="px-4 py-3 w-16">
                  <div class="h-16 w-12 overflow-hidden rounded bg-zinc-800 shrink-0">
                    <img
                      v-if="movie.poster_url"
                      :src="movie.poster_url"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-[8px] text-zinc-500">
                      NO IMG
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="font-medium text-zinc-100 line-clamp-1">{{ movie.title }}</div>
                  <div class="text-xs text-zinc-500 line-clamp-1">{{ movie.original_title || '-' }}</div>
                  <div class="mt-1 text-[10px] text-zinc-600 font-mono">{{ movie.slug }}</div>
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-zinc-300">{{ movie.year }}年</div>
                  <div class="text-xs text-zinc-500">{{ movie.origin_country }}</div>
                </td>

                <td class="px-4 py-3 text-center">
                  <span 
                    v-if="movie.is_featured" 
                    class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                  >
                    Featured
                  </span>
                  <span v-else class="text-xs text-zinc-600">-</span>
                </td>

                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <NuxtLink
                      :to="`/movie/${movie.slug}`"
                      target="_blank"
                      class="text-zinc-400 hover:text-zinc-100"
                      title="プレビュー"
                    >
                      ↗
                    </NuxtLink>
                    <NuxtLink
                      :to="`/admin/movies/${movie.id}/collections`"
                      class="text-emerald-400 hover:text-emerald-300"
                    >
                      Collections
                    </NuxtLink>
                    <NuxtLink
                      :to="`/admin/movies/${movie.id}`"
                      class="rounded bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
                    >
                      編集
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-4">
        <button
          class="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800 disabled:opacity-50"
          :disabled="page <= 1"
          @click="page--"
        >
          前へ
        </button>
        <span class="text-xs text-zinc-400">{{ page }} / {{ totalPages }}</span>
        <button
          class="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800 disabled:opacity-50"
          :disabled="page >= totalPages"
          @click="page++"
        >
          次へ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSupabaseClient, useAsyncData } from '#imports'

const supabase = useSupabaseClient<any>()

// State
const page = ref(1)
const pageSize = 20
const searchQuery = ref('')
const sortOrder = ref('newest')

// Hàm convert Katakana -> Hiragana (để search tiếng Nhật tốt hơn)
const toHiragana = (input: string) => {
  return input.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
}

// Fetch Data (Movies List)
const { data, pending, error, refresh } = await useAsyncData(
  'admin-movies-list',
  async () => {
    let query = supabase
      .from('movies')
      .select('id, title, original_title, slug, year, origin_country, poster_url, is_featured, created_at', { count: 'exact' })

    // Search nâng cao: title, title_kana, original_title
    if (searchQuery.value) {
      const q = searchQuery.value
      const k = toHiragana(q)
      query = query.or(`title.ilike.%${q}%,title_kana.ilike.%${k}%,original_title.ilike.%${q}%`)
    }

    // Sort
    if (sortOrder.value === 'newest') query = query.order('created_at', { ascending: false })
    if (sortOrder.value === 'oldest') query = query.order('created_at', { ascending: true })
    if (sortOrder.value === 'year_desc') query = query.order('year', { ascending: false })
    if (sortOrder.value === 'title_asc') query = query.order('title', { ascending: true })

    // Pagination
    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { movies: data, count }
  },
  {
    watch: [page, sortOrder]
  }
)

// Debounce Search
let timer: any = null
watch(searchQuery, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    refresh()
  }, 500)
})

const movies = computed(() => data.value?.movies ?? [])
const totalCount = computed(() => data.value?.count ?? 0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))
</script>