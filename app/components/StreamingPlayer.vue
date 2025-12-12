<template>
  <div
    ref="containerRef"
    class="group relative flex items-center justify-center aspect-video w-full overflow-hidden bg-black text-white select-none player-wrapper"
    tabindex="0"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
    @click="focusPlayer"
    @dblclick="toggleFullscreen"
  >
    <div class="aspect-video w-full bg-black relative">
      <video
        ref="videoRef"
        class="h-full w-full bg-black cursor-pointer outline-none"
        :poster="poster"
        playsinline
        crossorigin="anonymous"
        tabindex="-1"
        @click.stop="togglePlay"
      >
        <track
          v-if="isIOS && activeTrackSrc"
          kind="subtitles"
          :src="activeTrackSrc"
          :label="activeTrackLabel"
          :srclang="activeTrackLang"
          default
        />
      </video>

      <div
        v-if="currentSubtitleText && !isIOS"
        class="pointer-events-none absolute left-0 right-0 z-20 flex justify-center px-[5%] text-center transition-all duration-300"
        :class="{ 'bottom-[12%]': showControls, 'bottom-[5%]': !showControls }"
      >
        <span
          class="inline-block px-[0.5em] py-[0.2em] rounded transition-all"
          :style="subtitleStyle"
          v-html="currentSubtitleText"
        ></span>
      </div>
    </div>

    <div
      v-if="isBuffering"
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 z-30"
    >
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-500"
      ></div>
    </div>

    <div
      v-if="!isPlaying && !isBuffering"
      class="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 z-30"
      @click.stop="togglePlay"
    >
      <button
        class="group/btn flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm ring-1 ring-white/20 transition-transform hover:scale-110 hover:bg-emerald-500 hover:text-black hover:ring-emerald-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="h-10 w-10 ml-1"
        >
          <path
            fill-rule="evenodd"
            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div
      class="pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-300 z-40"
      :class="{
        'opacity-0': !showControls && isPlaying,
        'opacity-100': showControls || !isPlaying,
      }"
    >
      <div
        class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent"
      ></div>

      <div
        class="pointer-events-auto relative z-10 flex items-start justify-between px-6 pt-6"
      >
        <h3
          class="max-w-[80%] truncate text-base font-medium text-white drop-shadow-md"
        >
          {{ title }}
        </h3>
      </div>

      <div
        class="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12"
      >
        <div
          class="group/progress pointer-events-auto relative mb-4 h-1.5 w-full cursor-pointer touch-none select-none rounded-full bg-white/20 hover:h-2 transition-all"
          @click="handleSeek"
          @mousedown="startDragging"
          @mousemove="handleProgressMove"
          @mouseleave="handleProgressLeave"
          @touchstart="startDragging"
          @touchmove="handleDragging"
          @touchend="stopDragging"
        >
          <div 
            v-if="isHoveringProgress"
            class="absolute bottom-4 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white shadow-sm border border-white/10 whitespace-nowrap pointer-events-none z-50"
            :style="{ left: hoverProgressLeft }"
          >
            {{ hoverProgressTime }}
          </div>

          <div
            class="absolute h-full rounded-full bg-white/30 transition-all duration-300"
            :style="{ width: `${bufferedPercentage}%` }"
          ></div>
          <div
            class="absolute h-full rounded-full bg-emerald-500 transition-all duration-100"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
          <div
            class="absolute top-1/2 -mt-2 h-4 w-4 -translate-x-1/2 scale-0 rounded-full bg-white shadow-lg transition-transform group-hover/progress:scale-100"
            :style="{ left: `${progressPercentage}%` }"
          ></div>
        </div>

        <div class="pointer-events-auto flex items-center justify-between">
          <div class="flex items-center gap-1 sm:gap-3">
            <button
              class="text-white hover:text-emerald-400 transition-colors p-1"
              @click.stop="togglePlay"
            >
              <svg
                v-if="!isPlaying"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-8 w-8"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-8 w-8"
              >
                <path
                  fill-rule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <button
              class="text-white hover:text-emerald-400 transition-colors p-1 relative flex items-center justify-center group"
              @click.stop="seekBy(-5)"
              title="-5秒"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-7 w-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              <span
                class="absolute text-[9px] font-bold mt-[1px] ml-0.5 pointer-events-none select-none"
                >5</span
              >
            </button>

            <button
              class="text-white hover:text-emerald-400 transition-colors p-1 relative flex items-center justify-center group"
              @click.stop="seekBy(5)"
              title="+5秒"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-7 w-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
                />
              </svg>
              <span
                class="absolute text-[9px] font-bold mt-[1px] mr-0.5 pointer-events-none select-none"
                >5</span
              >
            </button>

            <div v-if="!isIOS" class="group/vol flex items-center ml-2">
              <button
                class="text-white hover:text-emerald-400 p-1 mr-3"
                @click.stop="toggleMute"
              >
                <svg
                  v-if="isMuted || volume === 0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
                <svg
                  v-else-if="volume < 0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                v-model.number="volume"
                class="h-1 w-0 cursor-pointer appearance-none rounded-full bg-zinc-500 accent-emerald-400 transition-all group-hover/vol:w-20"
                @input="applyVolume"
                @click.stop
              />
            </div>

            <div class="text-xs text-zinc-300 font-mono select-none ml-2">
              {{ formattedCurrentTime }} / {{ formattedDuration }}
            </div>
          </div>

          <div class="flex items-center gap-1 sm:gap-2">
            <div class="relative">
              <button
                class="text-white hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-white/10"
                :class="{ 'text-emerald-400': showSettings }"
                @click.stop="toggleSettings"
                title="画質設定"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              <div
                v-if="showSettings"
                class="absolute bottom-full right-0 mb-3 w-48 overflow-hidden rounded-xl bg-zinc-900/95 p-1 shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
                @click.stop
              >
                <div
                  class="px-3 py-2 text-[10px] font-bold uppercase text-zinc-500 border-b border-white/10 mb-1"
                >
                  画質 (Quality)
                </div>
                <div class="space-y-0.5 max-h-60 overflow-y-auto">
                  <button
                    v-for="lvl in qualityLevels"
                    :key="lvl.id"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                    @click="changeQuality(lvl.id)"
                  >
                    <span>{{ lvl.label }}</span>
                    <span
                      v-if="currentQuality === lvl.id"
                      class="text-emerald-400 font-bold"
                      >✓</span
                    >
                  </button>
                </div>
              </div>
            </div>

            <div class="relative" v-if="subtitles && subtitles.length > 0">
              <button
                class="text-white hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-white/10"
                :class="{
                  'text-emerald-400': showSubsMenu || activeTrackIndex !== -1,
                }"
                @click.stop="toggleSubsMenu"
                title="字幕"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.375.028.716.223.93.531L12 21l2.755-4.133c.214-.32.555-.515.93-.53 1.129-.045 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </button>

              <div
                v-if="showSubsMenu"
                class="absolute bottom-full right-0 mb-3 w-64 overflow-hidden rounded-xl bg-zinc-900/95 p-1 shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
                @click.stop
              >
                <div class="p-2 space-y-4">
                  <div class="space-y-1">
                    <p
                      class="text-[10px] text-zinc-500 uppercase font-bold px-1"
                    >
                      言語 (Track)
                    </p>
                    <div class="space-y-0.5">
                      <button
                        class="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-white/10"
                        :class="
                          activeTrackIndex === -1
                            ? 'text-emerald-400 font-bold'
                            : 'text-zinc-300'
                        "
                        @click="changeTrack(-1)"
                      >
                        オフ (Off)<span v-if="activeTrackIndex === -1">✓</span>
                      </button>
                      <button
                        v-for="(sub, idx) in subtitles"
                        :key="idx"
                        class="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-white/10"
                        :class="
                          activeTrackIndex === idx
                            ? 'text-emerald-400 font-bold'
                            : 'text-zinc-300'
                        "
                        @click="changeTrack(idx)"
                      >
                        {{ sub.label }} ({{ sub.lang }})<span
                          v-if="activeTrackIndex === idx"
                          >✓</span
                        >
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="activeTrackIndex !== -1 && !isIOS"
                    class="space-y-3 pt-3 border-t border-white/10"
                  >
                    <div class="space-y-1">
                      <p
                        class="text-[10px] text-zinc-500 uppercase font-bold px-1"
                      >
                        フォント
                      </p>
                      <select
                        v-model="subSettings.fontFamily"
                        class="w-full bg-black/50 text-xs text-zinc-200 rounded px-2 py-1.5 outline-none border border-zinc-700 focus:border-emerald-500"
                      >
                        <option value="'Noto Sans JP', sans-serif">
                          ゴシック (Gothic)
                        </option>
                        <option value="'Noto Serif JP', serif">
                          明朝体 (Mincho)
                        </option>
                        <option value="'Kosugi Maru', sans-serif">
                          丸ゴシック (Rounded)
                        </option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <p
                        class="text-[10px] text-zinc-500 uppercase font-bold px-1"
                      >
                        サイズ
                      </p>
                      <input
                        type="range"
                        min="25"
                        max="200"
                        step="5"
                        v-model.number="subSettings.fontSize"
                        class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div
                        class="flex justify-between text-[10px] text-zinc-500 px-1"
                      >
                        <span>小</span><span>{{ subSettings.fontSize }}%</span
                        ><span>大</span>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <p
                        class="text-[10px] text-zinc-500 uppercase font-bold px-1"
                      >
                        背景
                      </p>
                      <div class="flex gap-1">
                        <button
                          v-for="bg in bgOptions"
                          :key="bg.val"
                          class="flex-1 py-1 text-[10px] rounded border transition-colors"
                          :class="
                            subSettings.bgOpacity === bg.val
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          "
                          @click="subSettings.bgOpacity = bg.val"
                        >
                          {{ bg.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="isIOS && activeTrackIndex !== -1"
                    class="pt-2 border-t border-white/10 text-[10px] text-zinc-400 text-center"
                  >
                    ※iOSでは端末の設定が適用されます
                  </div>
                </div>
              </div>
            </div>

            <button
              class="text-white hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-white/10"
              @click.stop="toggleFullscreen"
              title="全画面"
            >
              <svg
                v-if="!isFullscreen"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  reactive,
  nextTick,
} from "vue";
import Hls from "hls.js";

type SubtitleTrack = { src: string; label: string; lang: string };
type Cue = { start: number; end: number; text: string };

const props = defineProps<{
  src: string;
  poster?: string;
  title?: string;
  startTime?: number;
  subtitles?: SubtitleTrack[];
  contentId?: number;
  contentType?: "movie" | "series";
}>();

const emit = defineEmits<{
  (e: "timeupdate", payload: { currentTime: number; duration: number }): void;
  (e: "ended"): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
let hls: Hls | null = null;

// State
const isPlaying = ref(false);
const isBuffering = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const bufferedEnd = ref(0);
const volume = ref(1);
const previousVolume = ref(1);
const isMuted = ref(false);
const isFullscreen = ref(false);
const showControls = ref(true);
const hasCountedView = ref(false);
const watchedDuration = ref(0);
const lastTime = ref(0);

// [THÊM MỚI] Biến kiểm tra iOS
const isIOS = ref(false);

// [THÊM MỚI] Tooltip State
const isHoveringProgress = ref(false);
const hoverProgressLeft = ref("0%");
const hoverProgressTime = ref("00:00");

// Menu States
const showSettings = ref(false);
const showSubsMenu = ref(false);

let controlsTimeout: any = null;
let mouseMoveTimeout: any = null;
let isDragging = false;

// --- SUBTITLE STATE ---
const activeTrackIndex = ref(-1); // -1 = Off
const currentSubtitleText = ref("");
const parsedCues = ref<Cue[]>([]);
const currentCueIndex = ref(0);

const subSettings = reactive({
  fontSize: 100,
  fontFamily: "'Noto Sans JP', sans-serif",
  bgOpacity: 0.5,
});

const bgOptions = [
  { val: 0, label: "なし" },
  { val: 0.5, label: "半透明" },
  { val: 0.9, label: "黒" },
];

// [THÊM MỚI] Computed cho Native Track (iOS)
const activeTrackSrc = computed(() => {
  if (activeTrackIndex.value === -1 || !props.subtitles) return undefined;
  return props.subtitles[activeTrackIndex.value]?.src;
});

const activeTrackLabel = computed(() => {
  if (activeTrackIndex.value === -1 || !props.subtitles) return undefined;
  return props.subtitles[activeTrackIndex.value]?.label;
});

const activeTrackLang = computed(() => {
  if (activeTrackIndex.value === -1 || !props.subtitles) return undefined;
  return props.subtitles[activeTrackIndex.value]?.lang;
});

// Subtitle Style (Custom)
const subtitleStyle = computed(() => {
  const scale = subSettings.fontSize / 100;
  return {
    fontSize: `max(10px, calc(${scale} * 3cqw - 2px))`,
    lineHeight: "1.4",
    fontFamily: subSettings.fontFamily,
    backgroundColor: `rgba(0, 0, 0, ${subSettings.bgOpacity})`,
    textShadow:
      subSettings.bgOpacity === 0
        ? "1px 1px 2px black, -1px -1px 2px black"
        : "none",
    color: "#fff",
  };
});

// --- SUBTITLE LOGIC ---
const parseVttTime = (timeStr: string): number => {
  const parts = timeStr.split(":");
  let seconds = 0;
  if (parts.length === 3) {
    seconds += parseFloat(parts[0]!) * 3600;
    seconds += parseFloat(parts[1]!) * 60;
    seconds += parseFloat(parts[2]!);
  } else if (parts.length === 2) {
    seconds += parseFloat(parts[0]!) * 60;
    seconds += parseFloat(parts[1]!);
  }
  return seconds;
};

const parseVttContent = (content: string): Cue[] => {
  const cues: Cue[] = [];
  const lines = content.trim().split(/\r\n|\n|\r/);
  let currentCue: Partial<Cue> | null = null;
  const timeRegex =
    /^(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s-->\s(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) {
      if (
        currentCue &&
        currentCue.text &&
        currentCue.start !== undefined &&
        currentCue.end !== undefined
      ) {
        cues.push(currentCue as Cue);
        currentCue = null;
      }
      continue;
    }
    if (line === "WEBVTT" || line.startsWith("NOTE")) continue;
    if (/^\d+$/.test(line)) continue;

    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      if (currentCue && currentCue.text) {
        cues.push(currentCue as Cue);
      }
      currentCue = {
        start: parseVttTime(timeMatch[1]!),
        end: parseVttTime(timeMatch[2]!),
        text: "",
      };
    } else if (currentCue) {
      currentCue.text = currentCue.text
        ? currentCue.text + "<br>" + line
        : line;
    }
  }
  if (currentCue && currentCue.text) {
    cues.push(currentCue as Cue);
  }
  return cues;
};

const changeTrack = async (index: number) => {
  activeTrackIndex.value = index;
  parsedCues.value = [];
  currentSubtitleText.value = "";
  currentCueIndex.value = 0;

  if (index === -1 || !props.subtitles || !props.subtitles[index]) return;

  if (isIOS.value) return;

  const sub = props.subtitles[index];
  try {
    const response = await fetch(sub.src);
    if (response.ok) {
      const text = await response.text();
      parsedCues.value = parseVttContent(text);
    }
  } catch (e) {
    console.error("Failed to load sub:", e);
  }
};

const updateSubtitle = (time: number) => {
  if (isIOS.value) return;

  if (!parsedCues.value || parsedCues.value.length === 0) {
    currentSubtitleText.value = "";
    return;
  }

  const currentIndex = currentCueIndex.value;
  const currentCue = parsedCues.value[currentIndex];

  if (currentCue && time >= currentCue.start && time <= currentCue.end) {
    if (currentSubtitleText.value !== currentCue.text) {
      currentSubtitleText.value = currentCue.text;
    }
    return;
  }

  if (currentCue && time > currentCue.end) {
    for (let i = currentIndex; i < parsedCues.value.length; i++) {
      const cue = parsedCues.value[i];
      if (!cue) continue;
      if (time >= cue.start && time <= cue.end) {
        currentCueIndex.value = i;
        currentSubtitleText.value = cue.text;
        return;
      }
      if (cue.start > time) {
        currentCueIndex.value = i;
        currentSubtitleText.value = "";
        return;
      }
    }
  }

  const foundIndex = parsedCues.value.findIndex(
    (c) => time >= c.start && time <= c.end
  );
  if (foundIndex !== -1) {
    currentCueIndex.value = foundIndex;
    const foundCue = parsedCues.value[foundIndex];
    if (foundCue) currentSubtitleText.value = foundCue.text;
  } else {
    currentSubtitleText.value = "";
    currentCueIndex.value = 0;
  }
};

watch(
  () => props.subtitles,
  (newSubs) => {
    if (!newSubs || newSubs.length === 0) {
      activeTrackIndex.value = -1;
      return;
    }
    const jaIndex = newSubs.findIndex((s) => s.lang === "ja");
    if (jaIndex !== -1) changeTrack(jaIndex);
    else changeTrack(-1);
  },
  { immediate: true }
);

// --- PLAYER LOGIC ---

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
  if (showSettings.value) showSubsMenu.value = false;
  showControlsTemporary();
};

const toggleSubsMenu = () => {
  showSubsMenu.value = !showSubsMenu.value;
  if (showSubsMenu.value) showSettings.value = false;
  showControlsTemporary();
};

onMounted(() => {
  const saved = localStorage.getItem("player_sub_settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(subSettings, parsed);
    } catch (e) {}
  }
});

watch(subSettings, (newVal) => {
  localStorage.setItem("player_sub_settings", JSON.stringify(newVal));
});

type QualityLevel = { id: number; label: string; height: number };
const qualityLevels = ref<QualityLevel[]>([]);
const currentQuality = ref<number>(-1);

const progressPercentage = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

const bufferedPercentage = computed(() => {
  if (!duration.value) return 0;
  return (bufferedEnd.value / duration.value) * 100;
});

const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(duration.value));

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

const showControlsTemporary = () => {
  showControls.value = true;
  if (controlsTimeout) clearTimeout(controlsTimeout);
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false;
      showSettings.value = false;
      showSubsMenu.value = false;
    }, 2500);
  }
};

const initPlayer = () => {
  const video = videoRef.value;
  if (!video) return;

  if (hls) {
    hls.destroy();
    hls = null;
  }

  qualityLevels.value = [{ id: -1, label: "自動 (Auto)", height: 0 }];
  currentQuality.value = -1;

  if (Hls.isSupported() && props.src.endsWith(".m3u8")) {
    hls = new Hls({ maxBufferLength: 30 });
    hls.loadSource(props.src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (props.startTime) video.currentTime = props.startTime;
      if (hls && hls.levels.length > 0) {
        const levels = hls.levels.map((lvl, index) => ({
          id: index,
          label: lvl.height ? `${lvl.height}p` : `Level ${index}`,
          height: lvl.height,
        }));
        levels.sort((a, b) => b.height - a.height);
        qualityLevels.value = [
          { id: -1, label: "自動 (Auto)", height: 0 },
          ...levels,
        ];
      }
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            hls?.destroy();
            break;
        }
      }
    });
  } else {
    video.src = props.src;
    if (props.startTime) video.currentTime = props.startTime;
  }
};

const focusPlayer = () => {
  containerRef.value?.focus();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)
  )
    return;
  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlay();
      break;
    case "ArrowLeft":
      e.preventDefault();
      seekBy(-5);
      break;
    case "ArrowRight":
      e.preventDefault();
      seekBy(5);
      break;
  }
};

const seekBy = (seconds: number) => {
  if (!videoRef.value) return;
  const newTime = Math.min(
    Math.max(videoRef.value.currentTime + seconds, 0),
    duration.value
  );
  videoRef.value.currentTime = newTime;
  currentTime.value = newTime;
  currentCueIndex.value = 0;
  updateSubtitle(newTime);
  showControlsTemporary();
  if (videoRef.value) lastTime.value = videoRef.value.currentTime;
};

const togglePlay = () => {
  focusPlayer();
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {});
    isPlaying.value = true;
  } else {
    videoRef.value.pause();
    isPlaying.value = false;
  }
  showSettings.value = false;
  showSubsMenu.value = false;
  showControlsTemporary();
};

const toggleMute = () => {
  if (!videoRef.value) return;
  if (videoRef.value.muted) {
    videoRef.value.muted = false;
    isMuted.value = false;
    volume.value = previousVolume.value === 0 ? 1 : previousVolume.value;
    videoRef.value.volume = volume.value;
  } else {
    previousVolume.value = volume.value;
    videoRef.value.muted = true;
    isMuted.value = true;
    volume.value = 0;
  }
  showControlsTemporary();
};

const applyVolume = () => {
  if (!videoRef.value) return;
  videoRef.value.volume = volume.value;
  if (volume.value > 0) {
    isMuted.value = false;
    videoRef.value.muted = false;
  }
  showControlsTemporary();
};

const handleSeek = (e: MouseEvent) => {
  if (!videoRef.value || !duration.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / rect.width));
  videoRef.value.currentTime = percentage * duration.value;
  currentCueIndex.value = 0;
  updateSubtitle(videoRef.value.currentTime);
  showControlsTemporary();
  if (videoRef.value) lastTime.value = videoRef.value.currentTime;
};

const startDragging = () => {
  isDragging = true;
};
const stopDragging = () => {
  isDragging = false;
};

const handleDragging = (e: MouseEvent | TouchEvent) => {
  if (isDragging && videoRef.value && duration.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    let clientX = 0;
    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = e.touches[0]!.clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }

    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.value.currentTime = percentage * duration.value;
    showControlsTemporary();
  }
};

// [THÊM MỚI] Tooltip Handlers
const handleProgressMove = (e: MouseEvent) => {
  if (!duration.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, offsetX / rect.width));
  
  hoverProgressLeft.value = `${percent * 100}%`;
  hoverProgressTime.value = formatTime(percent * duration.value);
  isHoveringProgress.value = true;
};

const handleProgressLeave = () => {
  isHoveringProgress.value = false;
};

const toggleFullscreen = () => {
  if (!containerRef.value) return;

  if (isIOS.value && videoRef.value) {
    // @ts-ignore
    if (videoRef.value.webkitEnterFullscreen) {
      // @ts-ignore
      videoRef.value.webkitEnterFullscreen();
    }
  } else {
    if (!document.fullscreenElement) {
      containerRef.value.requestFullscreen();
      isFullscreen.value = true;
    } else {
      document.exitFullscreen();
      isFullscreen.value = false;
    }
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const changeQuality = (levelId: number) => {
  currentQuality.value = levelId;
  if (hls) hls.currentLevel = levelId;
  showSettings.value = false;
  showControlsTemporary();
};

const handleMouseMove = () => {
  if (mouseMoveTimeout) return;
  showControlsTemporary();
  mouseMoveTimeout = setTimeout(() => {
    mouseMoveTimeout = null;
  }, 100);
};

const handleMouseLeave = () => {
  if (isPlaying.value) {
    showControls.value = false;
    showSettings.value = false;
    showSubsMenu.value = false;
  }
};

const onTimeUpdate = () => {
  if (!videoRef.value || isDragging) return;
  const now = videoRef.value.currentTime;
  const delta = now - lastTime.value;
  lastTime.value = now;

  if (delta > 0 && delta < 1) {
    watchedDuration.value += delta;
  }

  currentTime.value = now;

  if (!hasCountedView.value && watchedDuration.value > 30) {
    if (props.contentId && props.contentType) {
      hasCountedView.value = true;
      $fetch("/api/view", {
        method: "POST",
        body: { content_id: props.contentId, type: props.contentType },
      }).catch((err) => console.error(err));
    }
  }

  updateSubtitle(now);
  emit("timeupdate", { currentTime: now, duration: duration.value });
};

const onDurationChange = () => {
  if (videoRef.value) duration.value = videoRef.value.duration;
};
const onProgress = () => {
  if (videoRef.value && videoRef.value.buffered.length)
    bufferedEnd.value = videoRef.value.buffered.end(
      videoRef.value.buffered.length - 1
    );
};
const onWaiting = () => {
  isBuffering.value = true;
};
const onPlaying = () => {
  isBuffering.value = false;
  isPlaying.value = true;
  if (videoRef.value) lastTime.value = videoRef.value.currentTime;
};
const onPause = () => {
  isPlaying.value = false;
  showControls.value = true;
};
const onSeeked = () => {
  if (videoRef.value) lastTime.value = videoRef.value.currentTime;
};
const onEnded = () => {
  isPlaying.value = false;
  showControls.value = true;
  emit("ended");
};

watch(() => props.src, initPlayer);

onMounted(() => {
  const ua = navigator.userAgent;
  isIOS.value = /iPad|iPhone|iPod/.test(ua);

  const v = videoRef.value;
  if (v) {
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("progress", onProgress);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("seeked", onSeeked);
  }
  window.addEventListener("mouseup", stopDragging);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  
  // [SỬA LỖI] Xóa việc gán handleKeydown vào window để tránh double-event
  // window.addEventListener("keydown", handleKeydown);

  initPlayer();
});

onBeforeUnmount(() => {
  const v = videoRef.value;
  if (v) {
    v.removeEventListener("timeupdate", onTimeUpdate);
    v.removeEventListener("durationchange", onDurationChange);
    v.removeEventListener("progress", onProgress);
    v.removeEventListener("waiting", onWaiting);
    v.removeEventListener("playing", onPlaying);
    v.removeEventListener("pause", onPause);
    v.removeEventListener("ended", onEnded);
    v.removeEventListener("seeked", onSeeked);
  }
  window.removeEventListener("mouseup", stopDragging);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  // window.removeEventListener("keydown", handleKeydown);
  
  if (hls) hls.destroy();
  if (controlsTimeout) clearTimeout(controlsTimeout);
  if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&display=swap");

.player-wrapper {
  container-type: inline-size;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  margin-top: -4px;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #52525b;
  border-radius: 2px;
}
</style>