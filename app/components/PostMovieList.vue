<template>
  <div class="my-10">
    <!-- Hiệu ứng loading mượt mà khi đang fetch API -->
    <div v-if="pending" class="py-12 flex justify-center border border-white/5 rounded-xl bg-zinc-900/30">
      <div class="animate-spin h-8 w-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full"></div>
    </div>
    
    <!-- Không có phim nào -->
    <div v-else-if="movies.length === 0" class="py-12 text-center text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/30">
      条件に一致する作品が見つかりませんでした。(Không tìm thấy phim phù hợp điều kiện)
    </div>
    
    <!-- Render lưới phim bằng MovieCard có sẵn -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 mb-8">
      <div v-for="movie in movies" :key="movie.id" class="card-wrapper">
        <MovieCard :item="movie" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'

const props = defineProps<{
  config: any
}>()

// 1. Dịch cấu hình từ Editor thành Tham số API
const apiParams = computed(() => {
  const c = props.config
  const params: any = {
    pageSize: c.limit || 12,
    sort: c.sort || 'updated_at_desc'
  }
  
  if (c.mode === 'manual') {
    params.specific_slugs = c.specific_slugs
  } else {
    if (c.type && c.type !== 'all') params.type = c.type
    if (c.country && c.country !== 'all') params.countries = c.country
    if (c.genre_slugs && c.genre_slugs.length > 0) params.genres = c.genre_slugs.join(',')
  }
  
  return params
})

// 2. Fetch dữ liệu. Dùng JSON.stringify làm key duy nhất để tránh xung đột nếu bài viết có chèn NHIỀU danh sách phim
const { data, pending } = await useAsyncData(
  `post-movie-list-${JSON.stringify(apiParams.value)}`,
  () => $fetch('/api/movies', { params: apiParams.value })
)

const movies = computed(() => data.value?.items ?? [])
</script>