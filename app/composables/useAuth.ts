import { computed, watch } from 'vue'
import { useRouter, useRoute, useSupabaseClient, useSupabaseUser, useRuntimeConfig, useState } from '#imports'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  avatar: string | null
  role: string
}

export const useAuth = () => {
  const router = useRouter()
  const supabase = useSupabaseClient<any>()
  const supabaseUser = useSupabaseUser()
  const config = useRuntimeConfig()

  // [STATE] Lưu trữ Profile (Role) - Chia sẻ toàn app
  const userProfile = useState<{ role: string } | null>('auth-user-profile', () => null)

  const fetchProfile = async () => {
    // 1. Nếu đã có role rồi thì không cần gọi lại API nữa (Giảm duplicate)
    if (userProfile.value?.role) {
      return
    }

    // 2. Lấy ID an toàn (Double Check)
    let uid = supabaseUser.value?.id
    if (!uid) {
      // Nếu state chưa kịp load, hỏi trực tiếp SDK
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
    }

    if (!uid) return // Chưa login

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single()

      if (data) {
        userProfile.value = data
      }
    } catch (e) {
      console.error('Fetch exception:', e)
    }
  }

  // Tự động fetch khi khởi tạo (nếu đã login mà chưa có profile)
  if (supabaseUser.value?.id && !userProfile.value) {
    // Không await ở đây để tránh block UI thread của Vue
    fetchProfile()
  }

  // Watcher: Khi user thay đổi (Đăng nhập/Đăng xuất)
  watch(supabaseUser, (newUser) => {
    if (newUser) {
      fetchProfile()
    } else {
      userProfile.value = null // Reset khi logout
    }
  })

  // Chuẩn hoá user object
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
      avatar: meta.avatar_url ?? null,
      // Mặc định là 'user' nếu chưa load xong
      role: userProfile.value?.role || 'user'
    }
  })

  const isLoggedIn = computed<boolean>(() => !!supabaseUser.value)
  
  // Check Admin: Dựa trên role
  const isAdmin = computed(() => user.value?.role === 'admin')

  // --- ACTIONS ---
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Reset và fetch mới
    userProfile.value = null
    await fetchProfile()
  }

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: email.split('@')[0] } }
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    userProfile.value = null
    await router.push('/')
  }

  const requireAuth = (redirectPath: string) => {
    if (!supabaseUser.value) {
      router.push({
        path: '/login',
        query: { redirect: redirectPath },
      })
      return false
    }
    return true
  }

  return { user, isLoggedIn, isAdmin, login, signup, logout, requireAuth, fetchProfile }
}