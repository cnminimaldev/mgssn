import { defineNuxtRouteMiddleware, navigateTo, useSupabaseClient, useCookie } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAdmin, fetchProfile } = useAuth()
  const supabase = useSupabaseClient()

  // 1. Kiểm tra phiên đăng nhập
  if (!user.value) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // 2. Dùng Cookie để làm "Thẻ bài qua cổng nhanh"
  const adminCache = useCookie('is_admin_cached', { maxAge: 60 * 60 }) // Lưu 1 tiếng

  // TÌNH HUỐNG A: MỞ NHIỀU TAB ĐỒNG LOẠT (Đã có thẻ bài)
  if (adminCache.value === 'true') {
    // Chạy ngầm fetchProfile để DB tự động cập nhật biến isAdmin (không dùng await)
    fetchProfile().then(() => {
      // Nếu load xong mà phát hiện ông này bị tước quyền Admin -> Đá văng ra ngoài
      if (!isAdmin.value) {
        adminCache.value = null // Thu hồi thẻ bài
        navigateTo('/')
      }
    })
    
    // 🔥 QUAN TRỌNG: Lập tức cho qua cổng để tab load ngay (Không bị trắng màn hình)
    return 
  }

  // TÌNH HUỐNG B: MỞ TAB ĐẦU TIÊN (Chưa có thẻ bài)
  await fetchProfile() // Bắt buộc chờ để lấy thông tin

  // Kiểm tra xem thực sự có quyền không
  if (isAdmin.value) {
    adminCache.value = 'true' // Cấp thẻ bài cho các tab sau
  } else {
    console.warn('⛔ Access denied: User is not admin. Redirecting to home.')
    return navigateTo('/')
  }
})