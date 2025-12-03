<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">国・地域の管理</h1>
          <p class="mt-1 text-xs text-zinc-400">
            作品の製作国として使用する国・地域コードを管理します。
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="text-sm text-zinc-400 hover:text-zinc-200"
        >
          管理トップへ戻る
        </NuxtLink>
      </div>

      <div class="grid gap-6 md:grid-cols-[2fr,3fr]">
        <!-- 左: 一覧 -->
        <div>
          <div
            class="mb-3 flex items-center justify-between text-xs text-zinc-400"
          >
            <span>登録済みの国・地域</span>
            <span v-if="countries.length">{{ countries.length }} 件</span>
          </div>

          <div
            class="overflow-hidden rounded-lg border border-white/5 bg-zinc-950/70"
          >
            <div
              v-if="loading"
              class="px-3 py-6 text-center text-sm text-zinc-400"
            >
              読み込み中…
            </div>

            <div
              v-else-if="errorMessage"
              class="px-3 py-6 text-center text-sm text-red-400"
            >
              {{ errorMessage }}
            </div>

            <div v-else>
              <div
                v-if="!countries.length"
                class="px-3 py-6 text-center text-sm text-zinc-400"
              >
                国・地域がまだ登録されていません。
              </div>

              <ul v-else class="divide-y divide-white/5 text-sm">
                <li
                  v-for="c in countriesSorted"
                  :key="c.code"
                  class="flex items-center justify-between px-3 py-2.5"
                >
                  <button
                    type="button"
                    class="flex flex-1 flex-col items-start text-left"
                    @click="editFromCountry(c)"
                  >
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-zinc-50">
                        {{ c.name_ja }}
                      </span>
                      <span
                        class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                      >
                        {{ c.code }}
                      </span>
                      <span
                        v-if="!c.is_active"
                        class="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] text-red-200"
                      >
                        無効
                      </span>
                    </div>
                    <div class="mt-0.5 text-[11px] text-zinc-400">
                      {{ c.name }}
                    </div>
                  </button>

                  <div class="flex items-center gap-2 pl-2">
                    <button
                      type="button"
                      class="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 hover:border-zinc-400"
                      @click="toggleActive(c)"
                    >
                      {{ c.is_active ? '無効にする' : '有効にする' }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右: フォーム -->
        <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
          <h2 class="mb-3 text-sm font-semibold text-zinc-100">
            {{ isEditing ? '国・地域を編集' : '新しい国・地域を追加' }}
          </h2>

          <form class="space-y-3" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                コード (ISO 2文字)
              </label>
              <input
                v-model="form.code"
                :disabled="isEditing"
                type="text"
                class="w-32 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm uppercase text-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-900/60"
                placeholder="JP / US / KR"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                名前 (英語)
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
                placeholder="Japan"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                名前 (日本語)
              </label>
              <input
                v-model="form.name_ja"
                type="text"
                class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
                placeholder="日本"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-zinc-300">
                表示順 (sort_order)
              </label>
              <input
                v-model.number="form.sort_order"
                type="number"
                class="w-32 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                id="country-active"
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
              />
              <label
                for="country-active"
                class="text-xs text-zinc-300"
              >
                有効（検索フィルターなどに表示）
              </label>
            </div>

            <div
              v-if="formMessage"
              class="text-xs"
              :class="formError ? 'text-red-400' : 'text-emerald-400'"
            >
              {{ formMessage }}
            </div>

            <div class="flex gap-2 pt-1">
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ submitting ? '保存中…' : isEditing ? '更新する' : '追加する' }}
              </button>
              <button
                v-if="isEditing"
                type="button"
                class="inline-flex items-center rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-300"
                @click="resetForm"
              >
                新規作成モードに戻る
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSupabaseClient } from '#imports'

type CountryRow = {
  code: string
  name: string
  name_ja: string
  sort_order: number | null
  is_active: boolean | null
}

const supabase = useSupabaseClient<any>()

const countries = ref<CountryRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const form = reactive({
  code: '',
  name: '',
  name_ja: '',
  sort_order: 0 as number | null,
  is_active: true,
})

const isEditing = computed(() => !!form.code)
const submitting = ref(false)
const formMessage = ref('')
const formError = ref(false)

const loadCountries = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('code, name, name_ja, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name_ja', { ascending: true })

    if (error) {
      errorMessage.value = error.message
      return
    }

    countries.value = data ?? []
  } finally {
    loading.value = false
  }
}

const countriesSorted = computed(() => countries.value ?? [])

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.name_ja = ''
  form.sort_order = 0
  form.is_active = true
  formMessage.value = ''
  formError.value = false
}

const editFromCountry = (c: CountryRow) => {
  form.code = c.code
  form.name = c.name
  form.name_ja = c.name_ja
  form.sort_order = c.sort_order ?? 0
  form.is_active = c.is_active ?? true
  formMessage.value = ''
  formError.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  formMessage.value = ''
  formError.value = false

  try {
    if (!form.code.trim() || !form.name.trim() || !form.name_ja.trim()) {
      formMessage.value = 'コード / 名前 は必須です。'
      formError.value = true
      return
    }

    const code = form.code.trim().toUpperCase()

    const payload = {
      code,
      name: form.name.trim(),
      name_ja: form.name_ja.trim(),
      sort_order: form.sort_order ?? 0,
      is_active: form.is_active,
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('countries')
        .update(payload)
        .eq('code', code)

      if (error) {
        formMessage.value = error.message
        formError.value = true
        return
      }

      formMessage.value = '国・地域を更新しました。'
    } else {
      const { error } = await supabase.from('countries').insert(payload)

      if (error) {
        formMessage.value = error.message
        formError.value = true
        return
      }

      formMessage.value = '国・地域を追加しました。'
    }

    await loadCountries()
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (c: CountryRow) => {
  const newActive = !(c.is_active ?? true)
  const { error } = await supabase
    .from('countries')
    .update({ is_active: newActive })
    .eq('code', c.code)

  if (error) {
    alert('更新に失敗しました: ' + error.message)
    return
  }
  await loadCountries()
}

// load lần đầu
loadCountries()
</script>
