import { useState, useNuxtApp, useSupabaseClient, useRoute } from '#imports'
import { useAuth } from '~/composables/useAuth'

export const useMyList = () => {
  const { user: authUser, isLoggedIn } = useAuth()
  const supabase = useSupabaseClient<any>()
  const route = useRoute()

  // State toàn cục (Singleton)
  const movieIds = useState<number[]>('myListMovieIds', () => [])
  const seriesIds = useState<number[]>('myListSeriesIds', () => [])
  const initialized = useState('myListInitialized', () => false)

  // Hàm xóa data (dùng khi logout)
  const clearMyList = () => {
    movieIds.value = []
    seriesIds.value = []
    initialized.value = false
  }

  // Hàm tải dữ liệu
  const fetchMyList = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      clearMyList()
      return
    }

    try {
      const userId = user.id

      const [resMovie, resSeries] = await Promise.all([
        supabase.from('user_movie_list').select('movie_id').eq('user_id', userId),
        supabase.from('user_series_list').select('series_id').eq('user_id', userId)
      ])

      if (resMovie.data) {
        movieIds.value = resMovie.data.map((row: any) => row.movie_id)
      }
      
      if (resSeries.data) {
        seriesIds.value = resSeries.data.map((row: any) => row.series_id)
      }

    } catch (e) {
      console.error('Error fetching my list:', e)
    } finally {
      initialized.value = true
    }
  }

  const isInMyList = (id: number, type: 'movie' | 'series') => {
    if (type === 'series') {
      return seriesIds.value.includes(id)
    }
    return movieIds.value.includes(id)
  }

  const toggleMyList = async (id: number, type: 'movie' | 'series') => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const { $router } = useNuxtApp()
      $router.push({
        path: '/login',
        query: { redirect: route.fullPath } 
      })
      return
    }

    const userId = user.id
    const isAdded = isInMyList(id, type)
    
    // --- MỚI: Kiểm tra giới hạn 50 items ---
    if (!isAdded) {
      const totalItems = movieIds.value.length + seriesIds.value.length
      if (totalItems >= 50) {
        // Thông báo bằng tiếng Nhật cho khớp với UI
        alert('マイリストには最大50件までしか登録できません。') 
        return
      }
    }
    // ----------------------------------------

    const table = type === 'series' ? 'user_series_list' : 'user_movie_list'
    const col = type === 'series' ? 'series_id' : 'movie_id'

    // Optimistic Update
    if (type === 'series') {
      if (isAdded) seriesIds.value = seriesIds.value.filter((x) => x !== id)
      else seriesIds.value.push(id)
    } else {
      if (isAdded) movieIds.value = movieIds.value.filter((x) => x !== id)
      else movieIds.value.push(id)
    }

    try {
      if (isAdded) {
        const { error } = await supabase
          .from(table)
          .delete()
          .match({ user_id: userId, [col]: id })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from(table)
          .insert({ user_id: userId, [col]: id })
        if (error) throw error
      }
    } catch (e) {
      console.error('Toggle MyList failed', e)
      await fetchMyList() // Revert nếu lỗi
    }
  }

  return {
    movieIds,
    seriesIds,
    fetchMyList,
    clearMyList,
    isInMyList,
    toggleMyList,
  }
}