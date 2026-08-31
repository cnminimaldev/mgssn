<template>
  <div class="min-h-screen bg-black text-zinc-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">コレクション一覧</h1>
          <p class="mt-1 text-xs text-zinc-400">
            シリーズID：{{ seriesId }} <span v-if="seriesSlug">| Slug: {{ seriesSlug }}</span>
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div class="flex gap-3 text-xs mr-2">
            <NuxtLink
              :to="`/admin/series/${seriesId}`"
              class="text-zinc-400 hover:text-zinc-200"
            >
              &larr; シリーズ編集へ戻る
            </NuxtLink>
            <span class="text-zinc-700">|</span>
            <NuxtLink
              to="/admin/providers"
              class="text-zinc-400 hover:text-zinc-200"
            >
              プロバイダー管理
            </NuxtLink>
          </div>

          <!-- NÚT TẠO NHANH TẤT CẢ TRONG MỘT -->
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

      <!-- Khu vực thêm collection thủ công cũ -->
      <div class="mb-8 rounded-lg border border-white/5 bg-zinc-950/70 p-4">
        <h2 class="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">手動で追加 (Add Manual)</h2>
        <form class="flex flex-col gap-3" @submit.prevent="addCollection">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 space-y-1">
              <input
                v-model="createForm.name"
                type="text"
                required
                placeholder="名前 (Display Name)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div class="flex-1 space-y-1">
              <input
                v-model="createForm.name_ja"
                type="text"
                placeholder="名前 (Japanese - Optional)"
                class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="w-full sm:w-28 space-y-1">
              <select v-model="createForm.type" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                <option value="sub">字幕 (Sub)</option>
                <option value="dub">吹き替え</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            <div class="w-full sm:w-28 space-y-1">
              <input v-model="createForm.audio_language" type="text" placeholder="音声 (Audio)" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div class="w-full sm:w-28 space-y-1">
              <input v-model="createForm.subtitle_language" type="text" placeholder="字幕 (Sub)" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div class="flex-1 w-full space-y-1">
              <select v-model="createForm.provider_id" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                <option :value="null">Prov: 指定なし</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <button type="submit" class="w-full sm:w-auto rounded bg-zinc-800 border border-zinc-700 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700 transition whitespace-nowrap">
              追加
            </button>
          </div>
        </form>
      </div>

      <div v-if="pending" class="py-10 text-center text-sm text-zinc-500">
        読み込み中...
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="col in collections"
          :key="col.id"
          class="group flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-zinc-200 text-base truncate">
                {{ col.name }}
              </h3>
              
              <div class="flex gap-1">
                <span v-if="col.is_default" class="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-900/50">
                  DEF
                </span>
                <span v-if="col.type" class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400 border border-zinc-700/50">
                  {{ col.type }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs text-zinc-500 mt-1 truncate">
              <span v-if="col.name_ja">{{ col.name_ja }}</span>
              
              <span v-if="(col.audio_language || col.subtitle_language) && col.name_ja" class="text-zinc-700">|</span>
              <span v-if="col.audio_language" class="flex items-center gap-1" title="Audio">
                🔊 {{ col.audio_language }}
              </span>
              <span v-if="col.subtitle_language" class="flex items-center gap-1" title="Subtitle">
                💬 {{ col.subtitle_language }}
              </span>

              <span v-if="col.collection_providers" class="text-zinc-700">|</span>
              <span v-if="col.collection_providers" class="flex items-center gap-1 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                </svg>
                {{ col.collection_providers.name }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 shrink-0">
            <NuxtLink
              :to="`/admin/series/${seriesId}/collections/${col.id}/episodes`"
              class="flex items-center gap-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-xs transition group/btn"
              title="エピソード管理"
            >
              <span class="text-zinc-300 font-medium group-hover/btn:text-white">Episodes</span>
              <span class="bg-black text-emerald-500 font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {{ col.episodes ? col.episodes[0]?.count : 0 }}
              </span>
            </NuxtLink>

            <div class="flex gap-1">
              <button @click="openEditModal(col)" class="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition" title="編集">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button @click="deleteCollection(col.id)" class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition" title="削除">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT COLLECTION THỦ CÔNG CŨ -->
    <BaseModal v-model="showEditModal" title="コレクション編集">
      <form class="space-y-4" @submit.prevent="handleUpdate">
        <div>
          <label class="mb-1 block text-xs text-zinc-500">名前</label>
          <input v-model="editForm.name" type="text" required class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"/>
        </div>
        <div>
          <label class="mb-1 block text-xs text-zinc-500">名前 (JA)</label>
          <input v-model="editForm.name_ja" type="text" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"/>
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
            <select v-model="editForm.type" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option value="sub">字幕 (Sub)</option>
              <option value="dub">吹き替え (Dub)</option>
              <option value="raw">Raw</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs text-zinc-500">プロバイダー</label>
            <select v-model="editForm.provider_id" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option :value="null">指定なし</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
           <input id="isDefault" v-model="editForm.is_default" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-900"/>
          <label for="isDefault" class="text-sm text-zinc-300">デフォルトとして設定 (Default)</label>
        </div>
        <div class="flex justify-end pt-4">
          <button type="submit" class="rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">
            保存する
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL TẠO NHANH COLLECTION & TẬP PHIM -->
    <BaseModal v-model="showQuickAutoModal" title="コレクション＆エピソード自動一括作成" widthClass="max-w-5xl">
      <div class="space-y-6">
        
        <!-- BƯỚC 1: THÔNG TIN COLLECTION -->
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <h4 class="text-xs font-bold text-emerald-400 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">1. コレクション情報 (Collection Info)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs text-zinc-500">名前 (Display Name) <span class="text-red-500">*</span></label>
              <input v-model="autoForm.name" type="text" placeholder="例: 日本語字幕" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-zinc-500">名前 (Japanese)</label>
              <input v-model="autoForm.name_ja" type="text" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs text-zinc-500">タイプ (Type)</label>
                <select v-model="autoForm.type" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option value="sub">字幕 (Sub)</option>
                  <option value="dub">吹き替え (Dub)</option>
                  <option value="raw">Raw</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs text-zinc-500">プロバイダー (Provider)</label>
                <select v-model="autoForm.provider_id" class="w-full rounded bg-black border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option :value="null">指定なし</option>
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

        <!-- BƯỚC 2: CÔNG CỤ TẠO LINK TẬP PHIM -->
        <div class="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div class="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. エピソード生成 (Generate Episodes)</h4>
            
            <!-- [MỚI] NÚT TỰ ĐỘNG ĐIỀN (QUICK FILL) & CÀI ĐẶT PATTERN -->
            <div class="flex gap-2">
              <button 
                @click="applyQuickPattern" 
                title="Sử dụng Pattern mẫu"
                class="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded text-[10px] text-emerald-400 font-bold transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                自動入力 (Quick Fill)
              </button>
              <button 
                @click="showPatternSettings = !showPatternSettings" 
                title="Cài đặt Pattern"
                class="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-1 rounded text-zinc-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- BẢNG CÀI ĐẶT PATTERN (Chỉ hiện khi bấm bánh răng) -->
          <div v-if="showPatternSettings" class="mb-4 bg-black/40 border border-zinc-700 rounded-lg p-3 space-y-3 animate-fade-in">
            <p class="text-[10px] text-zinc-400">
              ※ Cài đặt này được lưu trữ tự động trên thiết bị của bạn. Hỗ trợ biến: 
              <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{slug}</code> (Thay bằng Slug Series) và 
              <code class="text-emerald-400 bg-zinc-900 px-1 rounded">{n}</code> (Thay bằng số tập).
            </p>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Video Pattern</label>
              <input v-model="savedVideoPattern" @change="savePatternsToLocal" type="text" placeholder="Ví dụ: /series/jp/1/{slug}/{n}/master.m3u8" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-[10px] text-zinc-500 mb-1">Default Subtitle Pattern</label>
              <input v-model="savedSubPattern" @change="savePatternsToLocal" type="text" placeholder="Ví dụ: /series/jp/1/{slug}/{n}/sub.vtt" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-yellow-400 focus:border-yellow-500 outline-none" />
            </div>
          </div>

          <div class="flex gap-4 mb-4">
            <button @click="activeGenTab = 'video'" class="text-xs font-bold px-3 py-1.5 rounded transition" :class="activeGenTab === 'video' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'">Video Links</button>
            <button @click="activeGenTab = 'sub'" class="text-xs font-bold px-3 py-1.5 rounded transition" :class="activeGenTab === 'sub' ? 'bg-yellow-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'">Subtitle Links</button>
          </div>

          <div class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-12 md:col-span-8">
              <label class="block text-[10px] text-zinc-500 mb-1 uppercase">Link Pattern</label>
              <input v-model="genConfig.pattern" type="text" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono outline-none transition-colors" :class="activeGenTab === 'video' ? 'text-emerald-400 focus:border-emerald-500' : 'text-yellow-400 focus:border-yellow-500'" :placeholder="activeGenTab === 'video' ? 'https://host.com/ep{n}.m3u8' : 'https://host.com/ep{n}.vtt'" />
              <p class="text-[9px] text-zinc-600 mt-1">Sử dụng <code>{n}</code> cho số tập. Ví dụ: <code>.../ep{n}.m3u8</code></p>
            </div>
            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">Start Ep</label>
              <input v-model.number="genConfig.start" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6 md:col-span-2">
              <label class="block text-[10px] text-zinc-500 mb-1">End Ep</label>
              <input v-model.number="genConfig.end" type="number" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white text-center focus:border-emerald-500 outline-none" />
            </div>
            
            <div class="col-span-12 md:col-span-12 border-t border-zinc-800 my-2"></div>
            
            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Prefix</label>
                  <button @click="genConfig.titlePrefix = '第'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700">第</button>
               </div>
               <input v-model="genConfig.titlePrefix" type="text" placeholder="e.g. 第" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6 md:col-span-4">
               <div class="flex justify-between items-center mb-1">
                  <label class="block text-[10px] text-zinc-500 uppercase">Title Suffix</label>
                  <button @click="genConfig.titleSuffix = '話'" class="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700">話</button>
               </div>
               <input v-model="genConfig.titleSuffix" type="text" placeholder="e.g. 話" class="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-12 md:col-span-4">
              <button 
                @click="runGenerator"
                class="w-full py-1.5 rounded text-xs font-bold text-white transition border shadow-lg flex items-center justify-center gap-1 h-[34px]"
                :class="activeGenTab === 'video' ? 'bg-emerald-700 border-emerald-600 hover:bg-emerald-600' : 'bg-yellow-700 border-yellow-600 hover:bg-yellow-600'"
              >
                <span>Generate Links</span>
              </button>
            </div>
          </div>
        </div>

        <!-- BƯỚC 3: TEXTAREA HIỂN THỊ LINK -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-zinc-400 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Video Links</label>
              <button @click="videoInput = ''" class="text-[10px] text-zinc-500 hover:text-red-400 hover:underline">Clear</button>
            </div>
            <div class="relative">
              <textarea v-model="videoInput" rows="8" class="w-full bg-black border border-zinc-700 rounded-lg p-3 text-[11px] font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none whitespace-pre leading-relaxed"></textarea>
              <div class="absolute bottom-2 right-3 text-[10px] text-zinc-600 bg-black/80 px-1 rounded">{{ videoLineCount }} lines</div>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-zinc-400 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-yellow-500"></span>Subtitle Links (Optional)</label>
              <button @click="subInput = ''" class="text-[10px] text-zinc-500 hover:text-red-400 hover:underline">Clear</button>
            </div>
             <div class="relative">
              <textarea v-model="subInput" rows="8" class="w-full bg-black border border-zinc-700 rounded-lg p-3 text-[11px] font-mono text-yellow-400 focus:border-yellow-500 outline-none resize-none whitespace-pre leading-relaxed"></textarea>
               <div class="absolute bottom-2 right-3 text-[10px] text-zinc-600 bg-black/80 px-1 rounded">
                <span :class="{'text-red-500 font-bold': subLineCount > 0 && subLineCount !== videoLineCount}">{{ subLineCount }}</span> lines
              </div>
            </div>
          </div>
        </div>

        <!-- LƯU LẠI -->
        <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
           <div class="text-xs text-zinc-500">
             <span v-if="errorMsg" class="text-red-400 font-bold">{{ errorMsg }}</span>
             <span v-else>※ Kiểm tra kỹ số lượng link trước khi tạo</span>
           </div>
          <div class="flex gap-3">
            <button @click="showQuickAutoModal = false" class="px-5 py-2.5 rounded text-xs font-bold text-zinc-400 hover:text-white transition">キャンセル</button>
            <button 
              @click="handleAutoSave" 
              :disabled="!!errorMsg || videoLineCount === 0 || isAutoSaving"
              class="px-8 py-2.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-lg shadow-emerald-900/20"
            >
              <span v-if="isAutoSaving" class="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></span>
              保存する (Create Collection & {{ videoLineCount }} Eps)
            </button>
          </div>
        </div>

      </div>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta } from '#imports'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const seriesId = route.params.id
const supabase = useSupabaseClient<any>()

// =========================================================
//  FETCH DỮ LIỆU CƠ BẢN
// =========================================================

// 1. Fetch Slug của Series hiện tại để phục vụ Quick Fill
const { data: seriesData } = await useAsyncData(`series-slug-${seriesId}`, async () => {
  const { data } = await supabase.from('series').select('slug').eq('id', seriesId).single()
  return data
})
const seriesSlug = computed(() => seriesData.value?.slug || '')

// 2. Fetch Providers
const { data: providers } = await useAsyncData('providers-list', async () => {
  const { data } = await supabase.from('collection_providers').select('id, name').eq('is_active', true)
  return data || []
})

// 3. Fetch Collections
const { data: collections, pending, refresh } = await useAsyncData(
  `collections-${seriesId}`,
  async () => {
    const { data, error } = await supabase
      .from('episode_collections')
      .select(`*, collection_providers (name), episodes (count)`)
      .eq('series_id', seriesId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  }
)

// =========================================================
//  ADD COLLECTION THỦ CÔNG CŨ
// =========================================================
const createForm = reactive({
  name: '', name_ja: '', type: 'sub', audio_language: '', subtitle_language: '', provider_id: null as number | null
})

const addCollection = async () => {
  try {
    const { error } = await supabase.from('episode_collections').insert({
      series_id: seriesId, name: createForm.name, name_ja: createForm.name_ja || null,
      type: createForm.type, audio_language: createForm.audio_language || null, 
      subtitle_language: createForm.subtitle_language || null, provider_id: createForm.provider_id
    })
    if (error) throw error
    
    createForm.name = ''; createForm.name_ja = ''; createForm.audio_language = ''; createForm.subtitle_language = ''
    refresh()
  } catch (e: any) { alert(e.message) }
}

// =========================================================
//  EDIT & DELETE COLLECTION THỦ CÔNG CŨ
// =========================================================
const showEditModal = ref(false)
const editForm = reactive({ id: 0, name: '', name_ja: '', type: '', audio_language: '', subtitle_language: '', provider_id: null as number | null, is_default: false })

const openEditModal = (col: any) => {
  editForm.id = col.id; editForm.name = col.name; editForm.name_ja = col.name_ja || '';
  editForm.type = col.type || 'sub'; editForm.audio_language = col.audio_language || '';
  editForm.subtitle_language = col.subtitle_language || ''; editForm.is_default = col.is_default;
  editForm.provider_id = col.provider_id
  showEditModal.value = true
}

const handleUpdate = async () => {
  try {
    if (editForm.is_default) {
      await supabase.from('episode_collections').update({ is_default: false }).eq('series_id', seriesId)
    }
    const updatePayload = {
      name: editForm.name, name_ja: editForm.name_ja || null, type: editForm.type || null,
      audio_language: editForm.audio_language || null, subtitle_language: editForm.subtitle_language || null,
      provider_id: editForm.provider_id || null, is_default: editForm.is_default
    } as any

    const { error } = await supabase.from('episode_collections').update(updatePayload).eq('id', editForm.id)
    if (error) throw error
    showEditModal.value = false
    refresh()
  } catch (err: any) { alert('エラーが発生しました: ' + err.message) }
}

const deleteCollection = async (id: number) => {
  if (!confirm('このコレクションを削除しますか？\n(含まれるエピソードも全て削除されます)')) return
  try {
    const { error } = await supabase.from('episode_collections').delete().eq('id', id)
    if (error) throw error
    refresh()
  } catch (e: any) { alert(e.message) }
}

// =========================================================
//  [MỚI] AUTO CREATE ALL (COLLECTION + EPISODES)
// =========================================================
const showQuickAutoModal = ref(false)
const isAutoSaving = ref(false)

const autoForm = reactive({
  name: '', name_ja: '', type: 'sub', audio_language: '', subtitle_language: '', provider_id: null as number | null, is_default: false
})

const activeGenTab = ref<'video' | 'sub'>('video')
const videoInput = ref('')
const subInput = ref('')
const genConfig = reactive({ pattern: '', start: 1, end: 12, titlePrefix: '', titleSuffix: '' })

// Computed Validation
const videoLineCount = computed(() => videoInput.value.split('\n').filter(l => l.trim()).length)
const subLineCount = computed(() => subInput.value.split('\n').filter(l => l.trim()).length)
const errorMsg = computed(() => {
  if (subLineCount.value > 0 && subLineCount.value !== videoLineCount.value) {
    return `字幕数 (${subLineCount.value}) と 動画数 (${videoLineCount.value}) が一致しません！`
  }
  return ''
})

// =========================================================
//  [MỚI] QUẢN LÝ CÀI ĐẶT PATTERN BẰNG LOCAL STORAGE
// =========================================================
const showPatternSettings = ref(false)
const savedVideoPattern = ref('')
const savedSubPattern = ref('')

onMounted(() => {
  if (import.meta.client) { // Đảm bảo chỉ chạy trên client-side
    savedVideoPattern.value = localStorage.getItem('defaultVideoPattern') || ''
    savedSubPattern.value = localStorage.getItem('defaultSubPattern') || ''
  }
})

const savePatternsToLocal = () => {
  if (import.meta.client) {
    localStorage.setItem('defaultVideoPattern', savedVideoPattern.value)
    localStorage.setItem('defaultSubPattern', savedSubPattern.value)
  }
}

const applyQuickPattern = () => {
  const template = activeGenTab.value === 'video' ? savedVideoPattern.value : savedSubPattern.value
  
  if (!template) {
    alert('Vui lòng cài đặt Default Pattern trong mục Bánh răng trước nhé!')
    return
  }
  
  // Tự động thay biến {slug} bằng slug của Series hiện tại
  genConfig.pattern = template.replace(/{slug}/g, seriesSlug.value)
}

// =========================================================
//  THỰC THI TẠO LINK VÀ LƯU DATABASE
// =========================================================
const runGenerator = () => {
  if (!genConfig.pattern) return
  const links: string[] = []
  for (let i = genConfig.start; i <= genConfig.end; i++) {
    links.push(genConfig.pattern.replace('{n}', String(i)))
  }
  const textToAppend = links.join('\n')
  
  if (activeGenTab.value === 'video') {
    videoInput.value = videoInput.value ? videoInput.value + '\n' + textToAppend : textToAppend
  } else {
    subInput.value = subInput.value ? subInput.value + '\n' + textToAppend : textToAppend
  }
}

const handleAutoSave = async () => {
  if (!autoForm.name) {
    alert('コレクション名を入力してください (Vui lòng điền tên Collection)')
    return
  }

  isAutoSaving.value = true
  
  try {
    if (autoForm.is_default) {
      await supabase.from('episode_collections').update({ is_default: false }).eq('series_id', seriesId)
    }

    const { data: newCol, error: colError } = await supabase.from('episode_collections').insert({
      series_id: seriesId, name: autoForm.name, name_ja: autoForm.name_ja || null,
      type: autoForm.type, audio_language: autoForm.audio_language || null,
      subtitle_language: autoForm.subtitle_language || null, provider_id: autoForm.provider_id,
      is_default: autoForm.is_default
    }).select('id').single()

    if (colError) throw colError
    const newCollectionId = newCol.id

    const vLines = videoInput.value.split('\n').filter(l => l.trim())
    const sLines = subInput.value.split('\n').filter(l => l.trim())

    const epPayload = vLines.map((vUrl, idx) => {
      const currentNum = genConfig.start + idx
      const title = `${genConfig.titlePrefix}${currentNum}${genConfig.titleSuffix}`
      const subtitles = []
      if (sLines[idx]) {
        subtitles.push({ src: sLines[idx], label: 'Japanese', lang: 'ja' })
      }
      return {
        series_id: Number(seriesId), collection_id: newCollectionId,
        episode_number: currentNum, title: title, video_path: vUrl,
        subtitles: subtitles, duration_minutes: 0
      }
    })

    const { error: epError } = await supabase.from('episodes').insert(epPayload)
    if (epError) throw epError

    showQuickAutoModal.value = false
    autoForm.name = ''; autoForm.name_ja = ''; autoForm.audio_language = ''; autoForm.subtitle_language = '';
    videoInput.value = ''; subInput.value = ''
    
    alert(`Thành công! Đã tạo Collection và ${epPayload.length} tập phim.`)
    refresh()

  } catch (err: any) {
    alert('エラー: ' + err.message)
  } finally {
    isAutoSaving.value = false
  }
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>