export default defineNuxtRouteMiddleware((to) => {
  // Sử dụng useSupabaseUser trực tiếp để tránh gọi useRoute() trong useAuth
  const user = useSupabaseUser()
  const config = useRuntimeConfig()

  // 1. Chưa login -> Redirect sang Login
  // Dùng to.fullPath để lấy link hiện tại thay vì useRoute().fullPath
  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // 2. Kiểm tra quyền Admin
  const email = user.value.email
  const adminEmails = config.public.adminEmails as string[] | undefined

  // Nếu không có email hoặc email không nằm trong danh sách admin
  if (!email || !adminEmails?.includes(email)) {
    return navigateTo('/')
  }
})