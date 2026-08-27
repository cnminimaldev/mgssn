<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-8 bg-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm mt-8">
      
      <div class="text-center">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">お問い合わせ (Liên hệ)</h2>
        <p class="mt-2 text-xs sm:text-sm text-zinc-400">作品のリクエストや不具合の報告などはこちらから</p>
      </div>

      <!-- Màn hình hiển thị khi Gửi Thành Công -->
      <div v-if="isSuccess" class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-center transition-all">
        <div class="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="font-bold text-lg">送信完了しました！</p>
        <p class="text-sm mt-2 text-zinc-300">メッセージありがとうございます。確認次第、対応させていただきます。<br>(Cám ơn bạn đã gửi tin nhắn. Chúng tôi sẽ kiểm tra và xử lý sớm nhất có thể.)</p>
        
        <button @click="resetForm" class="mt-6 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
          別のメッセージを送る (Gửi tin nhắn khác)
        </button>
      </div>

      <!-- Form nhập liệu chính -->
      <form v-else @submit.prevent="submitForm" class="space-y-5">
        
        <!-- Trường Tên/Biệt danh -->
        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">お名前 / ニックネーム (Biệt danh)</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none" 
            placeholder="例: ムゲン太郎 (Ví dụ: Mugen Taro)"
          >
        </div>

        <!-- Dropdown Lý do -->
        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">お問い合わせの種類 (Lý do liên hệ)</label>
          <div class="relative">
            <select 
              v-model="form.reason" 
              required 
              class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled selected>選択してください (Vui lòng chọn)</option>
              <option value="作品追加リクエスト">作品追加リクエスト (Yêu cầu thêm tác phẩm)</option>
              <option value="不具合の報告">不具合の報告 (Báo lỗi hệ thống/video)</option>
              <option value="その他">その他 (Lý do khác)</option>
            </select>
            <!-- Icon mũi tên cho dropdown -->
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <!-- Tiêu đề -->
        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">件名 (Tiêu đề)</label>
          <input 
            v-model="form.title" 
            type="text" 
            required 
            class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none" 
            placeholder="例: 〇〇という映画を追加してほしい"
          >
        </div>

        <!-- Nội dung -->
        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">お問い合わせ内容 (Nội dung)</label>
          <textarea 
            v-model="form.content" 
            required 
            rows="5" 
            class="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none resize-none" 
            placeholder="詳しくご記入ください... (Vui lòng nhập chi tiết)"
          ></textarea>
        </div>

        <!-- Math Captcha Chống Spam (Tự động tạo phép tính cộng) -->
        <div class="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1">
            <label class="block text-sm font-bold text-zinc-300 mb-1">スパム防止 (Xác thực chống Spam)</label>
            <p class="text-xs text-zinc-500">以下の計算の答えを入力してください。<br>(Vui lòng nhập kết quả của phép tính bên cạnh)</p>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <span class="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 whitespace-nowrap">
              {{ captcha.num1 }} + {{ captcha.num2 }} = 
            </span>
            <input 
              v-model.number="captcha.answer" 
              type="number" 
              required 
              class="w-24 bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-white text-center font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="?"
            >
          </div>
        </div>
        
        <!-- Hiển thị lỗi nếu nhập sai Captcha -->
        <p v-if="captchaError" class="text-rose-400 text-sm font-medium text-right animate-pulse">{{ captchaError }}</p>

        <!-- Nút Gửi đi -->
        <button 
          type="submit" 
          :disabled="isSubmitting" 
          class="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-zinc-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ isSubmitting ? '送信中... (Đang gửi...)' : '送信する (Gửi tin nhắn)' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

// Khởi tạo các biến để lưu trữ dữ liệu người dùng nhập
const form = reactive({ name: '', reason: '', title: '', content: '' })
const isSubmitting = ref(false)
const isSuccess = ref(false)

// Khởi tạo logic cho Captcha toán học
const captcha = reactive({ num1: 0, num2: 0, answer: null as number | null })
const captchaError = ref('')

// Hàm tạo phép tính cộng ngẫu nhiên từ 1 đến 10
const generateCaptcha = () => {
  captcha.num1 = Math.floor(Math.random() * 10) + 1
  captcha.num2 = Math.floor(Math.random() * 10) + 1
  captcha.answer = null
  captchaError.value = ''
}

// Chạy hàm tạo Captcha ngay khi load trang
onMounted(() => {
  generateCaptcha()
})

// Hàm xử lý khi người dùng bấm nút Gửi
const submitForm = async () => {
  // 1. Kiểm tra xem người dùng có nhập đúng Captcha không
  if (captcha.answer !== (captcha.num1 + captcha.num2)) {
    captchaError.value = '計算が間違っています。もう一度お試しください。 (Sai kết quả, vui lòng nhập lại)'
    generateCaptcha() // Bắt người dùng tính câu mới nếu nhập sai
    return
  }

  isSubmitting.value = true
  captchaError.value = ''

  // 2. Gửi dữ liệu lên bảng 'contact_messages' trong Supabase
  const { error } = await supabase.from('contact_messages').insert([{
    name: form.name,
    reason: form.reason,
    title: form.title,
    content: form.content
  }])

  isSubmitting.value = false

  // 3. Xử lý kết quả trả về
  if (!error) {
    isSuccess.value = true // Hiển thị màn hình thành công
  } else {
    alert('エラーが発生しました。時間をおいて再度お試しください。 (Có lỗi xảy ra, vui lòng thử lại sau)')
    console.error(error)
  }
}

// Hàm reset Form để gửi tin nhắn mới
const resetForm = () => {
  form.name = ''
  form.reason = ''
  form.title = ''
  form.content = ''
  isSuccess.value = false
  generateCaptcha()
}
</script>