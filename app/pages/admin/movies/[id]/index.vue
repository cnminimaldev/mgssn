<template>
  <div v-if="pending" class="py-20 text-center">
    <div
      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-500"
    ></div>
  </div>

  <form v-else @submit.prevent="handleUpdate" class="space-y-8 animate-fade-in">
    <div class="flex justify-end mb-4">
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
        スマートペースト (Smart Paste)
      </button>
    </div>

    <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
      <h2
        class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2"
      >
        基本情報
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >タイトル</label
            >
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >原題</label
            >
            <input
              v-model="form.original_title"
              type="text"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >タイトルかな</label
            >
            <input
              v-model="form.title_kana"
              type="text"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >スラッグ</label
            >
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white font-mono"
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1"
                >公開年</label
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
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >再生時間 (分)</label
            >
            <input
              v-model.number="form.duration_minutes"
              type="number"
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
      <button
        type="submit"
        :disabled="saving"
        class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          v-if="saving"
          class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
        ></span>
        <span>更新する</span>
      </button>
    </div>

    <SmartPasteModal
      :show="showSmartPaste"
      @close="showSmartPaste = false"
      @apply="handleSmartPaste"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import {
  useRoute,
  useRouter,
  useFetch,
  definePageMeta,
  useSupabaseClient,
} from "#imports";
import FormImageUpload from "~/components/FormImageUpload.vue";
import SmartPasteModal from "~/components/SmartPasteModal.vue";

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();

const movieId = route.params.id;
const saving = ref(false);
const showSmartPaste = ref(false);

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
  duration_minutes: 0,
});

const {
  data: movie,
  pending,
  refresh,
} = await useFetch(`/api/movies/${movieId}`, {
  key: `admin-movie-${movieId}`,
});

const syncDataToForm = (data: any) => {
  if (!data) return;
  Object.assign(form, {
    title: data.title || "",
    original_title: data.original_title || data.originalTitle || "",
    title_kana: data.title_kana || data.titleKana || "",
    slug: data.slug || "",
    year: data.year || new Date().getFullYear(),
    origin_country: data.origin_country || data.country || "JP",
    description: data.description || "",
    director: data.director || "",
    main_cast: data.main_cast || data.mainCast || "",
    poster_url: data.poster_url || data.posterUrl || "",
    banner_url: data.banner_url || data.bannerUrl || "",
    duration_minutes: data.duration_minutes || data.durationMinutes || 0,
  });
};

watch(
  movie,
  (newVal) => {
    syncDataToForm(newVal);
  },
  { immediate: true }
);

const handleSmartPaste = (data: any) => {
  Object.assign(form, data);
};

const handleUpdate = async () => {
  saving.value = true;
  try {
    const { error } = await supabase
      .from("movies")
      .update({
        ...form,
        updated_at: new Date(),
      })
      .eq("id", movieId);

    if (error) throw error;

    alert("更新しました");
    refresh();
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
