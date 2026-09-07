<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/admin"
            class="text-xs text-emerald-400 hover:underline mb-2 block"
          >
            &larr; 管理画面に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">シリーズ管理 (Series)</h1>
        </div>
        <NuxtLink
          to="/admin/series/new"
          class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
        >
          <span>＋</span> 新規登録
        </NuxtLink>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50"
      >
        <!-- [MỚI] Flexbox chứa ô tìm kiếm và bộ lọc -->
        <div class="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/5">
          <input
            v-model="searchInput"
            @keydown.enter="applyFilters"
            type="text"
            placeholder="タイトルで検索..."
            class="w-full sm:max-w-sm bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 outline-none"
          />
          
          <select
            v-model="filterOngoing"
            @change="applyFilters"
            class="bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 outline-none cursor-pointer hover:bg-zinc-900 transition"
          >
            <option value="">全て (Tất cả)</option>
            <option value="true">放送中 (Chỉ hiện phim đang chiếu)</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <th class="px-6 py-4 font-medium w-20">Image</th>
                <th class="px-6 py-4 font-medium">Title</th>
                <th class="px-4 py-4 font-medium text-center">Status</th>
                <th class="px-4 py-4 font-medium text-center">Ongoing</th>
                <th class="px-6 py-4 font-medium">Year</th>
                <th class="px-6 py-4 font-medium">Country</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-if="pending" class="bg-black/20">
                <td colspan="7" class="px-6 py-10 text-center text-zinc-500">
                  <div
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500"
                  ></div>
                </td>
              </tr>

              <tr v-else-if="seriesList.length === 0" class="bg-black/20">
                <td colspan="7" class="px-6 py-10 text-center text-zinc-500">
                  データがありません (No Data)
                </td>
              </tr>

              <tr
                v-for="item in seriesList"
                :key="item.id"
                class="hover:bg-white/5 transition-colors group"
              >
                <td class="px-6 py-3">
                  <div
                    class="aspect-video w-16 overflow-hidden rounded bg-zinc-800 border border-white/10"
                  >
                    <img
                      v-if="item.thumbnail"
                      :src="item.thumbnail"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </td>
                <td class="px-6 py-3 font-medium text-white">
                  <div class="truncate max-w-xs">{{ item.title }}</div>
                  <div class="text-[10px] text-zinc-500 truncate max-w-xs">
                    {{ item.originalTitle }}
                  </div>
                </td>
                
                <td class="px-4 py-3 text-center">
                  <button
                    @click="togglePublicStatus(item)"
                    :class="item.isPublic ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'"
                    class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold transition-colors hover:opacity-80"
                    title="Trạng thái hiển thị (Nhấn để đổi)"
                  >
                    <span v-if="item.isPublic" class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span v-else class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                    {{ item.isPublic ? 'Public' : 'Private' }}
                  </button>
                </td>

                <td class="px-4 py-3 text-center">
                  <button
                    @click="toggleOngoingStatus(item)"
                    :class="item.isOngoing ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-zinc-800 text-zinc-600 border-zinc-700'"
                    class="inline-flex items-center justify-center rounded-md border px-2 py-1 text-[10px] font-bold transition-all hover:opacity-80 w-12"
                    title="Phim đang chiếu (Nhấn để đổi)"
                  >
                    {{ item.isOngoing ? 'ON' : 'OFF' }}
                  </button>
                </td>

                <td class="px-6 py-3 text-zinc-400">
                  {{ item.year }}
                </td>
                <td class="px-6 py-3 text-zinc-400">
                  {{ item.country }}
                </td>
                <td class="px-6 py-3 text-right">
                  <NuxtLink
                    :to="`/admin/series/${item.id}`"
                    class="inline-flex items-center gap-1 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-emerald-600 hover:text-white transition"
                  >
                    編集 (Edit)
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-center gap-4 p-4 border-t border-white/5"
          v-if="total > 20"
        >
          <button
            @click="page--"
            :disabled="page <= 1"
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50 text-zinc-300"
          >
            Prev
          </button>
          <span class="text-xs text-zinc-500">Page {{ page }}</span>
          <button
            @click="page++"
            :disabled="seriesList.length < 20"
            class="px-3 py-1 rounded border border-zinc-700 text-xs hover:bg-zinc-800 disabled:opacity-50 text-zinc-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useFetch, definePageMeta, useSupabaseClient } from "#imports";

definePageMeta({
  middleware: "admin",
});

const page = ref(1);
const searchInput = ref("");
const activeKeyword = ref("");

// [MỚI] Khai báo biến cho bộ lọc
const filterOngoing = ref(""); 
const activeOngoing = ref(""); 

const supabase = useSupabaseClient<any>();

const { data, pending, refresh } = await useFetch("/api/movies", {
  params: {
    page,
    q: activeKeyword,
    ongoing: activeOngoing, // [MỚI] Đẩy tham số này lên API
    type: "series", 
    sort: "created_at",
    pageSize: 20,
    isAdmin: "true",
  },
  // [MỚI] Thêm activeOngoing vào mảng theo dõi
  watch: [page, activeKeyword, activeOngoing], 
});

const seriesList = ref<any[]>([]);
const total = ref(0);

watch(data, (newData) => {
  if (newData) {
    seriesList.value = newData.items || [];
    total.value = newData.total || 0;
  }
}, { immediate: true });

// [MỚI] Gộp chung logic tìm kiếm và lọc
const applyFilters = () => {
  activeKeyword.value = searchInput.value;
  activeOngoing.value = filterOngoing.value;
  page.value = 1;
};

const togglePublicStatus = async (item: any) => {
  const newStatus = !item.isPublic;
  item.isPublic = newStatus;

  try {
    const { error } = await supabase
      .from("series")
      .update({ is_public: newStatus })
      .eq("id", item.id);

    if (error) throw error;
  } catch (e: any) {
    item.isPublic = !newStatus;
    alert("Trạng thái cập nhật thất bại: " + e.message);
  }
};

const toggleOngoingStatus = async (item: any) => {
  const newStatus = !item.isOngoing;
  item.isOngoing = newStatus;

  try {
    const { error } = await supabase
      .from("series")
      .update({ is_ongoing: newStatus })
      .eq("id", item.id);

    if (error) throw error;
  } catch (e: any) {
    item.isOngoing = !newStatus;
    alert("Cập nhật trạng thái đang chiếu thất bại: " + e.message);
  }
};
</script>