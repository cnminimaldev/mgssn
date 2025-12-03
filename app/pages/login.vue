<template>
  <div class="flex min-h-screen items-center justify-center bg-black text-white">
    <main class="w-full max-w-md rounded-2xl bg-zinc-900/90 px-6 py-8 shadow-xl ring-1 ring-white/10">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">
        ログイン
      </h1>
      <p class="mt-1 text-xs text-zinc-400 sm:text-sm">
        ご登録のメールアドレスとパスワードを入力してください。
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs text-zinc-300">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 w-full rounded-xl bg-black/60 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-emerald-400"
            required
          />
        </div>

        <div>
          <label class="block text-xs text-zinc-300">パスワード</label>
          <input
            v-model="password"
            type="password"
            class="mt-1 w-full rounded-xl bg-black/60 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-emerald-400"
            required
          />
        </div>

        <p
          v-if="errorMessage"
          class="mt-1 text-xs text-red-400"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="mt-2 flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
          :disabled="submitting"
        >
          <span v-if="!submitting">ログイン</span>
          <span v-else>処理中...</span>
        </button>
      </form>

      <p class="mt-4 text-[11px] text-zinc-500">
        ※ デモ環境のため、任意のメールアドレスとパスワードでログインできます。
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, useSeoMeta } from '#imports'
import { useAuth } from '~/composables/useAuth'

// SEO
useSeoMeta({
  title: 'ログイン - MyStream',
  description: 'MyStreamへのログインページです。',
})

const route = useRoute()
const router = useRouter()
const { login, isLoggedIn } = useAuth()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const redirect = computed(() => {
  const q = route.query.redirect
  return typeof q === 'string' && q.length > 0 ? q : '/'
})

if (isLoggedIn.value) {
  router.replace(redirect.value)
}

const handleSubmit = async () => {
  errorMessage.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    await router.replace(redirect.value)
  } catch (err: any) {
    errorMessage.value =
      err?.message || 'ログインに失敗しました。もう一度お試しください。'
  } finally {
    submitting.value = false
  }
}
</script>
