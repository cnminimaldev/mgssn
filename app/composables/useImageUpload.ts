import { useSupabaseClient } from '#imports'
import { ref } from 'vue'

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

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      // [ĐÃ SỬA] Bóc tách lấy Relative Path thay vì Absolute URL
      const urlObj = new URL(publicUrlData.publicUrl)
      return urlObj.pathname // Sẽ trả về dạng: /storage/v1/object/public/images/...
    } catch (e: any) {
      console.error('Upload failed:', e.message)
      throw e
    } finally {
      uploading.value = false
    }
  }

  const deleteImage = async (publicUrl: string) => {
    if (!publicUrl) return

    try {
      // Bóc tách đường dẫn file từ Public URL
      const bucketName = 'images'
      const pathParts = publicUrl.split(`/public/${bucketName}/`)
      
      if (pathParts.length < 2) return 

      const filePath = pathParts[1]
      
      // Thêm dòng kiểm tra này để TypeScript biết chắc chắn filePath là một chuỗi (string)
      if (!filePath) return

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (error) throw error
      
    } catch (e: any) {
      console.error('Delete failed:', e.message)
      throw e
    }
  }

  return {
    uploadImage,
    deleteImage,
    uploading
  }
}