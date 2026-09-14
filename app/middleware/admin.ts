import { defineNuxtRouteMiddleware, navigateTo, useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAdmin, fetchProfile } = useAuth()
  const supabase = useSupabaseClient()

  // 1. Kiểm tra session trực tiếp từ Supabase thay vì chỉ dựa vào state cục bộ
  if (!user.value) {
    const { data } = await supabase.auth.getSession()
    
    // Nếu thực sự không có session trong trình duyệt, mới đá ra login
    if (!data.session) {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // 2. Chờ tải role
  await fetchProfile()

  // [DEBUG LOG] Kiểm tra xem code đang nhận diện user là ai (Dùng ?. cho an toàn)
  console.log('🛡️ Admin Middleware Check:', {
    email: user.value?.email,
    role: user.value?.role,
    isAdmin: isAdmin.value
  })

  // 3. Kiểm tra quyền
  if (!isAdmin.value) {
    console.warn('⛔ Access denied: User is not admin. Redirecting to home.')
    return navigateTo('/')
  }
})