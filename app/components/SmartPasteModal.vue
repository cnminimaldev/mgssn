<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div class="w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
      <h3 class="mb-4 text-lg font-bold text-white">スマートペースト (Nhập liệu nhanh)</h3>
      
      <p class="mb-2 text-xs text-zinc-400">
        以下のフォーマットでテキストを貼り付けてください:<br>
        <code>[title], [original_title], [kana_title], [slug], [genres], [description], [year], [duration], [date], [country], [director], [main_cast]</code>
      </p>

      <textarea
        v-model="rawText"
        class="h-64 w-full rounded-md border border-zinc-700 bg-black p-3 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
        placeholder="[title]&#10;Tiêu đề phim&#10;&#10;[genres]&#10;ドラマ, 青春&#10;&#10;[description]&#10;Nội dung phim..."
      ></textarea>

      <div class="mt-4 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          @click="$emit('close')"
        >
          キャンセル (Hủy)
        </button>
        <button
          type="button"
          class="rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400"
          @click="handleProcess"
        >
          適用する (Áp dụng)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// [CẬP NHẬT] Thêm prop genres để nhận danh sách từ trang cha
const props = defineProps<{ 
  show: boolean;
  genres?: { id: number; name: string; name_ja?: string }[] 
}>()

const emit = defineEmits(['close', 'apply'])

const rawText = ref('')

const handleProcess = () => {
  const text = rawText.value
  if (!text) return

  // Kết quả trả về
  const data: Record<string, any> = {}

  // Hàm helper để lấy giá trị từ regex
  const extract = (tag: string): string | null => {
    // Regex tìm nội dung trong thẻ [tag]
    const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\n\\[|$)`, 'i')
    const match = text.match(regex)
    return (match && match[1]) ? match[1].trim() : null
  }

  // 1. Mapping dữ liệu cơ bản
  const title = extract('title')
  if (title) data.title = title

  const originalTitle = extract('original_title')
  if (originalTitle) data.original_title = originalTitle

  const kanaTitle = extract('kana_title')
  if (kanaTitle) data.title_kana = kanaTitle

  const slug = extract('slug')
  if (slug) data.slug = slug

  const description = extract('description')
  if (description) data.description = description

  const country = extract('country')
  if (country) data.origin_country = country.toUpperCase()

  const director = extract('director')
  if (director) data.director = director

  const mainCast = extract('main_cast')
  if (mainCast) data.main_cast = mainCast

  // 2. Xử lý số (Year, Duration)
  const yearStr = extract('year')
  if (yearStr) {
    const y = parseInt(yearStr.replace(/\D/g, ''))
    if (!isNaN(y)) data.year = y
  }

  const durationStr = extract('duration')
  if (durationStr) {
    const d = parseInt(durationStr.replace(/\D/g, ''))
    if (!isNaN(d)) data.duration_minutes = d
  }

  // 3. Xử lý ngày tháng (Input: mm/dd/yyyy -> Output: yyyy-mm-dd)
  const dateStr = extract('date')
  if (dateStr) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const m = parts[0]!.padStart(2, '0')
      const d = parts[1]!.padStart(2, '0')
      const y = parts[2]!
      data.release_date = `${y}-${m}-${d}`
    } else {
       // Fallback nếu format khác
       data.release_date = dateStr
    }
  }

  // 4. [MỚI] Xử lý Genres
  // Input: "ドラマ, 青春, 心理" -> Output: genre_ids: [1, 5, 8]
  const genresStr = extract('genres')
  if (genresStr && props.genres && props.genres.length > 0) {
    // Tách chuỗi bằng dấu phẩy (cả tiếng Anh , và tiếng Nhật 、)
    const inputNames = genresStr.split(/[,、]/).map(s => s.trim()).filter(Boolean)
    const foundIds: number[] = []

    inputNames.forEach(name => {
      // Tìm trong danh sách genres (so sánh name_ja hoặc name, không phân biệt hoa thường)
      const matched = props.genres!.find(g => 
        (g.name_ja && g.name_ja.toLowerCase() === name.toLowerCase()) || 
        (g.name.toLowerCase() === name.toLowerCase())
      )
      
      if (matched) {
        foundIds.push(matched.id)
      }
    })

    if (foundIds.length > 0) {
      // Dùng Set để loại bỏ ID trùng lặp nếu người dùng nhập trùng
      data.genre_ids = [...new Set(foundIds)]
    }
  }

  // Gửi dữ liệu đã parse ra ngoài
  emit('apply', data)
  emit('close')
  rawText.value = ''
}
</script>