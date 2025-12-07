export const getResizedUrl = (
  url: string | null | undefined,
  width: number,
  height: number,
  mode: 'contain' | 'cover' = 'contain'
) => {
  if (!url) return ''
  
  // Chỉ xử lý ảnh từ Supabase Storage của bạn
  if (url.includes('/storage/v1/object/public/')) {
    // Chuyển sang endpoint render
    let newUrl = url.replace('/object/public/', '/render/image/public/')
    
    // Thêm các tham số: width, height, resize mode, quality
    newUrl += `?width=${width}&height=${height}&resize=${mode}&quality=80`
    return newUrl
  }
  
  // Ảnh ngoài thì trả về nguyên gốc
  return url
}