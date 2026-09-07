<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <!-- HEADER -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">ムービーコレクション一覧</h1>
          <p class="mt-1 text-xs text-zinc-400">
            映画：{{ movieTitle || '...' }} <span v-if="movieSlug">| Slug: {{ movieSlug }}</span>
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div class="flex gap-3 text-xs mr-2">
            <NuxtLink
              :to="`/admin/movies/${movieId}`"
              class="text-zinc-400 hover:text-zinc-200"
            >
              &larr; 映画編集へ戻る
            </NuxtLink>
            <span class="text-zinc-700">|</span>
            <NuxtLink
              to="/admin/providers"
              class="text-zinc-400 hover:text-zinc-200"
            >
              プロバイダー管理
            </NuxtLink>
          </div>

          <!-- NÚT MỞ AUTO CREATE ALL -->
          <button 
            @click="showQuickAutoModal = true"
            class="flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            自動一括作成 (Auto Create All)
          </button>
        </div>
      </div>

      <!-- FORM ADD MANUAL (CŨ) -->
      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <h2 class="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">手動で追加 (Add Manual)</h2>
        <form class="flex flex-col gap-3" @submit.prevent="handleCreate">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 space-y-1">
              <input
                v-model="newCollection.name"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="名前 (Display Name)"
                required
              />
            </div>
            <div class="flex-1 space-y-1">
              <select
                v-model.number="newCollection.provider_id"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option :value="0">Provider: 指定なし</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="w-full sm:w-28 space-y-1">
              <select
                v-model="newCollection.type"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="sub">字幕 (Sub)</option>
                <option value="dub">吹き替え (Dub)</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            
            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="newCollection.audio_language"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="音声 (Audio)"
              />
            </div>

            <div class="w-full sm:w-28 space-y-1">
              <input
                v-model="newCollection.subtitle_language"
                type="text"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="字幕 (Sub)"
              />
            </div>

            <div class="flex items-center gap-2 mb-2 px-2">
              <input
                id="chkDefault"
                v-model="newCollection.is_default"
                type="checkbox"
                class="rounded border-zinc-600 bg-zinc-900"
              />
              <label for="chkDefault" class="text-xs text-zinc-400 cursor-pointer">Default</label>
            </div>

            <div class="flex-1 flex justify-end">
              <button
                type="submit"
                :disabled="creating"
                class="rounded bg-zinc-800 border border-zinc-700 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 transition whitespace-nowrap"
              >
                {{ creating ? '...' : '追加' }}
              </button>
            </div>
          </div>
          
          <p v-if="createError" class="text-xs text-red-400 mt-1">
            {{ createError }}
          </p>
        </form>
      </div>

      <!-- DANH SÁCH COLLECTIONS -->
      <div v-if="loading" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>
      <div v-else-if="errorMessage" class="py-8 text-center text-sm text-red-400">
        {{ errorMessage }}
      </div>
      <div v-else>
        <div v-if="!collections.length" class="py-12 text-center text-zinc-500 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30">
          <p class="mb-2 text-lg">📭 コレクションがありません</p>
          <p class="text-sm">上のフォームまたは「自動一括作成」から追加してください。</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="c in collections"
            :key="c.id"
            class="group flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3">
                <h3 class="font-bold text-zinc-200 text-base truncate">
                  {{ c.name }}
                </h3>
                
                <div class="flex gap-1">
                  <span v-if="c.is_default" class="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-900/50">
                    DEF
                  </span>
                  <span v-if="c.type" class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400 border border-zinc-700/50">
                    {{ c.type }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3 text-xs text-zinc-500 mt-1 truncate">
                <span v-if="c.audio_language" class="flex items-center gap-1" title="Audio">
                  🔊 {{ c.audio_language }}
                </span>
                <span v-if="c.subtitle_language" class="flex items-center gap-1" title="Subtitle">
                  💬 {{ c.subtitle_language }}
                </span>
                <span v-if="(c.audio_language || c.subtitle_language) && getProviderLabel(c)" class="text-zinc-700">|</span>
                <span v-if="getProviderLabel(c)" class="flex items-center gap-1 text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                  </svg>
                  {{ getProviderLabel(c) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-4 shrink-0">
              <NuxtLink
                :to="`/admin/movies/${movieId}/collections/${c.id}/parts`"
                class="flex items-center gap-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-xs transition group/btn"
              >
                <span class="text-zinc-300 font-medium group-hover/btn:text-white">パート管理 (Parts)</span>
                <span class="bg-black text-emerald-500 font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center text-[10px]">
                  &rarr;
                </span>
              </NuxtLink>

              <button @click="openEditModal(c)" class="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition" title="編集">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
              <button @click="deleteCollection(c.id)" class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition" title="削除">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT COLLECTION THỦ CÔNG (CŨ) -->
    <BaseModal v-model="showEditModal" title="コレクション編集">
      <form class="space-y-4" @submit.prevent="handleUpdate">
        <div>
          <label class="mb-1 block text-xs text-zinc-500">名前</label>
          <input v-model="editForm.name" type="text" required class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"/>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs text-zinc-500">音声 (Audio)</label>
            <input v-model="editForm.audio_language" type="text" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"/>
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">字幕 (Subtitle)</label>
            <input v-model="editForm.subtitle_language" type="text" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs text-zinc-500">タイプ</label>
            <select
              v-model="editForm.type"
              class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="sub">字幕 (Sub)</option>
              <option value="dub">吹き替え (Dub)</option>
              <option value="raw">Raw</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">プロバイダー</label>
            <select v-model.number="editForm.provider_id" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option :value="0">指定なし</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
           <input id="editDefault" v-model="editForm.is_default" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-900"/>
          <label for="editDefault" class="text-sm text-zinc-300">デフォルトとして設定 (Default)</label>
        </div>
        <div class="flex justify-end pt-4 gap-2">
          <button type="button" @click="showEditModal = false" class="rounded border border-zinc-700 bg-transparent px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800">キャンセル</button>
          <button type="submit" class="rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">保存する</button>
        </div>
      </form>
    </BaseModal>

    <!-- [MỚI] NÂNG CẤP MODAL TẠO NHANH COLLECTION & PARTS CHO MOVIE -->
    <BaseModal v-model="showQuickAutoModal" title="コレクション＆パート自動一括作成" widthClass="max-w-6xl">
      <div class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        
        <!-- BƯỚC 1 -->
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <h4 class="text-xs font-bold text-emerald-400 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">1. コレクション情報 (Collection Info)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs text-zinc-500">名前 (Display Name) <span class="text-red-500">*</span></label>
              <input v-model="autoForm.name" type="text" placeholder="例: 日本語字幕" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs text-zinc-500">タイプ (Type)</label>
                <input v-model="autoForm.type" type="text" placeholder="sub/dub" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-zinc-500">プロバイダー (Provider)</label>
                <select v-model="autoForm.provider_id" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option :value="0">指定なし</option>
                  <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs text-zinc-500">音声 (Audio)</label>
                <input v-model="autoForm.audio_language" type="text" placeholder="ja" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-zinc-500">字幕 (Subtitle)</label>
                <input v-model="autoForm.subtitle_language" type="text" placeholder="vi" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4 pt-2 border-t border-zinc-800">
             <input id="autoIsDefault" v-model="autoForm.is_default" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-900" />
            <label for="autoIsDefault" class="text-sm text-zinc-300">デフォルトとして設定 (Set as default collection)</label>
          </div>
        </div>

        <!-- BƯỚC 2 -->
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div class="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. パート生成 (Generate Parts)</h4>
            <div class="flex gap-2">
              <button @click="applyQuickPattern" title="Sử dụng Pattern mẫu" class="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded text-[10px] text-emerald-400 font-bold transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                自動入力 (Quick Fill)
              </button>
              <button @click="showPatternSettings = !showPatternSettings" title="Cài đặt Pattern" class="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-1 rounded text-zinc-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>

          <div v-if="showPatternSettings" class="mb-4 bg-black/40 border border-zinc-700 rounded-lg p-3 space-y-3 animate-fade-in">
            <p class="text-[10px] text-zinc-400">※ Cài đặt này được lưu trữ tự động trên thiết bị (dùng chung cho cả Series & Movie). Hỗ trợ biến: <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{slug}</code> và <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{n}</code>.</p>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Video Pattern</label>
              <input v-model="savedVideoPattern" @change="savePatternsToLocal" type="text" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Subtitle Pattern</label>
              <input v-model="savedSubPattern" @change="savePatternsToLocal" type="text" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-yellow-400 focus:border-yellow-500 outline-none" />
            </div>
          </div>

          <div class="flex gap-4 mb-4">
            <button @click="activeGenTab = 'video'" class="text-xs font-bold px-3 py-1.5 rounded transition" :class="activeGenTab === 'video' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'">Video Links</button>
            <button @click="activeGenTab = 'sub'" class="text-xs font-bold px-3 py-1.5 rounded transition" :class="activeGenTab === 'sub' ? 'bg-yellow-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'">Subtitle Links</button>
          </div>

          <!-- ĐÃ ĐƯỢC TÍCH HỢP BẢN VÁ FIX 2 TABS BÊN DƯỚI -->
          <div class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-12 md:col-span-8">
              <label class="block text-[10px] text-zinc-500 mb-1 uppercase">
                {{ activeGenTab === 'video' ? 'Video Link Pattern' : 'Subtitle Link Pattern' }}
              </label>
              <input 
                v-if="activeGenTab === 'video'" 
                v-model="genConfig.videoPattern" 
                type="text" 
                class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono outline-none transition-colors text-emerald-400 focus:border-emerald-500" 
              />
              <input 
                v-else 
                v-model="genConfig.subPattern" 
                type="text" 
                class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono outline-none transition-colors text-yellow-400 focus:border-yellow-500" 
              />
            </div>
            
            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">Start Part</label>
              <input v-model.number="genConfig.start" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">End Part</label>
              <input v-model.number="genConfig.end" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>
            
            <div class="col-span-12 border-t border-zinc-800 my-2"></div>
            
            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Prefix</label>
                  <button type="button" @click="genConfig.titlePrefix = 'Part '" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700">Part</button>
               </div>
               <input v-model="genConfig.titlePrefix" type="text" placeholder="e.g. Part " class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Suffix</label>
                  <button type="button" @click="genConfig.titleSuffix = ''" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700">Clear</button>
               </div>
               <input v-model="genConfig.titleSuffix" type="text" placeholder="e.g. 後編" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-12 md:col-span-4">
              <button @click="runGenerator" type="button" class="w-full py-1.5 rounded text-xs font-bold text-white transition border shadow-lg flex items-center justify-center gap-1 h-[34px] bg-emerald-700 border-emerald-600 hover:bg-emerald-600">
                <span>Generate Links</span>
              </button>
            </div>
          </div>
        </div>

        <!-- BƯỚC 3: PREVIEW BẢNG ĐỂ CHỈNH SỬA TẬP PHIM -->
        <div class="border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
          <div class="flex justify-between items-center p-3 bg-zinc-950 border-b border-zinc-800">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. プレビュー＆編集 (Preview & Edit)</h4>
            <button @click="addManualRow" type="button" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded border border-zinc-700 transition flex items-center gap-1">
              <span>+</span> 手動で行を追加 (Add Row)
            </button>
          </div>
          
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
             <table class="w-full text-left text-xs text-zinc-400 min-w-[800px]">
               <thead class="bg-zinc-950/80 text-zinc-300 sticky top-0 z-10 shadow-sm backdrop-blur">
                 <tr>
                   <th class="px-2 py-2 w-16 text-center border-b border-zinc-800">Part</th>
                   <th class="px-2 py-2 w-1/4 border-b border-zinc-800">Title</th>
                   <th class="px-2 py-2 border-b border-zinc-800">Video URL</th>
                   <th class="px-2 py-2 border-b border-zinc-800">Sub URL</th>
                   <th class="px-2 py-2 w-28 text-center border-b border-zinc-800">操作</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-zinc-800">
                 <tr v-if="previewList.length === 0">
                   <td colspan="5" class="px-4 py-12 text-center text-zinc-600 italic">
                     Generatorでリンクを生成するか、行を手動で追加してください。<br/>(Bấm Generate Links để tự sinh hoặc Add Row để thêm thủ công)
                   </td>
                 </tr>
                 <tr v-for="(item, idx) in previewList" :key="item.id" class="hover:bg-zinc-800/30 transition-colors">
                   <td class="px-2 py-2">
                      <input v-model.number="item.partNum" type="number" step="0.1" class="bg-zinc-950 border border-zinc-700 w-full text-center font-bold text-zinc-300 focus:text-white focus:border-emerald-500 rounded px-1 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.title" class="bg-zinc-950 border border-zinc-700 w-full text-zinc-300 focus:text-white focus:border-emerald-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.video" placeholder="https://..." class="bg-zinc-950 border border-zinc-700 w-full font-mono text-[10px] text-emerald-500 focus:border-emerald-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2">
                      <input v-model="item.sub" placeholder="https://..." class="bg-zinc-950 border border-zinc-700 w-full font-mono text-[10px] text-yellow-500 focus:border-yellow-500 rounded px-2 py-1.5 outline-none transition-colors" />
                   </td>
                   <td class="px-2 py-2 text-center">
                     <div class="flex items-center justify-center gap-1">
                        <button type="button" @click="moveUp(idx)" :disabled="idx === 0" class="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition">▲</button>
                        <button type="button" @click="moveDown(idx)" :disabled="idx === previewList.length - 1" class="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30 transition">▼</button>
                        <button type="button" @click="insertAfter(idx)" class="p-1 rounded text-emerald-500 hover:text-white hover:bg-emerald-700 transition" title="下に挿入 (Insert)">＋</button>
                        <button type="button" @click="removeRow(idx)" class="p-1 rounded text-red-500 hover:text-white hover:bg-red-700 transition" title="削除 (Delete)">✕</button>
                     </div>
                   </td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
           <div class="text-xs text-zinc-500">
             <button type="button" @click="clearForm" class="text-red-400 hover:text-red-300 transition flex items-center gap-1 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                全てクリア (Clear All)
             </button>
           </div>
          <div class="flex gap-3">
            <button type="button" @click="showQuickAutoModal = false" class="px-5 py-2.5 rounded text-xs font-bold text-zinc-400 hover:text-white transition">キャンセル</button>
            <button 
              @click="handleAutoSave" 
              :disabled="previewList.length === 0 || isAutoSaving"
              class="px-8 py-2.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-lg shadow-emerald-900/20"
            >
              <span v-if="isAutoSaving" class="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></span>
              保存する (Create Collection & {{ previewList.length }} Parts)
            </button>
          </div>
        </div>

      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useSupabaseClient } from '#imports'

// Types
type MovieRow = { id: number; title: string; slug: string }
type CollectionRow = {
  id: number
  name: string
  type: string | null
  audio_language: string | null
  subtitle_language: string | null
  provider_id: number | null
  is_default: boolean | null
}
type ProviderRow = {
  id: number
  name: string
  website_url: string | null
  is_active: boolean | null
}

const route = useRoute()
const supabase = useSupabaseClient<any>()

const movieId = computed(() => Number(route.params.id))

const movieTitle = ref('')
const movieSlug = ref('')
const collections = ref<CollectionRow[]>([])
const providers = ref<ProviderRow[]>([])
const loading = ref(true)
const errorMessage = ref('')

const creating = ref(false)
const createError = ref('')

const newCollection = reactive({
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  is_default: false,
  provider_id: 0 as number,
})

// Edit State
const showEditModal = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  type: '',
  audio_language: '',
  subtitle_language: '',
  provider_id: 0 as number | null,
  is_default: false
})

// =========================================================
//  [MỚI] AUTO CREATE ALL + PREVIEW TABLE LOGIC
// =========================================================
const showQuickAutoModal = ref(false)
const isAutoSaving = ref(false)

const autoForm = reactive({ 
  name: '', 
  type: 'sub', 
  audio_language: '', 
  subtitle_language: '', 
  provider_id: 0 as number, 
  is_default: false 
})
const activeGenTab = ref<'video' | 'sub'>('video')
// Lưu ý: Đối với Movie, start và end mặc định là 1 (vì đa số phim chỉ có 1 phần)
const genConfig = reactive({ 
  videoPattern: '', 
  subPattern: '', 
  start: 1, 
  end: 1, 
  titlePrefix: '', 
  titleSuffix: '' 
})

type PreviewItem = { id: number; partNum: number; title: string; video: string; sub: string }
const previewList = ref<PreviewItem[]>([])

const showPatternSettings = ref(false)
const savedVideoPattern = ref('')
const savedSubPattern = ref('')

onMounted(() => {
  if (import.meta.client) {
    // Dùng chung key với bên Series để bạn không phải nhập lại Pattern nhiều lần
    savedVideoPattern.value = localStorage.getItem('defaultVideoPattern') || ''
    savedSubPattern.value = localStorage.getItem('defaultSubPattern') || ''

    const savedAutoForm = localStorage.getItem('movieAutoFormState')
    if (savedAutoForm) {
      try { Object.assign(autoForm, JSON.parse(savedAutoForm)) } catch (e) {}
    }
  }
})

const savePatternsToLocal = () => {
  if (import.meta.client) {
    localStorage.setItem('defaultVideoPattern', savedVideoPattern.value)
    localStorage.setItem('defaultSubPattern', savedSubPattern.value)
  }
}

watch(autoForm, (newVal) => {
  if (import.meta.client) localStorage.setItem('movieAutoFormState', JSON.stringify(newVal))
}, { deep: true })


const applyQuickPattern = () => {
  let hasPattern = false

  if (savedVideoPattern.value) {
    genConfig.videoPattern = savedVideoPattern.value.replace(/{slug}/g, movieSlug.value)
    hasPattern = true
  }
  if (savedSubPattern.value) {
    genConfig.subPattern = savedSubPattern.value.replace(/{slug}/g, movieSlug.value)
    hasPattern = true
  }

  if (!hasPattern) {
    alert('Vui lòng cài đặt Default Pattern trong mục Bánh răng trước nhé!')
  }
}

const clearForm = () => {
  if (!confirm('Tất cả nội dung sẽ bị xóa, bạn có chắc không?')) return
  autoForm.name = ''; autoForm.type = 'sub'; autoForm.audio_language = ''; autoForm.subtitle_language = ''; autoForm.provider_id = 0; autoForm.is_default = false
  genConfig.videoPattern = ''; genConfig.subPattern = ''; genConfig.start = 1; genConfig.end = 1; genConfig.titlePrefix = ''; genConfig.titleSuffix = ''
  previewList.value = []
}

// BẢN VÁ: Hàm Generate Link xử lý đồng thời cả Video lẫn Sub
const runGenerator = () => {
  if (!genConfig.videoPattern && !genConfig.subPattern) {
    alert('Vui lòng nhập ít nhất một Link Pattern (Video hoặc Sub) trước khi tạo.')
    return
  }
  
  for (let i = genConfig.start; i <= genConfig.end; i++) {
    const videoUrl = genConfig.videoPattern ? genConfig.videoPattern.replace(/{n}/g, String(i)) : ''
    const subUrl = genConfig.subPattern ? genConfig.subPattern.replace(/{n}/g, String(i)) : ''
    const title = `${genConfig.titlePrefix}${i}${genConfig.titleSuffix}`
    
    const existing = previewList.value.find(item => item.partNum === i)
    if (existing) {
       if (videoUrl) existing.video = videoUrl
       if (subUrl) existing.sub = subUrl
       if (!existing.title) existing.title = title
    } else {
       previewList.value.push({
         id: Date.now() + Math.random(),
         partNum: i,
         title: genConfig.start === 1 && genConfig.end === 1 && !genConfig.titlePrefix && !genConfig.titleSuffix ? 'フル' : title,
         video: videoUrl,
         sub: subUrl
       })
    }
  }
  previewList.value.sort((a, b) => a.partNum - b.partNum)
}

// Bảng Preview Actions
const moveUp = (idx: number) => {
    if (idx > 0) {
        const temp = previewList.value[idx]!
        previewList.value[idx] = previewList.value[idx - 1]!
        previewList.value[idx - 1] = temp
    }
}
const moveDown = (idx: number) => {
    if (idx < previewList.value.length - 1) {
        const temp = previewList.value[idx]!
        previewList.value[idx] = previewList.value[idx + 1]!
        previewList.value[idx + 1] = temp
    }
}
const insertAfter = (idx: number) => {
    const currentPart = previewList.value[idx]!.partNum
    previewList.value.splice(idx + 1, 0, {
        id: Date.now() + Math.random(),
        partNum: currentPart + 0.1, 
        title: '',
        video: '',
        sub: ''
    })
}
const removeRow = (idx: number) => {
    previewList.value.splice(idx, 1)
}
const addManualRow = () => {
    let nextPart = 1
    if (previewList.value.length > 0) {
        const lastItem = previewList.value[previewList.value.length - 1]!
        nextPart = Math.floor(lastItem.partNum) + 1
    }
    previewList.value.push({
        id: Date.now() + Math.random(),
        partNum: nextPart,
        title: `${genConfig.titlePrefix}${nextPart}${genConfig.titleSuffix}`,
        video: '',
        sub: ''
    })
}

// =========================================================
//  LƯU AUTO CREATE VÀO DATABASE
// =========================================================
const handleAutoSave = async () => {
  if (!autoForm.name) {
    alert('コレクション名を入力してください (Vui lòng điền tên Collection)')
    return
  }
  isAutoSaving.value = true
  
  try {
    if (autoForm.is_default) {
      await supabase.from('movie_collections').update({ is_default: false }).eq('movie_id', movieId.value)
    }

    const { data: newCol, error: colError } = await supabase.from('movie_collections').insert({
      movie_id: movieId.value, 
      name: autoForm.name, 
      type: autoForm.type || null, 
      audio_language: autoForm.audio_language || null,
      subtitle_language: autoForm.subtitle_language || null, 
      provider_id: autoForm.provider_id || null,
      is_default: autoForm.is_default
    }).select('id').single()

    if (colError) throw colError
    const newCollectionId = newCol.id

    const partPayload = previewList.value.map((item) => {
      const subtitles = []
      if (item.sub) {
        subtitles.push({ src: item.sub, label: 'Japanese', lang: 'ja' })
      }
      return {
        movie_id: movieId.value,
        collection_id: newCollectionId,
        part_number: item.partNum, 
        title: item.title, 
        video_path: item.video,
        subtitles: subtitles, 
        duration_minutes: 0
      }
    })

    const { error: partError } = await supabase.from('movie_parts').insert(partPayload)
    if (partError) throw partError

    showQuickAutoModal.value = false
    previewList.value = []
    
    alert(`Thành công! Đã tạo Collection và ${partPayload.length} phần phim (parts).`)
    await loadData()
  } catch (err: any) {
    alert('エラー: ' + err.message)
  } finally {
    isAutoSaving.value = false
  }
}

// =========================================================
//  LOAD DATA (CŨ)
// =========================================================
const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // [UPDATE] Lấy thêm trường slug để AutoFill link hoạt động
    const { data: mData, error: mError } = await supabase
      .from('movies')
      .select('id, title, slug')
      .eq('id', movieId.value)
      .single()

    if (mError) throw mError
    movieTitle.value = (mData as MovieRow).title
    movieSlug.value = (mData as MovieRow).slug

    // 2. Collections
    const { data: cData, error: cError } = await supabase
      .from('movie_collections')
      .select('id, name, type, audio_language, subtitle_language, provider_id, is_default')
      .eq('movie_id', movieId.value)
      .order('is_default', { ascending: false }) // Default lên đầu
      .order('created_at', { ascending: true })

    if (cError) throw cError
    collections.value = (cData ?? []) as CollectionRow[]

    // 3. Providers
    const { data: pData, error: pError } = await supabase
      .from('collection_providers')
      .select('id, name, website_url, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (!pError && pData) {
      providers.value = pData as ProviderRow[]
    }
  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

// Create Action (Thủ công)
const handleCreate = async () => {
  creating.value = true
  createError.value = ''

  try {
    if (newCollection.is_default) {
      await supabase
        .from('movie_collections')
        .update({ is_default: false })
        .eq('movie_id', movieId.value)
    }

    const payload = {
      movie_id: movieId.value,
      name: newCollection.name,
      type: newCollection.type || null,
      audio_language: newCollection.audio_language || null,
      subtitle_language: newCollection.subtitle_language || null,
      provider_id: newCollection.provider_id || null,
      is_default: newCollection.is_default,
    }

    const { error } = await supabase.from('movie_collections').insert(payload)
    if (error) throw error

    newCollection.name = ''
    newCollection.type = ''
    newCollection.audio_language = ''
    newCollection.subtitle_language = ''
    newCollection.is_default = false
    newCollection.provider_id = 0

    await loadData()
  } catch (err: any) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

// Edit Action
const openEditModal = (c: CollectionRow) => {
  editForm.id = c.id
  editForm.name = c.name
  editForm.type = c.type || ''
  editForm.audio_language = c.audio_language || ''
  editForm.subtitle_language = c.subtitle_language || ''
  editForm.provider_id = c.provider_id || 0
  editForm.is_default = c.is_default || false
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    if (editForm.is_default) {
      await supabase
        .from('movie_collections')
        .update({ is_default: false })
        .eq('movie_id', movieId.value)
    }

    const payload = {
      name: editForm.name,
      type: editForm.type || null,
      audio_language: editForm.audio_language || null,
      subtitle_language: editForm.subtitle_language || null,
      provider_id: editForm.provider_id || null,
      is_default: editForm.is_default
    }

    const { error } = await supabase
      .from('movie_collections')
      .update(payload)
      .eq('id', editForm.id)

    if (error) throw error

    showEditModal.value = false
    await loadData()
  } catch (err: any) {
    alert('エラーが発生しました: ' + err.message)
  }
}

// Delete Action
const deleteCollection = async (id: number) => {
  if (!confirm('このコレクションを削除しますか？\n(含まれる動画パートも全て削除されます)')) return

  try {
    const { error } = await supabase
      .from('movie_collections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    await loadData()
  } catch (err: any) {
    alert('エラーが発生しました: ' + err.message)
  }
}

// Helper
const getProviderLabel = (c: CollectionRow) => {
  if (!c.provider_id) return ''
  const p = providers.value.find((pp) => pp.id === c.provider_id)
  return p ? p.name : ''
}

// Init
loadData()
</script>