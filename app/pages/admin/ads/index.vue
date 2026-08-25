<template>
  <div class="admin-ads-page">
    <div class="header">
      <h2>Quản lý Quảng cáo</h2>
    </div>

    <!-- Form Thêm / Sửa Quảng Cáo -->
    <div class="ad-form-card">
      <h3>{{ isEditing ? 'Cập nhật' : 'Thêm mới' }} cấu hình Quảng cáo</h3>
      <form @submit.prevent="saveAd">
        <div class="form-group">
          <label>Vị trí hiển thị</label>
          <select v-model="formData.position" required :disabled="isEditing">
            <option value="header">Dưới Header (header)</option>
            <option value="player_top">Trên Player (player_top)</option>
            <option value="player_bottom">Dưới Player (player_bottom)</option>
            <option value="sticky_left">Bên trái màn hình (sticky_left)</option>
            <option value="sticky_right">Bên phải màn hình (sticky_right)</option>
            <option value="footer">Trên Footer (footer)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Mã quảng cáo (HTML / JS Script)</label>
          <textarea v-model="formData.code" rows="6" required placeholder="Dán mã thẻ <script> hoặc <iframe> vào đây..."></textarea>
        </div>

        <div class="form-group checkbox">
          <label>
            <input type="checkbox" v-model="formData.is_active" />
            Đang hoạt động (Kích hoạt)
          </label>
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary">Lưu cấu hình</button>
          <button type="button" class="btn btn-secondary" v-if="isEditing" @click="resetForm">Hủy</button>
        </div>
      </form>
    </div>

    <!-- Bảng Danh Sách Quảng Cáo -->
    <div class="ad-list">
      <table>
        <thead>
          <tr>
            <th>Vị trí</th>
            <th>Trạng thái</th>
            <th>Lần cập nhật cuối</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ad in ads" :key="ad.id">
            <td><strong>{{ ad.position }}</strong></td>
            <td>{{ ad.is_active ? '✅ Đang bật' : '❌ Đã tắt' }}</td>
            <td>{{ ad.updated_at ? new Date(ad.updated_at).toLocaleDateString('vi-VN') : 'Mới tạo' }}</td> 
            <td>
              <button @click="editAd(ad)" class="btn btn-edit">Sửa</button>
              <button @click="deleteAd(ad.id!)" class="btn btn-delete">Xóa</button>
            </td>
          </tr>
          <tr v-if="!ads.length">
            <td colspan="4" class="text-center">Chưa có dữ liệu quảng cáo nào được thiết lập.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface AdConfig {
  id?: number
  position: string
  code: string
  is_active: boolean
  updated_at?: string
}

const ads = ref<AdConfig[]>([])
const isEditing = ref(false)

const formData = ref<AdConfig>({
  position: 'header',
  code: '',
  is_active: true
})

// Lấy danh sách từ Admin API
const fetchAds = async () => {
  try {
    const data = await $fetch<AdConfig[]>('/api/admin/ads')
    ads.value = data || []
  } catch (error) {
    console.error('Lỗi khi tải danh sách quảng cáo:', error)
  }
}

// Gửi yêu cầu Thêm/Sửa (Upsert)
const saveAd = async () => {
  try {
    await $fetch('/api/admin/ads', {
      method: 'POST',
      body: formData.value
    })
    alert('Lưu thành công!')
    resetForm()
    await fetchAds()
  } catch (error) {
    alert('Có lỗi xảy ra khi lưu.')
    console.error(error)
  }
}

// Đưa dữ liệu lên form để sửa
const editAd = (ad: AdConfig) => {
  isEditing.value = true
  formData.value = { ...ad }
}

// Xóa quảng cáo
const deleteAd = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa vị trí quảng cáo này? Mọi thiết lập sẽ bị mất.')) return
  try {
    await $fetch(`/api/admin/ads/${id}`, {
      method: 'DELETE'
    })
    await fetchAds()
  } catch (error) {
    alert('Lỗi khi xóa.')
  }
}

// Làm mới form
const resetForm = () => {
  isEditing.value = false
  formData.value = {
    position: 'header',
    code: '',
    is_active: true
  }
}

// Gọi ngay khi load trang admin
await fetchAds()
</script>

<style scoped>
/* Style cơ bản để bạn dễ nhìn, hãy thay thế bằng các utility classes (như Tailwind) đang dùng trong Admin của bạn */
.admin-ads-page { padding: 20px; }
.ad-form-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; color: #111;}
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
.actions button { margin-right: 10px; padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold;}
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-edit { background: #ffc107; color: black; margin-right: 8px; }
.btn-delete { background: #dc3545; color: white; }
table { width: 100%; border-collapse: collapse; margin-top: 15px; }
th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
th { background: #e9ecef; color: #333;}
.text-center { text-align: center; }
</style>