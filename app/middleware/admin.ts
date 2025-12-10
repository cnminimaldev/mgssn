export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAdmin, fetchProfile } = useAuth()

  // 1. Chưa login -> Redirect
  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // 2. Chờ tải role
  await fetchProfile()

  // [DEBUG LOG] Kiểm tra xem code đang nhận diện user là ai
  console.log('🛡️ Admin Middleware Check:', {
    email: user.value.email,
    role: user.value.role,
    isAdmin: isAdmin.value
  })

  // 3. Kiểm tra quyền
  if (!isAdmin.value) {
    console.warn('⛔ Access denied: User is not admin. Redirecting to home.')
    return navigateTo('/')
  }
})