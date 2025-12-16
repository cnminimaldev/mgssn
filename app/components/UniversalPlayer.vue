<template>
  <div class="w-full bg-black relative group">
    <StreamingPlayer
      v-if="isDirect"
      :src="src"
      :poster="poster"
      :title="title"
      :startTime="startTime"
      :subtitles="subtitles"
      :content-id="contentId"
      :content-type="contentType"
      @ended="$emit('ended')"
      @timeupdate="$emit('timeupdate', $event)"
    />

    <div v-else-if="isEmbed" class="aspect-video w-full relative">
      <iframe
        :src="embedUrl"
        class="w-full h-full border-0"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerpolicy="no-referrer"
      ></iframe>
      
      <div 
        v-if="!hasCountedView"
        class="absolute inset-0 z-[-1] opacity-0 pointer-events-none"
        aria-hidden="true"
      ></div>
    </div>

    <div v-else class="aspect-video w-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 z-10">
      <div class="text-4xl mb-4">📺</div>
      <p class="font-medium">再生可能なソースがありません</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
// [FIX 1] Import rõ ràng để tránh lỗi auto-import không nhận diện được
import StreamingPlayer from '~/components/StreamingPlayer.vue';

const props = defineProps<{
  src: string;
  poster?: string;
  title?: string;
  subtitles?: any[];
  contentId?: number;
  contentType?: 'movie' | 'series';
  // [FIX 2] Thêm startTime để hỗ trợ tính năng Continue Watching
  startTime?: number; 
  provider?: {
    player_type: string;
    embed_pattern?: string | null;
  } | null;
}>();

const emit = defineEmits(['ended', 'timeupdate']);

// Logic xác định loại Player
const isDirect = computed(() => {
  // Nếu không có provider hoặc type là 'direct' -> Dùng Player nội bộ
  return !props.provider || props.provider.player_type === 'direct';
});

const isEmbed = computed(() => {
  return props.provider?.player_type === 'embed';
});

// Logic URL Embed
const embedUrl = computed(() => {
  if (!isEmbed.value || !props.provider?.embed_pattern) return props.src;
  return props.provider.embed_pattern.replace('{id}', props.src);
});

// Logic đếm view cho Iframe
const hasCountedView = ref(false);
let viewTimer: any = null;

onMounted(() => {
  if (isEmbed.value && props.contentId && props.contentType) {
    viewTimer = setTimeout(() => {
      hasCountedView.value = true;
      $fetch("/api/view", {
        method: "POST",
        body: { content_id: props.contentId, type: props.contentType },
      }).catch((err) => console.error(err));
    }, 30000);
  }
});

onBeforeUnmount(() => {
  if (viewTimer) clearTimeout(viewTimer);
});
</script>