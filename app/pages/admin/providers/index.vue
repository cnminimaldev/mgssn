<template>
  <div class="min-h-screen bg-[#05060a] text-zinc-300 p-6 sm:p-10">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/admin"
            class="text-xs text-emerald-400 hover:underline mb-2 block"
            >&larr; 管理画面に戻る</NuxtLink
          >
          <h1 class="text-2xl font-bold text-white">
            プロバイダー管理 (Providers)
          </h1>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-500 transition shadow-lg shadow-yellow-900/20"
        >
          <span>＋</span> 新規作成
        </button>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-white/5 text-xs uppercase text-zinc-400">
            <tr>
              <th class="px-6 py-4 font-medium">ID</th>
              <th class="px-6 py-4 font-medium">Name</th>
              <th class="px-6 py-4 font-medium">Code</th>
              <th class="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-if="pending" class="bg-black/20">
              <td colspan="4" class="px-6 py-8 text-center text-zinc-500">
                Loading...
              </td>
            </tr>
            <tr
              v-else
              v-for="p in providers"
              :key="p.id"
              class="hover:bg-white/5 transition-colors"
            >
              <td class="px-6 py-3 font-mono text-xs text-zinc-500">
                {{ p.id }}
              </td>
              <td class="px-6 py-3 text-white font-medium">{{ p.name }}</td>
              <td class="px-6 py-3 text-yellow-400 font-mono text-xs">
                {{ p.code || "-" }}
              </td>
              <td class="px-6 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(p)"
                    class="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteProvider(p)"
                    class="p-1.5 rounded text-red-400 hover:text-white hover:bg-red-500/80 transition"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BaseModal
        v-model="showModal"
        :title="isEditing ? 'プロバイダー編集 (Edit)' : '新規登録 (New)'"
      >
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >Name <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
              placeholder="Netflix"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >Code</label
            >
            <input
              v-model="form.code"
              type="text"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none uppercase"
              placeholder="NFLX"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1"
              >Website URL</label
            >
            <input
              v-model="form.website_url"
              type="text"
              class="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
              placeholder="https://..."
            />
          </div>
        </form>
        <template #footer>
          <button
            @click="showModal = false"
            class="px-4 py-2 rounded text-sm text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="saving"
            class="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
          >
            <span
              v-if="saving"
              class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"
            ></span>
            <span>Save</span>
          </button>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useSupabaseClient, useAsyncData, definePageMeta } from "#imports";
import BaseModal from "~/components/BaseModal.vue";

definePageMeta({ middleware: "admin" });
const supabase = useSupabaseClient<any>();

const {
  data: providersData,
  pending,
  refresh,
} = await useAsyncData("admin-providers", async () => {
  const { data } = await supabase
    .from("collection_providers")
    .select("*")
    .order("id");
  return data;
});
const providers = computed(() => providersData.value || []);

const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  name: "",
  code: "",
  website_url: "",
});

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  Object.assign(form, { name: "", code: "", website_url: "" });
  showModal.value = true;
};

const openEditModal = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  Object.assign(form, {
    name: item.name,
    code: item.code,
    website_url: item.website_url,
  });
  showModal.value = true;
};

const handleSave = async () => {
  if (!form.name) return;
  saving.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await supabase
        .from("collection_providers")
        .update({ ...form })
        .eq("id", editingId.value);
    } else {
      await supabase.from("collection_providers").insert({ ...form });
    }
    await refresh();
    showModal.value = false;
  } catch (e: any) {
    alert("Error: " + e.message);
  } finally {
    saving.value = false;
  }
};

const deleteProvider = async (p: any) => {
  if (!confirm(`Delete "${p.name}"?`)) return;
  await supabase.from("collection_providers").delete().eq("id", p.id);
  refresh();
};
</script>
