<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-1">
      <div class="flex">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="text-lg transition-transform hover:scale-110 focus:outline-none"
          :class="getStarColor(star)"
          @click="submitRating(star)"
          @mouseenter="hoverRating = star"
          @mouseleave="hoverRating = 0"
          :disabled="submitting"
          :title="isLoggedIn ? `${star} sao` : 'ログインして評価'"
        >
          ★
        </button>
      </div>
      
      <span class="ml-2 text-sm font-bold text-yellow-500">
        {{ currentAvg > 0 ? currentAvg : 'N/A' }}
      </span>
      <span class="text-xs text-zinc-500">
        ({{ currentVotes }} 票)
      </span>
    </div>
    
    <p v-if="userRating > 0" class="text-[10px] text-emerald-400">
      あなたの評価: {{ userRating }}
    </p>
    <p v-else-if="!isLoggedIn" class="text-[10px] text-zinc-500">
      <NuxtLink to="/login" class="underline hover:text-zinc-300">ログイン</NuxtLink> して評価する
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSupabaseClient, useSupabaseUser, useAuth } from '#imports'

const props = defineProps<{
  contentId: number
  contentType: 'movie' | 'series'
}>()

const supabase = useSupabaseClient<any>()
const supabaseUser = useSupabaseUser() // State reactive
const { isLoggedIn } = useAuth() 

const currentAvg = ref(0)
const currentVotes = ref(0)
const userRating = ref(0)
const hoverRating = ref(0)
const submitting = ref(false)

// Logic hiển thị màu sao
const getStarColor = (star: number) => {
  if (hoverRating.value >= star) return 'text-yellow-400'
  if (hoverRating.value === 0 && userRating.value >= star) return 'text-yellow-400'
  if (hoverRating.value === 0 && userRating.value === 0 && Math.round(currentAvg.value) >= star) {
    return 'text-yellow-500/70'
  }
  return 'text-zinc-700'
}

// Lấy thông tin đánh giá
const fetchRatingInfo = async () => {
  // A. Lấy điểm trung bình
  const { data, error } = await supabase.rpc('get_content_rating', {
    target_id: props.contentId,
    target_type: props.contentType
  })
  
  if (!error && data && data.length > 0) {
    currentAvg.value = data[0].avg_rating || 0
    currentVotes.value = data[0].total_votes || 0
  }

  // B. Lấy điểm cá nhân (nếu có user trong state)
  if (supabaseUser.value?.id) {
    try {
      const { data: myReview, error: reviewError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', supabaseUser.value.id)
        .eq('content_id', props.contentId)
        .eq('type', props.contentType)
        .maybeSingle()

      if (!reviewError && myReview) {
        userRating.value = myReview.rating
      } else {
        userRating.value = 0
      }
    } catch (e) {
      console.error('Error fetching user rating:', e)
    }
  } else {
    userRating.value = 0
  }
}

// Gửi đánh giá
const submitRating = async (star: number) => {
  // 1. Lấy ID từ state
  let userId = supabaseUser.value?.id

  // 2. [FIX QUAN TRỌNG] Nếu state null, thử lấy trực tiếp từ Auth Client (Double Check)
  if (!userId) {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id
  }

  // 3. Nếu vẫn không có ID -> Bắt buộc đăng nhập
  if (!userId) {
    alert('ログインしてください (Vui lòng đăng nhập).')
    return
  }

  submitting.value = true
  const oldRating = userRating.value
  userRating.value = star // Optimistic update

  console.log('Submitting rating:', { userId, contentId: props.contentId, star })

  try {
    const { error } = await supabase
      .from('reviews')
      .upsert({
        user_id: userId, // Chắc chắn có ID
        content_id: props.contentId,
        type: props.contentType,
        rating: star,
        updated_at: new Date()
      }, { 
        onConflict: 'user_id, content_id, type' 
      })

    if (error) throw error
    
    // Refresh lại data sau khi đánh giá
    await fetchRatingInfo()
    
  } catch (err) {
    console.error('Rating Error:', err)
    userRating.value = oldRating // Rollback
    alert('評価に失敗しました (Đánh giá thất bại).')
  } finally {
    submitting.value = false
  }
}

// Watch user change
watch(supabaseUser, () => {
  fetchRatingInfo()
})

onMounted(() => {
  fetchRatingInfo()
})
</script>