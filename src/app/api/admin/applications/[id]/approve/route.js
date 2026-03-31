import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { approvalEmail } from "@/lib/email-templates";

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

    // ─── 1. DB 처리 (Supabase 연동 시 여기에 추가) ───
    // const supabase = createServerClient();
    //
    // a) Supabase Auth 계정 생성
    // const { data: authData, error: authError } =
    //   await supabase.auth.admin.inviteUserByEmail(email);
    //
    // b) public.users INSERT
    // await supabase.from("users").insert({
    //   id: authData.user.id,
    //   application_id: id,
    //   email, artist_name,
    //   role: "member", status: "active",
    //   monthly_quota: 4, used_quota: 0,
    // });
    //
    // c) applications.status → approved
    // await supabase.from("applications")
    //   .update({ status: "approved", created_user_id: authData.user.id })
    //   .eq("id", id);

    console.log(`[승인] 신청 ID: ${id}, 작가: ${artist_name}, 이메일: ${email}`);

    // ─── 2. 승인 이메일 발송 ───
    const loginUrl =
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
        : "http://localhost:3000/login";

    const { subject, html } = approvalEmail({
      artist_name,
      login_url: loginUrl,
    });

    const emailResult = await sendEmail({ to: email, subject, html });

    return NextResponse.json({
      success: true,
      message: `${artist_name}님 승인 완료`,
      emailSent: emailResult.success,
      emailId: emailResult.id,
    });
  } catch (err) {
    console.error("승인 처리 에러:", err);
    return NextResponse.json(
      { error: "승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
