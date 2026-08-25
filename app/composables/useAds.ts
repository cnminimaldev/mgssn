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

  // Hàm tiện ích để lấy mã code theo vị trí
  const getAdCode = (position: string): string | null => {
    const ad = ads.value.find(a => a.position === position)
    return ad ? ad.code : null
  }

  return {
    ads,
    fetchAds,
    getAdCode
  }
}