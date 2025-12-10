import { watch } from "vue";
import {
  useSupabaseClient,
  useSupabaseUser,
  useState,
  useNuxtApp,
} from "#imports";

export const useMyList = () => {
  const supabase = useSupabaseClient<any>();
  const user = useSupabaseUser();
  const nuxtApp = useNuxtApp();

  // State
  const myListKeys = useState<string[]>("my-list-keys", () => []);
  // [QUAN TRỌNG] Export biến này để trang MyList biết khi nào load xong ID
  const isFetched = useState<boolean>("my-list-fetched", () => false);

  const getUserId = async () => {
    if (user.value?.id) return user.value.id;
    const { data } = await supabase.auth.getUser();
    return data.user?.id;
  };

  const clearMyList = () => {
    myListKeys.value = [];
    isFetched.value = false;
  };

  const fetchMyList = async () => {
    // Nếu đã fetch xong thì thôi
    if (isFetched.value) return;

    // Cơ chế khóa Promise để tránh gọi API nhiều lần cùng lúc
    // @ts-ignore
    if (nuxtApp._fetchMyListPromise) return nuxtApp._fetchMyListPromise;

    const userId = await getUserId();
    if (!userId) return;

    // @ts-ignore
    nuxtApp._fetchMyListPromise = (async () => {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          supabase
            .from("user_movie_list")
            .select("movie_id, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("user_series_list")
            .select("series_id, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        const combined = [
          ...(moviesRes.data || []).map((i: any) => ({
            key: `movie-${i.movie_id}`,
            date: i.created_at,
          })),
          ...(seriesRes.data || []).map((i: any) => ({
            key: `series-${i.series_id}`,
            date: i.created_at,
          })),
        ].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Cắt top 50
        const top50 = combined.slice(0, 50).map((i) => i.key);

        myListKeys.value = top50;
        isFetched.value = true;
      } catch (e) {
        console.error("Error fetching my list:", e);
      } finally {
        // @ts-ignore
        nuxtApp._fetchMyListPromise = null;
      }
    })();

    // @ts-ignore
    return nuxtApp._fetchMyListPromise;
  };

  const isInMyList = (id: number, type: "movie" | "series") => {
    return myListKeys.value.includes(`${type}-${id}`);
  };

  const toggleMyList = async (id: number, type: "movie" | "series") => {
    const userId = await getUserId();
    if (!userId) {
      alert("マイリスト機能を使うにはログインしてください");
      return;
    }

    const key = `${type}-${id}`;
    const exists = myListKeys.value.includes(key);
    const table = type === "series" ? "user_series_list" : "user_movie_list";
    const col = type === "series" ? "series_id" : "movie_id";

    if (exists) {
      myListKeys.value = myListKeys.value.filter((k) => k !== key);
    } else {
      myListKeys.value.unshift(key);
    }

    try {
      if (exists) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId)
          .eq(col, id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert({ user_id: userId, [col]: id });
        if (error) throw error;
      }
    } catch (e: any) {
      console.error(e);
      alert("エラー: " + e.message);
      if (exists) myListKeys.value.unshift(key);
      else myListKeys.value = myListKeys.value.filter((k) => k !== key);
    }
  };

  return {
    myListKeys,
    isFetched,
    isInMyList,
    toggleMyList,
    fetchMyList,
    clearMyList,
  };
};
