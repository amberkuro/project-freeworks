import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * GET /api/applications — 관리자 전용 목록 조회
 */
export async function GET() {
  try {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 미연결" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET applications] 에러:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // DB 컬럼 → 프론트 형식
    const apps = (data || []).map((row) => ({
      id: String(row.id),
      artist_name: row.name || "",
      email: row.email || "",
      instagram: row.instagram || "",
      twitter: row.twitter || "",
      product_category: row.category || "",
      product_description: row.description || "",
      status: row.status || "pending",
      created_at: row.created_at
        ? new Date(row.created_at).toLocaleDateString("ko-KR")
        : "",
      portfolio_files: parsePortfolio(row.portfolio_urls),
      isVipCreator: row.vip || false,
      adminMemo: row.vip_icon || "",
    }));

    console.log(`[GET applications] ${apps.length}건 조회`);
    return NextResponse.json({ data: apps });
  } catch (err) {
    console.error("[GET applications] 예외:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

/**
 * PATCH /api/applications — 관리자 전용 상태 변경
 */
export async function PATCH(request) {
  try {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const { id, updates } = await request.json();
    if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 미연결" }, { status: 500 });
    }

    // 프론트 필드 → DB 컬럼
    const dbUpdates = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isVipCreator !== undefined) dbUpdates.vip = updates.isVipCreator;
    if (updates.adminMemo !== undefined) dbUpdates.vip_icon = updates.adminMemo;

    console.log(`[PATCH applications] id=${id}`, dbUpdates);

    const { data, error } = await supabase
      .from("applications")
      .update(dbUpdates)
      .eq("id", Number(id))
      .select();

    if (error) {
      console.error("[PATCH applications] 에러:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PATCH applications] 예외:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

function parsePortfolio(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
