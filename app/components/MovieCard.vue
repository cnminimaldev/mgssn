<template>
  <div
    v-if="isSearchPage"
    class="group block w-full cursor-pointer"
    @click="handleClick"
  >
    <div
      class="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900"
    >
      <img
        :src="item.thumbnail || '/images/fallback-poster.webp'"
        :alt="item.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div v-if="item.type === 'series'" class="absolute right-1 top-1 z-10">
        <span
          class="rounded bg-indigo-600/90 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white shadow-sm backdrop-blur-sm"
        >
          SERIES
        </span>
      </div>

      <div
        class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"
      ></div>
    </div>

    <div class="mt-2 px-0.5">
      <h3
        class="text-sm font-bold text-zinc-200 leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors"
        :title="item.title"
      >
        {{ item.title }}
      </h3>

      <div class="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
        <span>{{ item.year }}</span>
        <span
          v-if="item.country"
          class="border border-zinc-700 px-1 rounded text-[9px] uppercase"
        >
          {{ item.country }}
        </span>
      </div>
    </div>
  </div>

  <div
    v-else
    ref="cardRef"
    class="relative aspect-video cursor-pointer overflow-hidden rounded-md bg-zinc-900 transition-all duration-300"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <img
      :src="item.thumbnail || '/images/fallback-poster.webp'"
      :alt="item.title"
      class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      loading="lazy"
    />

    <div v-if="item.type === 'series'" class="absolute right-1 top-1 z-10">
      <span
        class="rounded bg-indigo-600/90 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white shadow-sm backdrop-blur-sm"
      >
        SERIES
      </span>
    </div>

    <div
      class="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-transparent to-transparent p-2 opacity-100 transition-opacity duration-300 group-hover:opacity-0"
    >
      <p class="line-clamp-1 text-xs font-medium text-zinc-100 drop-shadow-md">
        {{ item.title }}
      </p>
    </div>

    <Teleport to="body">
      <div
        v-if="showPopup"
        ref="popupRef"
        class="fixed z-[9999] overflow-hidden rounded-lg bg-[#141414] shadow-2xl ring-1 ring-white/10 transition-all duration-300 ease-out"
        :style="popupStyle"
        @mouseenter="handlePopupEnter"
        @mouseleave="handleMouseLeave"
      >
        <div
          class="relative aspect-video w-full cursor-pointer"
          @click="handleClick"
        >
          <img
            :src="item.thumbnail || '/images/fallback-poster.webp'"
            :alt="item.title"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60"
          ></div>

          <div class="absolute bottom-3 left-3 right-3">
            <h3
              class="line-clamp-1 text-base font-bold text-white drop-shadow-lg sm:text-lg"
            >
              {{ item.title }}
            </h3>
          </div>
        </div>

        <div class="p-3">
          <div class="mb-3 flex items-center gap-2">
            <NuxtLink
              :to="linkTo"
              class="flex items-center gap-1 rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clip-rule="evenodd"
                />
              </svg>
              再生
            </NuxtLink>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-500 text-zinc-300 hover:border-white hover:text-white transition"
              :class="{
                'border-emerald-500 text-emerald-500 hover:border-emerald-400 hover:text-emerald-400':
                  inMyList,
              }"
              title="マイリスト"
              @click.stop="handleToggleList"
            >
              <span v-if="inMyList" class="text-xs font-bold">✔</span>
              <span v-else class="text-lg leading-none mb-0.5">＋</span>
            </button>

            <NuxtLink
              :to="linkTo"
              class="ml-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-500 text-zinc-300 hover:border-white hover:text-white transition"
              title="詳細情報"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </NuxtLink>
          </div>

          <div
            class="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-medium text-zinc-400"
          >
            <span class="text-emerald-400 font-bold">{{ item.year }}</span>
            <span v-if="item.episodeCount" class="text-zinc-300"
              >{{ item.episodeCount }}エピソード</span
            >
            <span
              class="rounded border border-zinc-600 px-1 py-0.5 text-[9px] tracking-wider text-zinc-400"
              >HD</span
            >
          </div>

          <div class="mb-2 flex flex-wrap gap-x-2 text-[10px] text-zinc-300">
            <span v-if="item.genre" class="flex items-center gap-1">
              <span class="w-1 h-1 rounded-full bg-zinc-500"></span>
              {{ item.genre }}
            </span>
            <span v-if="item.country" class="flex items-center gap-1">
              <span class="w-1 h-1 rounded-full bg-zinc-500"></span>
              {{ item.country }}
            </span>
          </div>

          <p
            v-if="item.description"
            class="mt-2 line-clamp-3 text-[10px] leading-relaxed text-zinc-400"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useMyList } from "~/composables/useMyList";
import { navigateTo, useRoute } from "#imports";
import type { CSSProperties } from "vue";

const props = defineProps<{
  item: {
    id: number;
    type: "movie" | "series";
    slug: string;
    title: string;
    thumbnail?: string;
    posterUrl?: string;
    year?: number;
    genre?: string;
    country?: string;
    episodeCount?: number;
    description?: string;
  };
}>();

// [THÊM] Kiểm tra xem có phải đang ở trang Search không
const route = useRoute();
const isSearchPage = computed(() => route.path === "/search");

const linkTo = computed(() =>
  props.item.type === "series"
    ? `/series/${props.item.slug}`
    : `/movie/${props.item.slug}`
);

const handleClick = () => {
  navigateTo(linkTo.value);
};

const { isInMyList, toggleMyList } = useMyList();
const inMyList = computed(() => isInMyList(props.item.id, props.item.type));

const handleToggleList = () => {
  toggleMyList(props.item.id, props.item.type);
};

// --- Logic Hover & Popup Position (Chỉ chạy khi không phải Search Page) ---
const isHovered = ref(false);
const showPopup = ref(false);
const cardRef = ref<HTMLElement | null>(null);
const timer = ref<any>(null);

const coords = ref({ top: 0, left: 0, width: 0 });

const calculatePosition = () => {
  // Nếu ở trang search thì không bật popup (hoặc do v-if đã ẩn cardRef)
  if (!cardRef.value) return;
  const rect = cardRef.value.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 24;

  // Scale 1.5 lần
  const scale = 1.5;
  const popupWidth = rect.width * scale;

  // LEFT
  let left = rect.left - (popupWidth - rect.width) / 2;
  if (left < margin) left = margin;
  else if (left + popupWidth > viewportWidth - margin)
    left = viewportWidth - popupWidth - margin;

  // TOP
  let top = rect.top - (rect.height * (scale - 1)) / 2;

  // Ước lượng chiều cao popup (Ảnh + Info ~ 150px)
  const estimatedHeight = rect.height * scale + 150;

  // Nếu tràn dưới -> Đẩy lên
  if (top + estimatedHeight > viewportHeight - margin) {
    top = viewportHeight - estimatedHeight - margin;
  }

  // Chặn tràn trên
  if (top < margin + 64) {
    top = margin + 64;
  }

  coords.value = { top, left, width: popupWidth };
};

const popupStyle = computed<CSSProperties>(() => ({
  top: `${coords.value.top}px`,
  left: `${coords.value.left}px`,
  width: `${coords.value.width}px`,
  transform: isHovered.value ? "scale(1)" : "scale(0.95)",
  opacity: isHovered.value ? 1 : 0,
  pointerEvents: isHovered.value ? "auto" : "none",
  transformOrigin: "center center",
}));

const handleMouseEnter = () => {
  // [THÊM] Không hiện popup ở trang search
  if (isSearchPage.value) return;

  timer.value = setTimeout(() => {
    calculatePosition();
    showPopup.value = true;
    requestAnimationFrame(() => {
      isHovered.value = true;
    });
  }, 400);
};

const handlePopupEnter = () => {
  if (timer.value) clearTimeout(timer.value);
  isHovered.value = true;
  showPopup.value = true;
};

const handleMouseLeave = () => {
  if (timer.value) clearTimeout(timer.value);
  isHovered.value = false;
  setTimeout(() => {
    if (!isHovered.value) showPopup.value = false;
  }, 300);
};

const closeOnScroll = () => {
  if (isHovered.value) {
    isHovered.value = false;
    showPopup.value = false;
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("scroll", closeOnScroll);
}

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", closeOnScroll);
  }
});
</script>
