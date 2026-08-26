import { defineNuxtPlugin } from '#app'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Đăng ký component QuillEditor ở mức toàn cục (Global)
  nuxtApp.vueApp.component('QuillEditor', QuillEditor)
})