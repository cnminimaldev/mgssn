<template>
  <div class="flex min-h-screen items-center justify-center bg-black text-white px-4">
    <main class="w-full max-w-md rounded-2xl bg-zinc-900/90 px-6 py-8 shadow-xl ring-1 ring-white/10">
      <div class="mb-6 flex rounded-lg bg-black/40 p-1 ring-1 ring-white/5">
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition-all"
          :class="!isRegister ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'"
          @click="switchMode(false)"
        >
          ログイン
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition-all"
          :class="isRegister ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'"
          @click="switchMode(true)"
        >
          新規登録
        </button>
      </div>

      <h1 class="text-xl font-bold tracking-tight sm:text-2xl text-center">
        {{ isRegister ? 'アカウント作成' : 'ログイン' }}
      </h1>
      <p class="mt-2 text-center text-xs text-zinc-400">
        {{ isRegister ? '以下の情報を入力して登録してください。' : 'ご登録のメールアドレスとパスワードを入力してください。' }}
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs text-zinc-300">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 w-full rounded-xl bg-black/60 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-emerald-400"
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label class="block text-xs text-zinc-300">パスワード</label>
          <input
            v-model="password"
            type="password"
            class="mt-1 w-full rounded-xl bg-black/60 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-emerald-400"
            placeholder="6文字以上"
            required
            minlength="6"
          />
        </div>

        <div v-if="isRegister" class="space-y-2 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
          <label class="block text-xs text-zinc-300">セキュリティチェック (Captcha)</label>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-24 items-center justify-center rounded bg-zinc-800 font-mono text-lg font-bold tracking-widest text-emerald-400 select-none">
              {{ captcha.a }} + {{ captcha.b }} = ?
            </div>
            <input
              v-model="userCaptcha"
              type="number"
              class="h-10 w-full rounded-md bg-black/60 px-3 text-center text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-emerald-400"
              placeholder="答えを入力"
              required
            />
            <button 
              type="button" 
              class="flex h-10 w-10 items-center justify-center rounded hover:bg-white/10"
              @click="generateCaptcha"
              title="別の問題"
            >
              ↺
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="rounded bg-red-900/20 p-3 text-xs text-red-400 ring-1 ring-red-500/20">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="rounded bg-emerald-900/20 p-3 text-xs text-emerald-400 ring-1 ring-emerald-500/20">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          class="mt-2 flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/50 transition-all"
          :disabled="submitting"
        >
          <span v-if="!submitting">
            {{ isRegister ? '登録する' : 'ログイン' }}
          </span>
          <span v-else>処理中...</span>
        </button>
      </form>

      <div class="mt-6 text-center text-[11px] text-zinc-500">
        <span v-if="isRegister">
          すでにアカウントをお持ちですか？ 
          <button type="button" class="text-emerald-400 hover:underline" @click="switchMode(false)">ログイン</button>
        </span>
        <span v-else>
          アカウントをお持ちでないですか？ 
          <button type="button" class="text-emerald-400 hover:underline" @click="switchMode(true)">新規登録</button>
        </span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, useSeoMeta, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

useSeoMeta({
  title: 'ログイン / 新規登録 - MugenTV',
  description: 'MugenTVへのログインまたは新規登録ページです。',
})

const route = useRoute()
const router = useRouter()
const { login, signup, isLoggedIn } = useAuth()

// State
const isRegister = ref(false)
const email = ref('')
const password = ref('')
const userCaptcha = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Captcha State
const captcha = ref({ a: 0, b: 0, answer: 0 })

// Redirect logic
const redirectPath = computed(() => {
  const q = route.query.redirect
  return typeof q === 'string' && q.length > 0 ? q : '/'
})

// Tự động redirect nếu đã login
watch(isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    await navigateTo(redirectPath.value)
  }
}, { immediate: true })

// Hàm tạo captcha đơn giản
const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) // 0-9
  const b = Math.floor(Math.random() * 10) // 0-9
  captcha.value = { a, b, answer: a + b }
  userCaptcha.value = ''
}

// Chuyển đổi mode
const switchMode = (mode: boolean) => {
  isRegister.value = mode
  errorMessage.value = ''
  successMessage.value = ''
  if (mode) {
    generateCaptcha()
  }
}

// Xử lý Submit
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validate Captcha nếu đang đăng ký
  if (isRegister.value) {
    if (parseInt(userCaptcha.value) !== captcha.value.answer) {
      errorMessage.value = '計算の答えが間違っています。'
      generateCaptcha()
      return
    }
  }

  submitting.value = true

  try {
    if (isRegister.value) {
      // --- ĐĂNG KÝ ---
      await signup(email.value, password.value)
      
      // Nếu Supabase bật "Confirm Email", user sẽ chưa login ngay được
      // Ta check xem đã login chưa (do trigger auto-confirm hoặc config tắt confirm)
      if (isLoggedIn.value) {
         await navigateTo(redirectPath.value)
      } else {
         successMessage.value = '確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。'
         // Clear form để tránh submit lại
         email.value = ''
         password.value = ''
      }
    } else {
      // --- ĐĂNG NHẬP ---
      await login(email.value, password.value)
      // Watcher `isLoggedIn` ở trên sẽ lo việc redirect
    }
  } catch (err: any) {
    console.error(err)
    if (isRegister.value) {
      errorMessage.value = err?.message || '登録に失敗しました。別のメールアドレスをお試しください。'
    } else {
      errorMessage.value = 'メールアドレスまたはパスワードが間違っています。'
    }
    // Nếu lỗi, reset captcha để an toàn
    if (isRegister.value) generateCaptcha()
  } finally {
    submitting.value = false
  }
}

// Init captcha khi vào trang (nếu lỡ reload ở mode register)
onMounted(() => {
  if (isRegister.value) generateCaptcha()
})
</script>