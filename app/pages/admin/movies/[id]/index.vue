<template>
  <div v-if="loading" class="py-20 text-center">
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        スマートペースト (Smart Paste)
      </button>
    </div>

    <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
      <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
        基本情報 (Basic Info)
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">タイトル <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" required class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">原題</label>
            <input v-model="form.original_title" type="text" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">タイトルかな</label>
            <input v-model="form.title_kana" type="text" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">スラッグ (URL) <span class="text-red-500">*</span></label>
            <input v-model="form.slug" type="text" required class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white font-mono" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">公開年</label>
              <input v-model.number="form.year" type="number" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">製作国</label>
              <input v-model="form.origin_country" type="text" maxlength="2" placeholder="JP" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white uppercase" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">公開日 (Release Date)</label>
              <input v-model="form.release_date" type="date" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white [color-scheme:dark]" />
            </div>
             <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">再生時間 (分)</label>
              <input v-model.number="form.duration_minutes" type="number" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" />
            </div>
          </div>

          <!-- [NÂNG CẤP] KHU VỰC TAG ĐẠO DIỄN -->
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">監督 (Nhấn Enter để thêm)</label>
            <div class="flex flex-wrap gap-2 mb-2" v-if="form.directors.length">
              <span v-for="(dir, idx) in form.directors" :key="idx" class="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                {{ dir.name }}
                <button type="button" @click="form.directors.splice(idx, 1)" class="text-zinc-500 hover:text-red-400 transition">&times;</button>
              </span>
            </div>
            <input 
              v-model="directorInput" 
              @keydown.enter.prevent="addDirector" 
              type="text" 
              placeholder="Tên đạo diễn rồi nhấn Enter..." 
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" 
            />
          </div>

          <!-- [NÂNG CẤP] KHU VỰC TAG DIỄN VIÊN -->
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">キャスト (Nhấn Enter để thêm)</label>
            <div class="flex flex-wrap gap-2 mb-2" v-if="form.casts.length">
              <span v-for="(cast, idx) in form.casts" :key="idx" class="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                {{ cast.name }}
                <button type="button" @click="form.casts.splice(idx, 1)" class="text-zinc-500 hover:text-red-400 transition">&times;</button>
              </span>
            </div>
            <input 
              v-model="castInput" 
              @keydown.enter.prevent="addCast" 
              type="text" 
              placeholder="Tên diễn viên rồi nhấn Enter..." 
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white" 
            />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-xs font-medium text-zinc-400 mb-1">あらすじ</label>
        <textarea v-model="form.description" rows="4" class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none text-white"></textarea>
      </div>
    </div>

    <!-- KHU VỰC THỂ LOẠI -->
    <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
      <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
        ジャンル (Genres)
      </h2>
      <div v-if="genresLoading" class="text-xs text-zinc-500">Loading genres...</div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <label v-for="genre in genres" :key="genre.id" class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" :value="genre.id" v-model="form.genre_ids" class="w-4 h-4 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
          <span class="text-sm text-zinc-400 group-hover:text-white transition-colors">{{ genre.name_ja || genre.name }}</span>
        </label>
      </div>
    </div>

    <!-- KHU VỰC HÌNH ẢNH -->
    <div class="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
      <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
        画像設定
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-2">ポスター (Vertical)</label>
          <FormImageUpload v-model="form.poster_url" folder="posters" ratio="poster" class="w-full" />
        </div>
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-2">バナー (Horizontal)</label>
          <FormImageUpload v-model="form.banner_url" folder="banners" ratio="banner" class="w-full" />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-white/5">
      <button type="button" @click="handleDelete" class="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        削除する
      </button>

      <button type="submit" :disabled="saving" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
        <span>更新する</span>
      </button>
    </div>

    <SmartPasteModal :show="showSmartPaste" :genres="genres" @close="showSmartPaste = false" @apply="handleSmartPaste" />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter, definePageMeta, useSupabaseClient } from "#imports";
import FormImageUpload from "~/components/FormImageUpload.vue";
import SmartPasteModal from "~/components/SmartPasteModal.vue";

definePageMeta({ middleware: "admin" });

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();
const movieId = route.params.id;

const loading = ref(true);
const saving = ref(false);
const showSmartPaste = ref(false);

const genres = ref<any[]>([]);
const genresLoading = ref(true);

// [MỚI] Biến tạm để nhập Tag
const directorInput = ref("");
const castInput = ref("");

const form = reactive({
  title: "",
  original_title: "",
  title_kana: "",
  slug: "",
  year: new Date().getFullYear(),
  origin_country: "JP",
  description: "",
  poster_url: "",
  banner_url: "",
  duration_minutes: 0,
  release_date: "",
  genre_ids: [] as number[],
  // [MỚI] Mảng lưu trữ Tag thay vì lưu chuỗi Text
  directors: [] as { id: number | null, name: string }[],
  casts: [] as { id: number | null, name: string }[]
});

// [MỚI] Hàm xử lý khi nhấn Enter ở ô nhập Đạo diễn
const addDirector = () => {
  const val = directorInput.value.trim();
  if (val && !form.directors.find(d => d.name === val)) {
    form.directors.push({ id: null, name: val });
  }
  directorInput.value = "";
};

// [MỚI] Hàm xử lý khi nhấn Enter ở ô nhập Diễn viên
const addCast = () => {
  const val = castInput.value.trim();
  if (val && !form.casts.find(c => c.name === val)) {
    form.casts.push({ id: null, name: val });
  }
  castInput.value = "";
};

onMounted(async () => {
  try {
    const { data: genresData } = await supabase.from("genres").select("id, name, name_ja").order("sort_order", { ascending: true });
    genres.value = genresData || [];
    genresLoading.value = false;

    const { data: movieData, error } = await supabase.from("movies").select("*").eq("id", movieId).single();
    if (error) throw error;

    const { data: selectedGenres } = await supabase.from("movie_genres").select("genre_id").eq("movie_id", movieId);
    
    // [MỚI] Kéo danh sách diễn viên/đạo diễn từ bảng content_crew mới
    const { data: crewData } = await supabase
      .from("content_crew")
      .select("role, persons(id, name)")
      .eq("content_id", movieId)
      .eq("type", "movie");

    Object.assign(form, {
      title: movieData.title || "",
      original_title: movieData.original_title || "",
      title_kana: movieData.title_kana || "",
      slug: movieData.slug || "",
      year: movieData.year || new Date().getFullYear(),
      origin_country: movieData.origin_country || "JP",
      description: movieData.description || "",
      poster_url: movieData.poster_url || "",
      banner_url: movieData.banner_url || "",
      duration_minutes: movieData.duration_minutes || 0,
      release_date: movieData.release_date || "",
      genre_ids: selectedGenres ? selectedGenres.map((x: any) => x.genre_id) : [],
      // Cấu hình data trả về cho UI mảng Tags
      directors: crewData ? crewData.filter((c: any) => c.role === 'director').map((c: any) => ({ id: c.persons.id, name: c.persons.name })) : [],
      casts: crewData ? crewData.filter((c: any) => c.role === 'cast').map((c: any) => ({ id: c.persons.id, name: c.persons.name })) : []
    });
  } catch (e: any) {
    alert("エラー: " + e.message);
    router.push("/admin/movies");
  } finally {
    loading.value = false;
  }
});

const handleSmartPaste = (data: any) => {
  // Copy đè các thuộc tính thông thường
  Object.assign(form, {
    title: data.title || form.title,
    original_title: data.original_title || form.original_title,
    title_kana: data.title_kana || form.title_kana,
    slug: data.slug || form.slug,
    year: data.year || form.year,
    origin_country: data.origin_country || form.origin_country,
    description: data.description || form.description,
    duration_minutes: data.duration_minutes || form.duration_minutes,
    release_date: data.release_date || form.release_date,
    poster_url: data.poster_url || form.poster_url,
    banner_url: data.banner_url || form.banner_url
  });

  // Tự động "băm" chuỗi thành các thẻ Tag cho Đạo diễn & Diễn viên
  if (data.director) {
    form.directors = data.director.split(',').map((n: string) => ({ id: null, name: n.trim() })).filter((n: any) => n.name);
  }
  if (data.main_cast) {
    form.casts = data.main_cast.split(',').map((n: string) => ({ id: null, name: n.trim() })).filter((n: any) => n.name);
  }

  // [THÊM MỚI] Xử lý tự động tick Thể loại (Genres)
  const incomingGenres = data.genres || data.genre; 
  if (incomingGenres) {
    // Chuẩn hóa dữ liệu đầu vào thành mảng các chuỗi
    const genreNames = Array.isArray(incomingGenres)
      ? incomingGenres
      : incomingGenres.split(',').map((g: string) => g.trim());

    // Dò tìm ID tương ứng trong danh sách genres của hệ thống (không phân biệt hoa/thường)
    const matchedIds = genreNames.map((gName: string) => {
      const found = genres.value.find(
        (g: any) => g.name?.toLowerCase() === gName.toLowerCase() ||
                    g.name_ja?.toLowerCase() === gName.toLowerCase()
      );
      return found ? found.id : null;
    }).filter((id: number | null) => id !== null);

    // Ghép các ID tìm được vào mảng hiện tại và lọc trùng lặp
    if (matchedIds.length > 0) {
      form.genre_ids = [...new Set([...form.genre_ids, ...matchedIds])];
    }
  }
};

// [MỚI] Hàm Helper để xử lý việc Tạo Mới & Nối ID tự động
const syncCrew = async (crewList: { id: number | null, name: string }[], role: string) => {
  const toLink = [];
  for (const person of crewList) {
    let personId = person.id;
    
    // Nếu chưa có ID -> Dùng Upsert để nhét vào bảng persons (Tự động tránh trùng tên nhờ UNIQUE)
    if (!personId) {
      const { data: pData, error: pError } = await supabase
        .from('persons')
        .upsert({ name: person.name }, { onConflict: 'name' })
        .select('id')
        .single();
        
      if (pData) personId = pData.id;
    }
    
    // Nếu đã có ID (Hoặc vừa lấy được ID mới) -> Chuẩn bị record để đẩy vào bảng trung gian
    if (personId) {
      toLink.push({
        content_id: movieId,
        person_id: personId,
        type: 'movie',
        role: role
      });
    }
  }
  return toLink;
};

const handleUpdate = async () => {
  if (!form.title || !form.slug) {
    alert("タイトルとスラッグは必須です");
    return;
  }

  saving.value = true;
  try {
    // 1. [LỊCH SỬ SLUG] - Code cũ tôi viết cho bạn
    const { data: oldData, error: fetchError } = await supabase.from("movies").select("slug").eq("id", movieId).single();
    if (fetchError) throw fetchError;

    if (oldData && oldData.slug !== form.slug) {
      const { error: historyError } = await supabase.from("movie_slug_history").insert({ movie_id: movieId, slug: oldData.slug });
      if (historyError) console.warn("Lỗi lưu lịch sử slug:", historyError.message);
    }

    // 2. CẬP NHẬT MOVIE CƠ BẢN
    const { genre_ids, directors, casts, ...movieData } = form; // Bóc tách mảng mới ra
    const updateData = { ...movieData, release_date: movieData.release_date || null, updated_at: new Date() };
    
    const { error } = await supabase.from("movies").update(updateData).eq("id", movieId);
    if (error) throw error;

    // 3. ĐỒNG BỘ THỂ LOẠI
    await supabase.from("movie_genres").delete().eq("movie_id", movieId);
    if (genre_ids && genre_ids.length > 0) {
      const inserts = genre_ids.map((gid) => ({ movie_id: movieId, genre_id: gid }));
      const { error: gError } = await supabase.from("movie_genres").insert(inserts);
      if (gError) throw gError;
    }

    // 4. [MỚI] ĐỒNG BỘ DIỄN VIÊN / ĐẠO DIỄN
    // 4a. Xóa sạch dữ liệu kết nối cũ của phim này
    await supabase.from("content_crew").delete().eq("content_id", movieId).eq("type", "movie");
    
    // 4b. Tạo nhân vật mới (nếu có) và thu thập ID
    const directorLinks = await syncCrew(form.directors, 'director');
    const castLinks = await syncCrew(form.casts, 'cast');
    const allCrewLinks = [...directorLinks, ...castLinks];
    
    // 4c. Đẩy toàn bộ dây kết nối mới vào bảng trung gian
    if (allCrewLinks.length > 0) {
      const { error: crewError } = await supabase.from("content_crew").insert(allCrewLinks);
      if (crewError) throw crewError;
    }

    alert("更新しました");
  } catch (e: any) {
    alert("エラー: " + e.message);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm("本当に削除しますか？")) return;
  saving.value = true;
  try {
    const { error } = await supabase.from("movies").delete().eq("id", movieId);
    if (error) throw error;
    router.push("/admin/movies");
  } catch (e: any) {
    alert("エラー: " + e.message);
    saving.value = false;
  }
};
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>