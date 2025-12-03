export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    public: {
      adminEmails: [
        'mugentvjp@gmail.com', // đổi thành email của bạn
        // thêm email khác nếu muốn
      ],
    },
  },
})
