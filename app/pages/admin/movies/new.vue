<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold">新しい映画を追加</h1>
        <NuxtLink to="/admin" class="text-sm text-zinc-400 hover:text-zinc-200">
          戻る
        </NuxtLink>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Title -->
        <div>
          <label class="mb-1 block text-sm">タイトル（日本向け）</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <!-- Original Title -->
        <div>
          <label class="mb-1 block text-sm">原題</label>
          <input
            v-model="form.original_title"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: Frozen"
          />
          <p class="mt-1 text-xs text-zinc-500">
            日本でのタイトルとは別に、オリジナルの英語名や韓国語名などを入力します。
          </p>
        </div>

        <!-- Title Kana -->
        <div>
          <label class="mb-1 block text-sm">タイトル（かな）</label>
          <input
            v-model="form.title_kana"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: あなとゆきのじょおう"
          />
          <p class="mt-1 text-xs text-zinc-500">
            検索用。かな・カタカナからの検索に使われます。
          </p>
        </div>

        <!-- Slug -->
        <div>
          <label class="mb-1 block text-sm">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: frozen"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label class="mb-1 block text-sm">説明</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <!-- Year + Duration + Release date -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1 block text-sm">年</label>
            <input
              v-model.number="form.year"
              type="number"
              min="1900"
              max="2100"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">上映時間（分）</label>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="1"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm">公開日</label>
            <input
              v-model="form.release_date"
              type="date"
              class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <!-- Origin Country -->
        <div>
          <label class="mb-1 block text-sm">製作国</label>

          <div v-if="countryOptions.length">
            <select
              v-model="form.origin_country"
              class="w-40 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">選択してください</option>
              <option v-for="c in countryOptions" :key="c.code" :value="c.code">
                {{ c.name_ja }} ({{ c.code }})
              </option>
            </select>
          </div>

          <p class="mt-1 text-xs text-zinc-500">
            ISO 2文字コード（例: JP / US /
            KR）。国・地域は「国・地域管理」から追加してください。
          </p>
        </div>

        <!-- Genres (multi-select) -->
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="block text-sm">ジャンル（複数選択可）</label>
            <button
              v-if="genreOptions.length"
              type="button"
              class="text-xs text-emerald-300 hover:text-emerald-200"
              @click="selectedGenreIds = []"
            >
              クリア
            </button>
          </div>

          <div v-if="genreOptions.length" class="flex flex-wrap gap-2">
            <button
              v-for="g in genreOptions"
              :key="g.id"
              type="button"
              class="rounded-full border px-3 py-1 text-xs transition"
              :class="
                selectedGenreIds.includes(g.id)
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-400'
              "
              @click="toggleGenre(g.id)"
            >
              {{ g.name_ja || g.name || g.slug }}
            </button>
          </div>

          <p v-else class="mt-1 text-xs text-zinc-500">
            ジャンルがまだ登録されていません。Supabase
            の「genres」テーブルに追加してください。
          </p>
        </div>

        <!-- Director -->
        <div>
          <label class="mb-1 block text-sm">監督</label>
          <input
            v-model="form.director"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: 山田太郎"
          />
        </div>

        <!-- Main Cast -->
        <div>
          <label class="mb-1 block text-sm">主演</label>
          <input
            v-model="form.main_cast"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="例: 山田太郎, 佐藤花子"
          />
          <p class="mt-1 text-xs text-zinc-500">
            カンマ区切りで入力してください。
          </p>
        </div>

        <!-- Video Path -->
        <div>
          <label class="mb-1 block text-sm">動画パス（HLS .m3u8）</label>
          <input
            v-model="form.video_path"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
            placeholder="/hls/movie1/index.m3u8"
          />
        </div>

        <!-- Poster / Banner -->
        <div>
          <label class="mb-1 block text-sm">ポスターURL</label>
          <input
            v-model="form.poster_url"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">バナーURL</label>
          <input
            v-model="form.banner_url"
            type="text"
            class="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
          />
        </div>

        <!-- Featured -->
        <div>
          <label class="inline-flex items-center gap-2 text-sm">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="rounded border-zinc-600 bg-zinc-900"
            />
            注目作品（featured）
          </label>
        </div>

        <!-- Messages -->
        <div v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-sm text-emerald-400">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="mt-2 inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? "保存中…" : "保存する" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter, useSupabaseClient, useAsyncData } from "#imports";

const router = useRouter();
const supabase = useSupabaseClient<any>();

// --- genres list ---
type GenreRow = {
  id: number;
  slug: string;
  name: string | null;
  name_ja: string | null;
};

type CountryRow = {
  code: string;
  name: string;
  name_ja: string;
  sort_order: number | null;
  is_active: boolean | null;
};

const { data: genresData } = await useAsyncData<GenreRow[]>(
  "admin-genres",
  async () => {
    const { data, error } = await supabase
      .from("genres")
      .select("id, slug, name, name_ja")
      .order("name_ja", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }
);

const { data: countriesData } = await useAsyncData<CountryRow[]>(
  "admin-countries",
  async () => {
    const { data, error } = await supabase
      .from("countries")
      .select("code, name, name_ja, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name_ja", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }
);

const countryOptions = computed<CountryRow[]>(() => countriesData.value ?? []);

const genreOptions = computed<GenreRow[]>(() => genresData.value ?? []);
const selectedGenreIds = ref<number[]>([]);

const toggleGenre = (id: number) => {
  const idx = selectedGenreIds.value.indexOf(id);
  if (idx === -1) {
    selectedGenreIds.value.push(id);
  } else {
    selectedGenreIds.value.splice(idx, 1);
  }
};

// --- form state ---
const form = reactive({
  title: "",
  original_title: "",
  title_kana: "",
  slug: "",
  description: "",
  year: undefined as number | undefined,
  duration_minutes: undefined as number | undefined,
  release_date: "" as string, // 'YYYY-MM-DD'
  origin_country: "",
  director: "",
  main_cast: "",
  video_path: "",
  poster_url: "",
  banner_url: "",
  is_featured: false,
});

const submitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  submitting.value = true;

  try {
    const payload = {
      title: form.title,
      original_title: form.original_title || null,
      title_kana: form.title_kana || null,
      slug: form.slug,
      description: form.description || null,
      year: form.year ?? null,
      duration_minutes: form.duration_minutes ?? null,
      release_date: form.release_date || null,
      origin_country: form.origin_country || null,
      director: form.director || null,
      main_cast: form.main_cast || null,
      video_path: form.video_path || null,
      poster_url: form.poster_url || null,
      banner_url: form.banner_url || null,
      is_featured: form.is_featured,
    };

    // 1) insert movie + lấy id
    const { data: inserted, error } = await supabase
      .from("movies")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    const movieId = inserted?.id as number | undefined;
    if (movieId && selectedGenreIds.value.length > 0) {
      // 2) insert vào movie_genres
      const mgPayload = selectedGenreIds.value.map((gid) => ({
        movie_id: movieId,
        genre_id: gid,
      }));

      const { error: mgError } = await supabase
        .from("movie_genres")
        .insert(mgPayload);

      if (mgError) {
        // Không block việc tạo phim, nhưng báo lỗi cho admin
        console.error(mgError);
        errorMessage.value =
          "映画は作成されましたが、ジャンルの紐付けに失敗しました: " +
          mgError.message;
        return;
      }
    }

    successMessage.value = "映画を作成しました。";
    setTimeout(() => {
      router.push("/admin");
    }, 700);
  } finally {
    submitting.value = false;
  }
};
</script>
