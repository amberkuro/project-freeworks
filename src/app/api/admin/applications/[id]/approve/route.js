import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { artist_name, email } = body;

    if (!artist_name || !email) {
      return NextResponse.json(
        { error: "artist_name, email은 필수입니다." },
        { status: 400 }
      );
    }

    // ─── 1. Supabase 클라이언트 (SERVICE_ROLE_KEY 필수) ───
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase 연결 실패. 환경변수를 확인하세요." },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 초대 메일 발송에는 Service Role Key가 필요합니다." },
        { status: 500 }
      );
    }

    // ─── 2. Supabase Auth 초대 메일 발송 ───
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectTo = `${siteUrl}/auth/callback`;

    let inviteResult = { alreadyInvited: false };

    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { artist_name, application_id: id },
      });

    if (inviteError) {
      const msg = inviteError.message || "";

      // ─── 중복 초대 처리 ───
      if (
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("User already registered")
      ) {
        console.log(`[승인] 이미 초대된 사용자: ${email}`);
        inviteResult.alreadyInvited = true;
      } else {
        // 실제 에러 — 관리자에게 원인 전달
        console.error("[승인] 초대 실패:", inviteError);
        return NextResponse.json(
          {
            error: `초대 메일 발송 실패: ${msg}`,
            detail: "Supabase Auth 설정 또는 이메일 발송 한도를 확인하세요.",
          },
          { status: 500 }
        );
      }
    }

    console.log(
      `[승인] 신청 ID: ${id}, 작가: ${artist_name}, 이메일: ${email}`,
      inviteResult.alreadyInvited ? "(이미 초대됨)" : "(초대 메일 발송 완료)"
    );

    // ─── 3. 응답 ───
    return NextResponse.json({
      success: true,
      message: inviteResult.alreadyInvited
        ? `${artist_name}님은 이미 초대된 상태입니다. 상태를 승인으로 변경합니다.`
        : `${artist_name}님에게 초대 메일이 발송되었습니다.`,
      alreadyInvited: inviteResult.alreadyInvited,
      inviteId: inviteData?.user?.id || null,
    });
  } catch (err) {
    console.error("승인 처리 에러:", err);
    return NextResponse.json(
      { error: `승인 처리 중 오류: ${err.message}` },
      { status: 500 }
    );
  }
}
