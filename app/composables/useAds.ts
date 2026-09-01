export interface AdPlacement {
  position: string
  code: string
}

export const useAds = () => {
  // useState giúp chia sẻ state này trên toàn bộ ứng dụng (Global State)
  const ads = useState<AdPlacement[]>('global-ads', () => [])

  // Hàm gọi API lấy quảng cáo
  const fetchAds = async () => {
    // Nếu đã có dữ liệu thì không gọi lại API nữa
    if (ads.value.length > 0) return

    try {
      const { data } = await useFetch<AdPlacement[]>('/api/ads', {
        key: 'fetch-public-ads' // Key giúp Nuxt deduplicate request trong quá trình SSR
      })

      if (data.value) {
        ads.value = data.value
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu quảng cáo:', error)
    }
  }

  // Hàm tiện ích để lấy mã code theo vị trí (Có hỗ trợ A/B Testing / Rotation)
  const getAdCode = (position: string): string | null => {
    const ad = ads.value.find(a => a.position === position)
    if (!ad || !ad.code) return null

    try {
      // 1. Thử giải mã JSON
      const variants = JSON.parse(ad.code)
      
      // Nếu dữ liệu không phải là mảng (do cấu trúc sai), trả về nguyên bản
      if (!Array.isArray(variants)) return ad.code

      // 2. Lọc lấy các nguồn quảng cáo ĐANG BẬT (is_active)
      const activeVariants = variants.filter((v: any) => v.is_active)
      
      if (activeVariants.length === 0) return null
      if (activeVariants.length === 1) return activeVariants[0].code

      // 3. Thuật toán Xoay vòng (Weighted Random)
      const totalWeight = activeVariants.reduce((sum, v) => sum + (Number(v.weight) || 0), 0)
      
      // Nếu tất cả trọng số đều là 0, trả về cái đầu tiên để tránh lỗi
      if (totalWeight <= 0) return activeVariants[0].code

      const random = Math.random() * totalWeight
      let cumulative = 0

      for (const variant of activeVariants) {
        cumulative += (Number(variant.weight) || 0)
        if (random <= cumulative) {
          return variant.code // Trả về mã "trúng thưởng"
        }
      }
      
      // Fallback an toàn (trả về cái cuối cùng)
      return activeVariants[activeVariants.length - 1].code

    } catch (e) {
      // BẮT LỖI: Nếu JSON.parse thất bại -> Đây là đoạn mã HTML tĩnh kiểu cũ
      // -> Trả về trực tiếp để đảm bảo tính tương thích ngược (Legacy Code)
      return ad.code
    }
  }

  return {
    ads,
    fetchAds,
    getAdCode
  }
}