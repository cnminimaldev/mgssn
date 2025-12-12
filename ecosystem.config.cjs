// File: /var/www/mugentv/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'mugentv',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max', // Tận dụng hết core CPU
      script: './.output/server/index.mjs', // Đường dẫn file chạy sau khi build
      env: {
        NODE_ENV: 'production',
        NUXT_PUBLIC_SITE_URL: 'https://mugentv.com',
        // Điền Key Supabase của bạn vào đây
        SUPABASE_URL: 'https://api.mugentv.com',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiYXVkIjoiYXV0aGVudGljYXRlZCJ9.IZicfGNGV2-jcsik_rRWGIAMDkc7CVQFbUpU5nrlCgw',
        // Nếu dùng service_role cho admin API thì thêm vào đây
        SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ._ofv9ivSuI6hSJHoJBrhi0i6Ka1e1bfAhYeWO9bLtIw',
        SUPABASE_COOKIE_OPTIONS: JSON.stringify({
          domain: '.mugentv.com',
          path: '/',
          sameSite: 'lax',
          secure: true,
        }),
      }
    }
  ]
}