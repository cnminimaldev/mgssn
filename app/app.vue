<template>
  <div
    class="min-h-screen bg-[#05060a] text-zinc-300 font-sans selection:bg-emerald-500/30"
  >
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 bg-black/80 backdrop-blur-md"
    >
      <div
        class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div
              class="relative h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <span
                class="absolute inset-0 flex items-center justify-center font-bold text-white text-lg"
                >M</span
              >
            </div>
            <span
              class="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors"
              >無限テレビ</span
            >
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
            <NuxtLink
              to="/"
              class="hover:text-white transition-colors"
              active-class="text-emerald-400"
              >ホーム</NuxtLink
            >
            <NuxtLink
              to="/search"
              class="hover:text-white transition-colors"
              active-class="text-emerald-400"
              >探す</NuxtLink
            >
            <NuxtLink
              to="/ranking"
              class="hover:text-white transition-colors flex items-center gap-1"
              active-class="text-emerald-400"
            >
              <span class="text-yellow-500">🏆</span> ランキング
            </NuxtLink>
            <NuxtLink
              to="/my-list"
              class="hover:text-white transition-colors"
              active-class="text-emerald-400"
              >マイリスト</NuxtLink
            >
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink
            to="/search"
            class="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </NuxtLink>

          <div v-if="user" class="relative group/user">
            <button
              class="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all"
            >
              <img
                :src="
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.email}&background=10b981&color=fff`
                "
                class="h-8 w-8 rounded-full object-cover bg-zinc-800"
                alt="User"
              />
            </button>

            <div
              class="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-zinc-900 border border-white/10 p-1 shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 transform scale-95 group-hover/user:scale-100"
            >
              <div
                class="px-3 py-2 text-xs text-zinc-500 border-b border-white/5 mb-1 truncate"
              >
                {{ user.email }}
              </div>
              <div class="px-3 py-2 text-xs text-zinc-400 mb-1">
                Role:
                <span
                  :class="
                    isAdmin ? 'text-purple-400 font-bold' : 'text-zinc-500'
                  "
                  >{{ user.role }}</span
                >
              </div>
              <NuxtLink
                to="/admin"
                v-if="isAdmin"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10 text-emerald-400"
              >
                <span>🛠</span> 管理画面
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10 text-red-400"
              >
                <span>🚪</span> ログアウト
              </button>
            </div>
          </div>

          <NuxtLink
            v-else
            to="/login"
            class="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-colors"
          >
            ログイン
          </NuxtLink>

          <button
            class="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
            @click="isDrawerOpen = true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <Teleport to="body">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
        @click="isDrawerOpen = false"
      ></div>

      <div
        class="fixed inset-y-0 right-0 z-[70] w-64 bg-[#0a0a0a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out p-6 flex flex-col"
        :class="isDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex items-center justify-between mb-8">
          <span class="text-lg font-bold text-white">メニュー</span>
          <button
            class="p-2 -mr-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            @click="isDrawerOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav class="flex flex-col gap-2 flex-1">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            active-class="bg-emerald-500/10 text-emerald-400"
            @click="isDrawerOpen = false"
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
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            ホーム
          </NuxtLink>
          <NuxtLink
            to="/search"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            active-class="bg-emerald-500/10 text-emerald-400"
            @click="isDrawerOpen = false"
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            探す
          </NuxtLink>
          <NuxtLink
            to="/ranking"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            active-class="bg-emerald-500/10 text-emerald-400"
            @click="isDrawerOpen = false"
          >
            <span class="text-lg w-5 text-center">🏆</span>
            ランキング
          </NuxtLink>
          <NuxtLink
            to="/my-list"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            active-class="bg-emerald-500/10 text-emerald-400"
            @click="isDrawerOpen = false"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            マイリスト
          </NuxtLink>
        </nav>

        <div
          v-if="user"
          class="mt-auto border-t border-white/10 pt-6 space-y-2"
        >
          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:bg-white/10 transition-colors"
            @click="isDrawerOpen = false"
          >
            <span>🛠</span> 管理画面
          </NuxtLink>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/10 transition-colors"
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
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            ログアウト
          </button>
        </div>
      </div>
    </Teleport>

    <main class="pt-16">
      <NuxtPage />
    </main>

    <footer class="mt-20 border-t border-white/5 bg-black py-10 text-center">
      <p class="text-xs text-zinc-500">
        &copy; {{ new Date().getFullYear() }} 無限テレビ. All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useMyList } from "~/composables/useMyList";
import { useRoute, useSupabaseUser } from "#imports";

const { user, isAdmin, logout, fetchProfile } = useAuth();
const { fetchMyList, clearMyList } = useMyList();
const supabaseUser = useSupabaseUser();
const isDrawerOpen = ref(false);
const route = useRoute();

// --- LOGIC GLOBAL AUTH (Chỉ chạy 1 lần tại đây) ---

// 1. Khi App vừa load (F5), nếu đã login thì lấy Profile + My List ngay
onMounted(() => {
  if (supabaseUser.value) {
    fetchProfile();
    fetchMyList();
  }
});

// 2. Theo dõi đăng nhập/đăng xuất toàn cục
watch(supabaseUser, (newUser) => {
  if (newUser) {
    // Vừa login -> Lấy profile & mylist
    fetchProfile();
    fetchMyList();
  } else {
    // Logout -> Xóa dữ liệu local
    clearMyList();
  }
});

// --------------------------------------------------

// Đóng drawer khi chuyển trang
watch(route, () => {
  isDrawerOpen.value = false;
});

const handleLogout = async () => {
  await logout();
  // clearMyList đã được gọi ở watcher rồi
  isDrawerOpen.value = false;
  window.location.href = "/";
};
</script>

<style>
.translate-x-full {
  transform: translateX(100%);
}
.translate-x-0 {
  transform: translateX(0);
}
</style>
