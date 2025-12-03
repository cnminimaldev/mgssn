// composables/useContinueWatching.ts
import { computed, watch } from "vue";
import { useState } from "#app";
import { useAuth } from "~/composables/useAuth";

export interface ContinueItem {
  movieId: number;
  currentTime: number;
  duration: number;
  updatedAt: string; // ISO
}

const STORAGE_KEY_BASE = "mystream_continue";

/**
 * useContinueWatching
 *
 * - Lưu progress xem phim vào localStorage
 * - Key gắn với Supabase user.id → mỗi user một danh sách riêng
 * - Nếu chưa login thì dùng key "guest"
 */
export const useContinueWatching = () => {
  const { user } = useAuth();

  const list = useState<ContinueItem[]>("continueWatching", () => []);

  const storageKey = computed(() => {
    if (user.value?.id) {
      return `${STORAGE_KEY_BASE}_${user.value.id}`;
    }
    return `${STORAGE_KEY_BASE}_guest`;
  });

  const loadFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey.value);
      if (!raw) {
        list.value = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        list.value = [];
        return;
      }
      list.value = parsed.filter((item: any): item is ContinueItem => {
        return (
          item &&
          typeof item.movieId === "number" &&
          typeof item.currentTime === "number" &&
          typeof item.duration === "number" &&
          typeof item.updatedAt === "string"
        );
      });
    } catch {
      list.value = [];
    }
  };

  const syncToStorage = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey.value, JSON.stringify(list.value));
    } catch {
      // ignore
    }
  };

  if (typeof window !== "undefined") {
    // Khởi tạo từ localStorage
    loadFromStorage();

    // Khi user (và storageKey) thay đổi → load danh sách tương ứng
    watch(
      storageKey,
      () => {
        loadFromStorage();
      },
      { immediate: false }
    );

    // Tự động sync khi list thay đổi
    watch(
      list,
      () => {
        syncToStorage();
      },
      { deep: true }
    );
  }

  const setProgress = (
    movieId: number,
    currentTime: number,
    duration: number
  ) => {
    if (!Number.isFinite(duration) || duration <= 0) return;

    const now = new Date().toISOString();
    const idx = list.value.findIndex((item) => item.movieId === movieId);

    if (idx === -1) {
      // Thêm mới
      list.value.push({
        movieId,
        currentTime,
        duration,
        updatedAt: now,
      });
    } else {
      // Cập nhật — dùng non-null assertion để TS biết chắc existing không undefined
      const existing = list.value[idx]!;

      list.value[idx] = {
        movieId: existing.movieId,
        currentTime,
        duration,
        updatedAt: now,
      };
    }

    syncToStorage();
  };

  const clearProgressForMovie = (movieId: number) => {
    const idx = list.value.findIndex((item) => item.movieId === movieId);
    if (idx !== -1) {
      list.value.splice(idx, 1);
      syncToStorage();
    }
  };

  const getEntry = (movieId: number) => {
    return list.value.find((item) => item.movieId === movieId);
  };

  const sorted = computed<ContinueItem[]>(() => {
    return [...list.value].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  });

  return {
    list,
    sorted,
    setProgress,
    clearProgressForMovie,
    getEntry,
  };
};
