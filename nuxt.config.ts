// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@nuxtjs/sitemap", // Đảm bảo module này nằm sau cùng hoặc ở vị trí hợp lý
  ],

  // 1. Cấu hình Domain chính thức (Sửa lỗi URL localhost)
  site: {
    // Thay bằng domain thật của bạn (VD: https://mugenstream.com)
    // Khi chạy local dev, nó vẫn có thể hiện localhost, nhưng khi build/deploy nó sẽ dùng link này
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-production-domain.com',
  },

  // 2. Cấu hình Sitemap
  sitemap: {
    // Nạp link động từ API bạn vừa viết
    sources: ['/api/sitemap/urls'],

    // Chặn các trang không muốn Google index (Sửa lỗi hiện admin)
    exclude: [
      '/admin/**',       // Chặn toàn bộ thư mục admin
      '/admin',          // Chặn trang chủ admin
      '/my-list',        // Trang cá nhân (cần login mới xem được -> không index)
      '/login',          // Trang đăng nhập
      '/confirm',        // Trang xác thực
      '/secret-page'     // Các trang ẩn khác...
    ],
    
    // Tùy chọn: Tần suất quét mặc định cho các trang tĩnh (như home)
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date().toISOString(),
    },
  },

  // Các cấu hình cũ của bạn (Giữ nguyên)
  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-production-domain.com',
    }
  },

  compatibilityDate: "2024-12-08",
});