// app/composables/useImageUpload.ts
import { useSupabaseClient } from '#imports'

export const useImageUpload = () => {
  const supabase = useSupabaseClient<any>()
  const uploading = ref(false)

  // Hàm tạo tên file unique (thêm timestamp)
  const generateFileName = (originalName: string) => {
    const fileExt = originalName.split('.').pop()
    const fileName = originalName.replace(`.${fileExt}`, '')
    const timestamp = Date.now()
    // Loại bỏ ký tự đặc biệt để tránh lỗi URL
    const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '-')
    return `${cleanName}-${timestamp}.${fileExt}`
  }

  // Hàm upload
  // folder: 'movies' hoặc 'series' (để tổ chức file cho gọn)
  const uploadImage = async (file: File, folder: string = 'misc') => {
    uploading.value = true
    try {
      const fileName = generateFileName(file.name)
      const filePath = `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from('images') // Tên bucket bạn vừa tạo
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Lấy Public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (e: any) {
      console.error('Upload failed:', e.message)
      throw e
    } finally {
      uploading.value = false
    }
  }

  return {
    uploadImage,
    uploading
  }
}