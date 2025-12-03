// composables/useAuth.ts
import { computed } from 'vue'
import { useRouter, useRoute, useSupabaseClient, useSupabaseUser } from '#imports'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
}

/**
 * useAuth composable
 *
 * Trước đây logic auth được mock bằng localStorage.
 * Phiên bản này dùng Supabase Auth thông qua module @nuxtjs/supabase.
 *
 * - user: thông tin người dùng đã chuẩn hoá (id, name, email)
 * - isLoggedIn: boolean
 * - login: đăng nhập bằng email / password
 * - logout: đăng xuất và đưa về trang chủ
 * - requireAuth: tiện ích để ép người dùng sang /login nếu chưa đăng nhập
 */
export const useAuth = () => {
  const router = useRouter()
  const route = useRoute()
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const config = useRuntimeConfig()

  // Chuẩn hoá user từ Supabase user
  const user = computed<AuthUser | null>(() => {
    const raw = supabaseUser.value
    if (!raw) return null

    // cố gắng lấy tên hiển thị từ user_metadata, fallback sang phần trước @ của email
    const meta: any = raw.user_metadata || {}
    const metaName: string | undefined =
      meta.full_name || meta.name || meta.username

    const derivedName =
      metaName ||
      (raw.email ? raw.email.split('@')[0] : null)

    return {
      id: raw.id,
      email: raw.email ?? null,
      name: derivedName ?? null,
    }
  })

  const isLoggedIn = computed<boolean>(() => !!supabaseUser.value)

  /**
   * Đăng nhập bằng email / password.
   * Nếu Supabase trả lỗi thì throw ra để component tự hiển thị message.
   */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // ném lại error để UI (login.vue) xử lý và hiển thị thông báo tiếng Nhật
      throw error
    }
  }

  /**
   * Đăng xuất rồi quay về trang chủ.
   */
  const logout = async () => {
    await supabase.auth.signOut()
    await router.push('/')
  }

  

  /**
   * Helper: kiểm tra đăng nhập.
   * - Nếu CHƯA login → chuyển sang /login, kèm query redirect = route hiện tại (hoặc custom).
   * - Nếu ĐÃ login → trả true.
   */
  const requireAuth = (redirectTo?: string) => {
    if (!supabaseUser.value) {
      router.push({
        path: '/login',
        query: {
          redirect: redirectTo ?? route.fullPath,
        },
      })
      return false
    }
    return true
  }

  const isAdmin = computed(() => {
    const email = user.value?.email
    if (!email) return false
    const adminEmails = config.public.adminEmails as string[] | undefined
    return !!adminEmails?.includes(email)
  })

  // cuối cùng return thêm isAdmin
  return {
    user,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    requireAuth,
  }
  
}
