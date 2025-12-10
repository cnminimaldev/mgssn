export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()

  // Nếu chưa đăng nhập -> Chuyển hướng sang trang Login
  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})