import { defineNuxtRouteMiddleware, navigateTo, useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn } = useAuth()
  const supabase = useSupabaseClient()

  // Nếu state cục bộ báo chưa đăng nhập -> check lại với Supabase cho chắc
  if (!isLoggedIn.value) {
    const { data } = await supabase.auth.getSession()
    
    // Nếu Supabase cũng báo không có session, lúc này mới redirect
    if (!data.session) {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
})