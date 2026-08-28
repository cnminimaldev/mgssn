// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@nuxtjs/sitemap", // Đảm bảo module này nằm sau cùng hoặc ở vị trí hợp lý
  ],

  sourcemap: {
    server: false,
    client: false
  },

  build: {
    transpile: ['@vueup/vue-quill']
  },

  vite: {
    esbuild: {
      // Đã sửa lại lỗi logic để tự động xóa console và debugger khi build production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },

  // 1. Cấu hình Domain chính thức (Sửa lỗi URL localhost)
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://noritv.com',
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },

  // ==========================================
  // CẤU HÌNH CACHE (TĂNG TỐC ĐỘ TẢI TRANG)
  // ==========================================
  routeRules: {
    // Cache trang chủ trong 60 giây
    '/': { swr: 60 },
    
    // Cache các trang danh sách, tìm kiếm, bảng xếp hạng trong 5 phút
    '/search': { swr: 300 },
    '/ranking': { swr: 300 },
    '/genres/**': { swr: 300 },

    // Cache trang chi tiết phim trong 1 giờ (giảm tối đa request lên Supabase)
    '/movie/**': { swr: 3600 },
    '/series/**': { swr: 3600 },
    
    // Bỏ qua cache hoàn toàn, ép load client-side cho các trang riêng tư/quản trị
    '/admin/**': { ssr: false }, 
    '/admin': { ssr: false },
    '/my-list': { swr: false, cache: false },
    '/login': { swr: false, cache: false },
  },

  // 2. Cấu hình Sitemap
  sitemap: {
    sources: ['/api/sitemap/urls'],
    exclude: [
      '/admin/**',
      '/admin',
      '/my-list',
      '/login',
      '/confirm',
      '/secret-page'
    ],
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date().toISOString(),
    },
  },

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://noritv.com',
      streamUrl: process.env.NUXT_PUBLIC_STREAM_URL || '',
    }
  },

  compatibilityDate: "2024-12-08",
});