<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            :to="`/admin/series/${seriesId}/collections`"
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
            エピソード管理に戻る
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">
            エピソード一括登録 (Bulk Generator)
          </h1>
          <p class="text-xs text-zinc-500 mt-1">
            パターン入力でリンクを一括生成し、編集して登録します
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="episodes = []"
            class="px-4 py-2 rounded-lg border border-zinc-700 text-xs font-bold hover:bg-zinc-800 transition"
          >
            クリア (Clear All)
          </button>
          <button
            @click="handleImport"
            :disabled="episodes.length === 0 || !selectedCollectionId || saving"
            class="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="saving"
              class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            ></span>
            <span>登録する (Save)</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div class="xl:col-span-1 space-y-6">
          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <label class="block text-xs font-bold text-zinc-400 mb-2 uppercase"
              >コレクション (Collection)</label
            >
            <select
              v-model="selectedCollectionId"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            >
              <option :value="null" disabled>選択してください</option>
              <option v-for="c in collections" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.type }})
              </option>
            </select>
          </div>

          <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <h3
              class="text-sm font-bold text-white mb-4 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 text-emerald-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
              自動生成 (Generator)
            </h3>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-[10px] text-zinc-500 mb-1"
                  >開始 (Start Ep)</label
                >
                <input
                  v-model.number="gen.start"
                  type="number"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-[10px] text-zinc-500 mb-1"
                  >終了 (End Ep)</label
                >
                <input
                  v-model.number="gen.end"
                  type="number"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-[10px] text-zinc-500 mb-1"
                  >動画リンク (Video URL Pattern)</label
                >
                <input
                  v-model="gen.videoPattern"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-1.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none font-mono"
                  placeholder="https://host.com/ep{n}.m3u8"
                />
                <p class="text-[10px] text-zinc-600 mt-1">
                  ※ {n} がエピソード番号に置換されます
                </p>
              </div>
              <div>
                <label class="block text-[10px] text-zinc-500 mb-1"
                  >字幕リンク (Sub URL Pattern) - Optional</label
                >
                <input
                  v-model="gen.subPattern"
                  type="text"
                  class="w-full bg-black border border-zinc-700 rounded px-3 py-1.5 text-xs text-yellow-400 focus:border-emerald-500 outline-none font-mono"
                  placeholder="https://host.com/ep{n}.vtt"
                />
              </div>
            </div>

            <button
              @click="handleGenerate"
              class="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition border border-zinc-700"
            >
              リストに追加 (Generate & Append)
            </button>
          </div>

          <button
            @click="addManualRow"
            class="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition text-sm flex items-center justify-center gap-2"
          >
            <span>＋</span> 手動で行を追加 (Add Empty Row)
          </button>
        </div>

        <div class="xl:col-span-2 flex flex-col h-[calc(100vh-12rem)]">
          <div
            class="bg-zinc-900/50 border border-white/5 rounded-t-xl px-4 py-3 flex justify-between items-center"
          >
            <span class="text-xs font-bold text-zinc-400 uppercase"
              >編集リスト ({{ episodes.length }})</span
            >
          </div>

          <div
            class="flex-1 overflow-y-auto bg-zinc-900/20 border-x border-b border-white/5 rounded-b-xl custom-scrollbar p-2 space-y-2"
          >
            <div
              v-if="episodes.length === 0"
              class="h-full flex flex-col items-center justify-center text-zinc-600 gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-8 h-8 opacity-50"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span class="text-sm"
                >左側のフォームから生成するか、手動で追加してください</span
              >
            </div>

            <div
              v-for="(ep, idx) in episodes"
              :key="idx"
              class="group bg-black border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition flex gap-3 items-start"
            >
              <div class="flex flex-col items-center gap-2 pt-1">
                <div
                  class="h-6 w-6 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-mono"
                >
                  {{ idx + 1 }}
                </div>
                <button
                  @click="removeRow(idx)"
                  class="text-zinc-600 hover:text-red-500 transition"
                  title="削除"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>

              <div class="flex-1 space-y-2">
                <div class="flex gap-2">
                  <div class="w-20">
                    <label class="block text-[9px] text-zinc-500 mb-0.5"
                      >Ep Num</label
                    >
                    <input
                      v-model.number="ep.episode_number"
                      type="number"
                      step="0.1"
                      class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none text-center"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-[9px] text-zinc-500 mb-0.5"
                      >Title</label
                    >
                    <input
                      v-model="ep.title"
                      type="text"
                      class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div class="flex gap-2">
                  <div class="flex-1">
                    <input
                      v-model="ep.video_path"
                      type="text"
                      placeholder="Video URL (.m3u8)"
                      class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-emerald-400 focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                  <div class="flex-1">
                    <input
                      v-model="ep.sub_url"
                      type="text"
                      placeholder="Subtitle URL (.vtt)"
                      class="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-yellow-400 focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import {
  useRoute,
  useRouter,
  useAsyncData,
  definePageMeta,
  useSupabaseClient,
} from "#imports";

definePageMeta({ middleware: "admin" });

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();
const seriesId = route.params.id;

// Load Collections
const { data: collections } = await useAsyncData(
  `admin-series-cols-${seriesId}`,
  async () => {
    const { data } = await supabase
      .from("episode_collections")
      .select("id, name, type")
      .eq("series_id", seriesId);
    return data;
  }
);

const selectedCollectionId = ref<number | null>(null);
const episodes = ref<any[]>([]);
const saving = ref(false);

// Auto-select first collection
if (collections.value && collections.value.length > 0) {
  const first = collections.value[0];
  if (first) selectedCollectionId.value = first.id;
}

// Generator Settings
const gen = reactive({
  start: 1,
  end: 12,
  videoPattern: "",
  subPattern: "",
});

const handleGenerate = () => {
  if (!gen.videoPattern) {
    alert("動画リンクパターンを入力してください (Video pattern required)");
    return;
  }

  for (let i = gen.start; i <= gen.end; i++) {
    // Replace {n}
    const vidUrl = gen.videoPattern.replace("{n}", String(i));
    const subUrl = gen.subPattern
      ? gen.subPattern.replace("{n}", String(i))
      : "";

    // [FIX] episodes.value
    episodes.value.push({
      episode_number: i,
      title: `第${i}話`,
      video_path: vidUrl,
      sub_url: subUrl, // Tạm thời lưu vào biến này, lúc save mới convert sang jsonb
      duration_minutes: 0,
      season_number: 1,
    });
  }
};

const addManualRow = () => {
  const nextEp =
    episodes.value.length > 0
      ? episodes.value[episodes.value.length - 1].episode_number + 1
      : 1;

  // [FIX] episodes.value
  episodes.value.push({
    episode_number: nextEp,
    title: `第${nextEp}話`,
    video_path: "",
    sub_url: "",
    duration_minutes: 0,
    season_number: 1,
  });
};

const removeRow = (index: number) => {
  // [FIX] episodes.value
  episodes.value.splice(index, 1);
};

const handleImport = async () => {
  // [FIX] episodes.value.length
  if (episodes.value.length === 0 || !selectedCollectionId.value) return;
  saving.value = true;

  // Convert data chuẩn bị gửi
  // [FIX] episodes.value
  const finalEpisodes = episodes.value.map((ep) => {
    const subtitles = [];
    if (ep.sub_url) {
      subtitles.push({ src: ep.sub_url, label: "Japanese", lang: "ja" });
    }
    return {
      episode_number: ep.episode_number,
      title: ep.title,
      video_path: ep.video_path,
      duration_minutes: ep.duration_minutes,
      season_number: ep.season_number,
      subtitles: subtitles,
    };
  });

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    await $fetch("/api/admin/episodes/bulk", {
      method: "POST",
      body: {
        seriesId: seriesId,
        collectionId: selectedCollectionId.value,
        episodes: finalEpisodes,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert(`${finalEpisodes.length}件のエピソードを追加しました`);
    router.push(`/admin/series/${seriesId}/collections`);
  } catch (e: any) {
    alert("エラー: " + e.message);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>
