<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">国・地域管理 (Countries)</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画やシリーズの製作国を管理します
          </p>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            to="/admin"
            class="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-800 text-zinc-300"
          >
            &larr; Admin Top
          </NuxtLink>
        </div>
      </div>

      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-5">
        <h2
          class="mb-4 text-xs font-bold text-emerald-400 uppercase tracking-wider"
        >
          新規登録 (Add New)
        </h2>

        <form
          class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          @submit.prevent="handleAdd"
        >
          <div class="md:col-span-2">
            <label
              class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold"
              >Code (ISO)</label
            >
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="US, JP..."
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none uppercase font-mono"
              maxlength="3"
            />
          </div>

          <div class="md:col-span-4">
            <label
              class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold"
              >名前 (English)</label
            >
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="United States"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div class="md:col-span-4">
            <label
              class="mb-1 block text-[10px] text-zinc-500 uppercase font-bold"
              >名前 (日本語)</label
            >
            <input
              v-model="form.name_ja"
              type="text"
              required
              placeholder="アメリカ"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div class="md:col-span-2">
            <button
              type="submit"
              :disabled="loading"
              class="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-lg shadow-emerald-900/20"
            >
              <span v-if="loading">...</span>
              <span v-else>追加</span>
            </button>
          </div>
        </form>

        <p v-if="errorMsg" class="mt-2 text-xs text-red-400">{{ errorMsg }}</p>
      </div>

      <div v-if="pending" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>

      <div v-else>
        <div
          class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl"
        >
          <table class="w-full text-left text-sm text-zinc-400">
            <thead
              class="bg-zinc-950 text-zinc-200 uppercase text-xs font-semibold tracking-wider"
            >
              <tr>
                <th class="px-4 py-3 w-16 text-center">Code</th>
                <th class="px-4 py-3">名前 (EN)</th>
                <th class="px-4 py-3">名前 (JA)</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr
                v-for="c in countries"
                :key="c.code"
                class="hover:bg-zinc-800/50 transition-colors"
              >
                <td
                  class="px-4 py-3 text-center font-mono text-emerald-500 font-bold"
                >
                  {{ c.code }}
                </td>
                <td class="px-4 py-3 text-zinc-200">{{ c.name }}</td>
                <td class="px-4 py-3 text-zinc-300">{{ c.name_ja }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    @click="deleteCountry(c.code)"
                    class="text-zinc-500 hover:text-red-400 transition px-2 py-1 rounded hover:bg-zinc-800"
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
                </td>
              </tr>
              <tr v-if="countries?.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-zinc-600">
                  データがありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useSupabaseClient, useAsyncData, definePageMeta } from "#imports";

definePageMeta({ middleware: "admin" });

const supabase = useSupabaseClient<any>();
const loading = ref(false);
const errorMsg = ref("");

const form = reactive({
  code: "",
  name: "",
  name_ja: "",
});

// Fetch Data
const {
  data: countries,
  pending,
  refresh,
} = await useAsyncData("admin-countries", async () => {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
});

// Add Country
const handleAdd = async () => {
  loading.value = true;
  errorMsg.value = "";

  try {
    const { error } = await supabase.from("countries").insert({
      code: form.code.toUpperCase(),
      name: form.name,
      name_ja: form.name_ja,
    });

    if (error) throw error;

    // Reset & Refresh
    form.code = "";
    form.name = "";
    form.name_ja = "";
    refresh();
  } catch (e: any) {
    errorMsg.value = "Error: " + e.message;
  } finally {
    loading.value = false;
  }
};

// Delete Country
const deleteCountry = async (code: string) => {
  if (!confirm(`国コード「${code}」を削除しますか？`)) return;

  try {
    const { error } = await supabase
      .from("countries")
      .delete()
      .eq("code", code);

    if (error) throw error;
    refresh();
  } catch (e: any) {
    alert(e.message);
  }
};
</script>
