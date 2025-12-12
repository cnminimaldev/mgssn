<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/admin/series"
            class="text-xs text-emerald-400 hover:underline mb-2 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            シリーズ一覧に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">
            新規シリーズ登録 (New Series)
          </h1>
          <p class="text-xs text-zinc-500 mt-1">
            新しいドラマ・アニメ情報を入力してください
          </p>
        </div>

        <button
          type="button"
          @click="showSmartPaste = true"
          class="flex items-center gap-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 text-sm font-bold text-indigo-400 hover:bg-indigo-600/40 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
          スマートペースト
        </button>
      </div>

      <form @submit.prevent="handleCreate" class="space-y-8 animate-fade-in">
        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          <h2
            class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2"
          >
            基本情報 (Basic Info)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >タイトル <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700"
                  placeholder="例: ワンピース"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >原題</label
                >
                <input
                  v-model="form.original_title"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700"
                  placeholder="例: One Piece"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >タイトルかな</label
                >
                <input
                  v-model="form.title_kana"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700"
                  placeholder="例: わんぴーす"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >スラッグ (URL) <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.slug"
                  type="text"
                  required
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white font-mono placeholder-zinc-700"
                  placeholder="例: one-piece"
                />
                <p class="text-[10px] text-zinc-500 mt-1">
                  ※ 英数字とハイフンのみ (Unique ID)
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-1"
                    >開始年</label
                  >
                  <input
                    v-model.number="form.year"
                    type="number"
                    class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-1"
                    >製作国</label
                  >
                  <input
                    v-model="form.origin_country"
                    type="text"
                    maxlength="2"
                    placeholder="JP"
                    class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >公開日 (Release Date)</label
                >
                <input
                  v-model="form.release_date"
                  type="date"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white [color-scheme:dark]"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >監督</label
                >
                <input
                  v-model="form.director"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1"
                  >キャスト</label
                >
                <input
                  v-model="form.main_cast"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
                />
              </div>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >あらすじ</label
            >
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            ></textarea>
          </div>
        </div>

        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          <h2
            class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2"
          >
            ジャンル (Genres)
          </h2>
          <div v-if="genresLoading" class="text-xs text-zinc-500">
            Loading genres...
          </div>
          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            <label
              v-for="genre in genres"
              :key="genre.id"
              class="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                :value="genre.id"
                v-model="form.genre_ids"
                class="w-4 h-4 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span
                class="text-sm text-zinc-400 group-hover:text-white transition-colors"
              >
                {{ genre.name_ja || genre.name }}
              </span>
            </label>
          </div>
        </div>

        <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          <h2
            class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2"
          >
            画像設定
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-2"
                >ポスター (Vertical)</label
              >
              <FormImageUpload
                v-model="form.poster_url"
                folder="posters"
                ratio="poster"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-2"
                >バナー (Horizontal)</label
              >
              <FormImageUpload
                v-model="form.banner_url"
                folder="banners"
                ratio="banner"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-4 pt-4 border-t border-white/5"
        >
          <NuxtLink
            to="/admin/series"
            class="px-4 py-2 rounded text-sm text-zinc-400 hover:text-white transition"
          >
            キャンセル
          </NuxtLink>
          <button
            type="submit"
            :disabled="saving"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="saving"
              class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            ></span>
            <span>登録する</span>
          </button>
        </div>
      </form>

      <SmartPasteModal
        :show="showSmartPaste"
        :genres="genres"
        @close="showSmartPaste = false"
        @apply="handleSmartPaste"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, definePageMeta, useSupabaseClient } from "#imports";
import FormImageUpload from "~/components/FormImageUpload.vue";
import SmartPasteModal from "~/components/SmartPasteModal.vue";

definePageMeta({
  middleware: "admin",
});

const router = useRouter();
const supabase = useSupabaseClient<any>();
const saving = ref(false);
const showSmartPaste = ref(false);

const genres = ref<any[]>([]);
const genresLoading = ref(true);

const form = reactive({
  title: "",
  original_title: "",
  title_kana: "",
  slug: "",
  year: new Date().getFullYear(),
  origin_country: "JP",
  description: "",
  director: "",
  main_cast: "",
  poster_url: "",
  banner_url: "",
  // [QUAN TRỌNG] Không có thuộc tính 'type' ở đây
  release_date: "",
  genre_ids: [] as number[],
});

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("id, name, name_ja")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    genres.value = data || [];
  } catch (e) {
    console.error(e);
  } finally {
    genresLoading.value = false;
  }
});

const handleSmartPaste = (data: any) => {
  Object.assign(form, data);
};

const handleCreate = async () => {
  if (!form.title || !form.slug) {
    alert("タイトルとスラッグは必須です");
    return;
  }

  saving.value = true;
  try {
    // 1. Tách genre_ids ra khỏi payload insert vào series
    const { genre_ids, ...seriesData } = form;

    const insertData = {
      ...seriesData,
      release_date: seriesData.release_date || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 2. Insert Series (Schema không có cột 'type', nên insertData cũng không được có)
    const { data: newVal, error } = await supabase
      .from("series")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // 3. Insert Series Genres (Bảng trung gian)
    if (genre_ids && genre_ids.length > 0) {
      const genreInserts = genre_ids.map((gid) => ({
        series_id: newVal.id,
        genre_id: gid,
      }));

      const { error: genreError } = await supabase
        .from("series_genres")
        .insert(genreInserts);

      if (genreError) {
        console.error("Error linking genres:", genreError);
        alert("シリーズは作成されましたが、ジャンルの紐付けに失敗しました。");
      }
    }

    alert("シリーズを登録しました");
    router.push(`/admin/series/${newVal.id}`);
  } catch (e: any) {
    alert("エラー: " + e.message);
  } finally {
    saving.value = false;
  }
};
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
