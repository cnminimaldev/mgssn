// composables/useMyList.ts
import { computed, watch } from 'vue'
import { useState } from '#imports'
import { useAuth } from '~/composables/useAuth'

const STORAGE_KEY_BASE = 'mystream-mylist'

/**
 * useMyList
 *
 * Bản cũ dùng localStorage thuần + mock auth.
 * Bản mới:
 * - vẫn dùng localStorage để lưu My List phía client (chưa đụng tới DB)
 * - nhưng key sẽ gắn với Supabase user.id → mỗi user có My List riêng
 * - khi toggle My List, nếu chưa đăng nhập → dùng requireAuth() để điều hướng sang /login
 */
export const useMyList = () => {
  const { user, requireAuth } = useAuth()

  // Danh sách ID phim trong My List (trong runtime)
  const myList = useState<number[]>('myList', () => [])

  const storageKey = computed(() => {
    if (user.value?.id) {
      return `${STORAGE_KEY_BASE}_${user.value.id}`
    }
    return `${STORAGE_KEY_BASE}_guest`
  })

  const loadFromStorage = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(storageKey.value)
      if (!raw) {
        myList.value = []
        return
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        myList.value = []
        return
      }
      myList.value = parsed.filter(
        (x: unknown): x is number => typeof x === 'number',
      )
    } catch {
      myList.value = []
    }
  }

  const syncToStorage = () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey.value, JSON.stringify(myList.value))
    } catch {
      // ignore write errors (quota, private mode, ...)
    }
  }

  if (typeof window !== 'undefined') {
    // Lần đầu gọi composable → load dữ liệu
    loadFromStorage()

    // Khi user (hoặc storageKey) thay đổi → load My List tương ứng
    watch(
      storageKey,
      () => {
        loadFromStorage()
      },
      { immediate: false },
    )
  }

  const isInMyList = (movieId: number) => {
    return myList.value.includes(movieId)
  }

  const toggleMyList = (movieId: number) => {
    // Chỉ cho phép thao tác nếu đã đăng nhập
    if (!requireAuth()) return

    const idx = myList.value.indexOf(movieId)
    if (idx === -1) {
      myList.value.push(movieId)
    } else {
      myList.value.splice(idx, 1)
    }
    syncToStorage()
  }

  return {
    myList,
    isInMyList,
    toggleMyList,
  }
}
