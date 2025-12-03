<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div
        class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold">シリーズ管理</h1>
          <p class="mt-1 text-xs text-zinc-400">
            連続ドラマ・アニメなどのシリーズ作品を管理します。
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink
            to="/admin"
            class="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-400"
          >
            管理トップへ戻る
          </NuxtLink>

          <NuxtLink
            to="/admin/series/new"
            class="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400"
          >
            新しいシリーズを追加
          </NuxtLink>
        </div>
      </div>

      <!-- Danh sách series -->
      <div class="rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <div
          class="mb-3 flex items-center justify-between text-xs text-zinc-400"
        >
          <span>登録済みのシリーズ</span>
          <span v-if="seriesList.length">{{ seriesList.length }} 件</span>
        </div>

        <div v-if="loading" class="py-8 text-center text-sm text-zinc-400">
          読み込み中…
        </div>

        <div
          v-else-if="errorMessage"
          class="py-8 text-center text-sm text-red-400"
        >
          {{ errorMessage }}
        </div>

        <div v-else>
          <div
            v-if="!seriesList.length"
            class="py-8 text-center text-sm text-zinc-400"
          >
            シリーズがまだ登録されていません。右上の「新しいシリーズを追加」から登録してください。
          </div>

          <ul v-else class="divide-y divide-white/5 text-sm">
            <li
              v-for="s in seriesList"
              :key="s.id"
              class="flex items-center justify-between gap-3 py-2.5"
            >
              <div class="flex flex-1 items-center gap-3">
                <div class="h-14 w-10 overflow-hidden rounded bg-zinc-900">
                  <img
                    v-if="s.poster_url"
                    :src="s.poster_url"
                    :alt="s.title"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="truncate text-sm font-medium text-zinc-50">
                      {{ s.title }}
                    </p>
                    <span v-if="s.year" class="text-[11px] text-zinc-400">
                      {{ s.year }}年
                    </span>
                  </div>
                  <div
                    class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400"
                  >
                    <span v-if="s.origin_country">
                      製作国: {{ s.origin_country }}
                    </span>
                    <span
                      v-if="s.is_featured"
                      class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
                    >
                      featured
                    </span>
                    <span
                      v-if="s.slug"
                      class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                    >
                      slug: {{ s.slug }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 text-xs">
                <!-- Episodes list -->
                <NuxtLink
                  :to="`/admin/series/${s.id}/collections`"
                  class="text-zinc-300 hover:text-zinc-100"
                >
                  コレクション一覧
                </NuxtLink>

                <!-- Edit series -->
                <NuxtLink
                  :to="`/admin/series/${s.id}`"
                  class="text-emerald-300 hover:text-emerald-200"
                >
                  編集
                </NuxtLink>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSupabaseClient } from "#imports";

type SeriesRow = {
  id: number;
  title: string;
  slug: string | null;
  year: number | null;
  origin_country: string | null;
  poster_url: string | null;
  is_featured: boolean | null;
};

const supabase = useSupabaseClient<any>();

const seriesList = ref<SeriesRow[]>([]);
const loading = ref(true);
const errorMessage = ref("");

const loadSeries = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await supabase
      .from("series")
      .select("id, title, slug, year, origin_country, poster_url, is_featured")
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    seriesList.value = (data ?? []) as SeriesRow[];
  } finally {
    loading.value = false;
  }
};

await loadSeries();
</script>
