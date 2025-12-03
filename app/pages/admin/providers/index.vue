<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">コレクションプロバイダー管理</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画コレクションとシリーズコレクションで共通して利用する配信プロバイダーを管理します。
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="text-xs text-zinc-400 hover:text-zinc-200"
        >
          ダッシュボードへ戻る
        </NuxtLink>
      </div>

      <!-- Form tạo / sửa provider -->
      <div class="mb-6 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-medium">
            {{ editingId ? 'プロバイダーを編集' : '新しいプロバイダーを追加' }}
          </h2>
          <button
            v-if="editingId"
            type="button"
            class="text-xs text-zinc-400 hover:text-zinc-200"
            @click="resetForm"
          >
            新規作成モードに戻る
          </button>
        </div>

        <form class="grid gap-3 md:grid-cols-2" @submit.prevent="handleSave">
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-zinc-300">名前</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: MovieHost.jp / MyStream HLS"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-300">コード (任意)</label>
            <input
              v-model="form.code"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="例: moviehost / mystream"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-zinc-300">WebサイトURL (任意)</label>
            <input
              v-model="form.website_url"
              type="text"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-zinc-300">メモ (任意)</label>
            <textarea
              v-model="form.note"
              rows="2"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
              placeholder="契約プラン、利用条件、備考など"
            />
          </div>

          <div class="md:col-span-2 flex items-center justify-between pt-1">
            <label class="inline-flex items-center gap-2 text-xs text-zinc-300">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="rounded border-zinc-600 bg-zinc-900"
              />
              有効なプロバイダーとして扱う
            </label>

            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center rounded-md bg-emerald-500 px-4 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ saving ? '保存中…' : (editingId ? '更新する' : '追加する') }}
            </button>
          </div>

          <p v-if="saveError" class="md:col-span-2 text-xs text-red-400">
            {{ saveError }}
          </p>
          <p v-if="saveSuccess" class="md:col-span-2 text-xs text-emerald-400">
            {{ saveSuccess }}
          </p>
        </form>
      </div>

      <!-- Danh sách providers -->
      <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div class="mb-3 flex items-center justify-between text-xs text-zinc-400">
          <span>登録済みプロバイダー</span>
          <span v-if="providers.length">{{ providers.length }} 件</span>
        </div>

        <div v-if="loading" class="py-8 text-center text-sm text-zinc-400">
          読み込み中…
        </div>

        <div v-else-if="loadError" class="py-8 text-center text-sm text-red-400">
          {{ loadError }}
        </div>

        <div v-else>
          <div v-if="!providers.length" class="py-8 text-center text-sm text-zinc-400">
            プロバイダーがまだ登録されていません。上のフォームから追加してください。
          </div>

          <ul v-else class="divide-y divide-white/5 text-sm">
            <li
              v-for="p in providers"
              :key="p.id"
              class="flex items-center justify-between gap-3 py-2.5"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-zinc-50">
                    {{ p.name }}
                  </p>
                  <span
                    v-if="p.code"
                    class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                  >
                    {{ p.code }}
                  </span>
                  <span
                    v-if="!p.is_active"
                    class="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-300"
                  >
                    inactive
                  </span>
                </div>
                <div class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  <a
                    v-if="p.website_url"
                    :href="p.website_url"
                    target="_blank"
                    rel="noreferrer"
                    class="hover:text-zinc-200 underline underline-offset-2"
                  >
                    {{ p.website_url }}
                  </a>
                  <span v-if="p.note">
                    {{ p.note }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 text-xs">
                <button
                  type="button"
                  class="text-emerald-300 hover:text-emerald-200"
                  @click="startEdit(p)"
                >
                  編集
                </button>
                <button
                  type="button"
                  class="text-red-400 hover:text-red-300"
                  @click="confirmDelete(p)"
                >
                  削除
                </button>
              </div>
            </li>
          </ul>

          <p class="mt-4 text-[11px] text-zinc-500">
            ※ プロバイダーを削除すると、そのプロバイダーに紐づく映画コレクション・シリーズコレクション
            （およびパート・エピソード）が <span class="text-red-300">すべて削除</span> されます。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSupabaseClient } from '#imports'

type ProviderRow = {
  id: number
  name: string
  code: string | null
  website_url: string | null
  note: string | null
  is_active: boolean | null
}

const supabase = useSupabaseClient<any>()

const providers = ref<ProviderRow[]>([])
const loading = ref(true)
const loadError = ref('')

const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  code: '',
  website_url: '',
  note: '',
  is_active: true,
})

const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.code = ''
  form.website_url = ''
  form.note = ''
  form.is_active = true
  saveError.value = ''
  saveSuccess.value = ''
}

const loadProviders = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('collection_providers')
      .select('id, name, code, website_url, note, is_active')
      .order('created_at', { ascending: true })

    if (error) {
      loadError.value = error.message
      return
    }

    providers.value = (data ?? []) as ProviderRow[]
  } finally {
    loading.value = false
  }
}

const startEdit = (p: ProviderRow) => {
  editingId.value = p.id
  form.name = p.name
  form.code = p.code ?? ''
  form.website_url = p.website_url ?? ''
  form.note = p.note ?? ''
  form.is_active = p.is_active ?? true
  saveError.value = ''
  saveSuccess.value = ''
}

const handleSave = async () => {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    const payload = {
      name: form.name,
      code: form.code || null,
      website_url: form.website_url || null,
      note: form.note || null,
      is_active: form.is_active,
    }

    if (editingId.value) {
      const { error } = await supabase
        .from('collection_providers')
        .update(payload)
        .eq('id', editingId.value)

      if (error) {
        saveError.value = error.message
        return
      }

      saveSuccess.value = 'プロバイダーを更新しました。'
    } else {
      const { error } = await supabase
        .from('collection_providers')
        .insert(payload)

      if (error) {
        saveError.value = error.message
        return
      }

      saveSuccess.value = 'プロバイダーを追加しました。'
      resetForm()
    }

    await loadProviders()
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (p: ProviderRow) => {
  const ok = window.confirm(
    `本当にこのプロバイダー「${p.name}」を削除しますか？\n\n` +
      'この操作により、このプロバイダーに紐づく映画コレクション・シリーズコレクション ' +
      '（およびそれらのパート・エピソード）がすべて削除されます。',
  )

  if (!ok) return

  const { error } = await supabase
    .from('collection_providers')
    .delete()
    .eq('id', p.id)

  if (error) {
    window.alert(`削除に失敗しました: ${error.message}`)
    return
  }

  if (editingId.value === p.id) {
    resetForm()
  }

  await loadProviders()
}

await loadProviders()
</script>
