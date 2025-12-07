// app/composables/useAuth.ts
import { computed } from 'vue'
import { useRouter, useRoute, useSupabaseClient, useSupabaseUser, useRuntimeConfig } from '#imports'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
}

export const useAuth = () => {
  const router = useRouter()
  const route = useRoute()
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const config = useRuntimeConfig()

  // Chuẩn hoá user
  const user = computed<AuthUser | null>(() => {
    const raw = supabaseUser.value
    if (!raw) return null

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

  // --- ĐĂNG NHẬP ---
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  // --- ĐĂNG KÝ (Thêm mới) ---
  const signup = async (email: string, password: string) => {
    // Supabase mặc định sẽ gửi email confirm. 
    // Nếu bạn tắt "Confirm Email" trong Dashboard thì user sẽ login được ngay.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Lưu tên mặc định là phần trước @ của email
        data: {
          name: email.split('@')[0]
        }
      }
    })
    
    if (error) throw error
    
    return data
  }

  // --- ĐĂNG XUẤT ---
  const logout = async () => {
    await supabase.auth.signOut()
    await router.push('/')
  }

  // --- CHECK AUTH ---
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

  return {
    user,
    isLoggedIn,
    isAdmin,
    login,
    signup, // Export hàm signup
    logout,
    requireAuth,
  }
}