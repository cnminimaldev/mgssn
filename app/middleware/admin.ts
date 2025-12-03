// middleware/admin.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  const { requireAuth, isAdmin } = useAuth()

  // chưa login → đẩy sang /login
  if (!requireAuth('/admin')) {
    return
  }

  // không phải admin → cho về trang chủ
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
