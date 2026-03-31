import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * POST /api/admin/members/delete
 *
 * 승인된 회원 삭제
 * - Supabase Auth에서 사용자 삭제
 * - applications.status → "rejected"
 */
export async function POST(request) {
  try {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { email, application_id } = await request.json();

    if (!email || !application_id) {
      return NextResponse.json(
        { error: "email, application_id는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 연결 실패" }, { status: 500 });
    }

    // ─── 1. Supabase Auth 사용자 삭제 ───
    let authDeleted = false;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u) => u.email === email
      );

      if (existingUser) {
        const { error: delError } = await supabase.auth.admin.deleteUser(
          existingUser.id
        );
        if (delError) {
          console.error("[회원삭제] Auth 삭제 실패:", delError);
          // Auth 삭제 실패해도 applications 상태는 변경 진행
        } else {
          authDeleted = true;
          console.log(`[회원삭제] Auth 사용자 삭제 완료: ${email}`);
        }
      }
    }

    // ─── 2. applications.status → "rejected" ───
    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("id", Number(application_id));

    if (updateError) {
      console.error("[회원삭제] applications 업데이트 실패:", updateError);
      return NextResponse.json(
        { error: `상태 변경 실패: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log(
      `[회원삭제] 완료: ${email} (id=${application_id}, auth삭제=${authDeleted})`
    );

    return NextResponse.json({
      success: true,
      message: `회원이 삭제되었습니다.`,
      authDeleted,
    });
  } catch (err) {
    console.error("[회원삭제] 에러:", err);
    return NextResponse.json(
      { error: `삭제 처리 중 오류: ${err.message}` },
      { status: 500 }
    );
  }
}
