<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-50 font-sans">
    <header
      class="fixed inset-x-0 top-0 z-10 border-b border-white/5 bg-black/60 backdrop-blur-md"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/5"
        >
          <span class="rounded-lg bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.16em]">
            無限
          </span>
          <span class="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
            Stream
          </span>
        </NuxtLink>

        <nav class="ml-4 hidden gap-4 text-sm text-zinc-300 sm:flex sm:text-[13px]">
          <NuxtLink to="/" class="hover:text-white"> ホーム </NuxtLink>
          <NuxtLink to="/search" class="hover:text-white"> 探す </NuxtLink>
          <NuxtLink to="/my-list" class="hover:text-white"> マイリスト </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-3">
          <div class="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 sm:flex">
            <span class="text-[11px] text-zinc-400">検索</span>
            <input
              v-model="headerKeyword"
              type="text"
              placeholder="タイトル、ジャンル"
              class="w-32 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:w-44"
              @keydown.enter="handleHeaderSearch"
            />
          </div>

          <button
            v-if="!isLoggedIn"
            type="button"
            class="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow hover:bg-emerald-400 sm:text-sm"
            @click="goLogin"
          >
            ログイン
          </button>

          <div v-else class="flex items-center gap-2 text-[11px] sm:text-xs">
            <span class="hidden text-zinc-300 sm:inline">
              {{ user?.name }} さん
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-xs font-semibold">
              {{ userInitial }}
            </div>
            <button
              type="button"
              class="rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
              @click="logout"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="pt-16">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"; // Thêm watch
import { useRouter, useAuth, useHead, navigateTo } from "#imports";
import { useMyList } from "~/composables/useMyList"; // Import useMyList

useHead({
  htmlAttrs: {
    lang: "ja",
  },
  meta: [{ property: "og:locale", content: "ja_JP" }],
});

const router = useRouter();
const { user, isLoggedIn, logout } = useAuth();
// Lấy hàm fetch và clear từ useMyList
const { fetchMyList, clearMyList } = useMyList(); 

// --- GLOBAL WATCHER ---
// Chỉ đặt watcher ở đây để đảm bảo chỉ chạy 1 lần cho toàn app
watch(user, (newUser) => {
  if (newUser) {
    // Có user -> tải danh sách
    fetchMyList()
  } else {
    // Mất user (logout) -> xóa danh sách
    clearMyList()
  }
}, { immediate: true })

// --- Header Search Logic ---
const headerKeyword = ref("");

const handleHeaderSearch = async () => {
  if (!headerKeyword.value.trim()) return;
  await navigateTo({
    path: "/search",
    query: { q: headerKeyword.value },
  });
  headerKeyword.value = "";
};

const goLogin = () => {
  router.push("/login");
};

const userInitial = computed(() => {
  const name = user.value?.name?.trim();
  if (!name) return "U";
  return name[0]?.toUpperCase();
});
</script>