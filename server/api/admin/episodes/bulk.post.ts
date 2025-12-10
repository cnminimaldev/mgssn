import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { seriesId, collectionId, episodes } = body;

  // [FIX] Khởi tạo Service Role Client trước
  const client = serverSupabaseServiceRole<any>(event);

  // 1. [FIX] Lấy User từ Token trong Header (Thay vì cookie)
  const authHeader = getHeader(event, "Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Missing Authorization Token",
    });
  }

  // Xác thực token với Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser(token);

  if (userError || !user) {
    throw createError({ statusCode: 401, message: "Invalid Token" });
  }

  // 2. Check quyền Admin của người thực hiện
  // Dùng Service Role để đọc bảng profiles (bypass RLS nếu cần)
  const { data: requesterProfile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfile?.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Forbidden: You are not Admin",
    });
  }

  // Validate dữ liệu đầu vào
  if (
    !seriesId ||
    !collectionId ||
    !Array.isArray(episodes) ||
    episodes.length === 0
  ) {
    throw createError({ statusCode: 400, message: "Invalid data format" });
  }

  // 3. Chuẩn bị dữ liệu insert
  const insertData = episodes.map((ep: any) => ({
    series_id: seriesId,
    collection_id: collectionId,
    season_number: ep.season_number || 1,
    episode_number: ep.episode_number,
    title: ep.title || `Episode ${ep.episode_number}`,
    video_path: ep.video_path,
    thumbnail_url: ep.thumbnail_url || null,
    duration_minutes: ep.duration_minutes || 0,
    subtitles: ep.subtitles || [], // JSONB
    created_at: new Date(),
  }));

  // 4. Thực thi Insert
  const { data, error } = await client
    .from("episodes")
    .insert(insertData)
    .select();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true, count: data.length };
});
