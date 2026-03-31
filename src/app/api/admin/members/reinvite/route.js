import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * POST /api/admin/members/reinvite
 *
 * 승인된 회원에게 초대 메일을 다시 발송
 * - 기존 Auth 사용자가 있으면 삭제 후 재초대
 * - applications.status는 approved 유지
 */
export async function POST(request) {
  try {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { email, artist_name, application_id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "email은 필수입니다." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 연결 실패" }, { status: 500 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // ─── 1. 기존 Auth 사용자 찾기 + 삭제 ───
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingUser = listData?.users?.find(
      (u) => u.email === email
    );

    if (existingUser) {
      const { error: delError } = await supabase.auth.admin.deleteUser(
        existingUser.id
      );
      if (delError) {
        console.error("[재초대] Auth 사용자 삭제 실패:", delError);
        return NextResponse.json(
          { error: `기존 계정 삭제 실패: ${delError.message}` },
          { status: 500 }
        );
      }
      console.log(`[재초대] 기존 Auth 사용자 삭제 완료: ${email}`);
    }

    // ─── 2. 재초대 ───
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectTo = `${siteUrl}/auth/callback`;

    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { artist_name: artist_name || "", application_id: application_id || "" },
      });

    if (inviteError) {
      console.error("[재초대] 초대 실패:", inviteError);
      return NextResponse.json(
        { error: `초대 메일 발송 실패: ${inviteError.message}` },
        { status: 500 }
      );
    }

    console.log(`[재초대] 완료: ${email}`);

    return NextResponse.json({
      success: true,
      message: `${artist_name || email}님에게 초대 메일을 다시 발송했습니다.`,
    });
  } catch (err) {
    console.error("[재초대] 에러:", err);
    return NextResponse.json(
      { error: `재초대 처리 중 오류: ${err.message}` },
      { status: 500 }
    );
  }
}
