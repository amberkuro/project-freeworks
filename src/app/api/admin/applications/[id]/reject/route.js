import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { rejectionEmail } from "@/lib/email-templates";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { artist_name, email, admin_note } = body;

    if (!artist_name || !email) {
      return NextResponse.json(
        { error: "artist_name, email은 필수입니다." },
        { status: 400 }
      );
    }

    // ─── 1. DB 처리 (Supabase 연동 시) ───
    // await supabase.from("applications")
    //   .update({ status: "rejected", admin_note, reviewed_at: new Date() })
    //   .eq("id", id);

    console.log(`[거절] 신청 ID: ${id}, 작가: ${artist_name}, 사유: ${admin_note || "없음"}`);

    // ─── 2. 거절 이메일 발송 ───
    const { subject, html } = rejectionEmail({
      artist_name,
      admin_note: admin_note || "",
    });

    const emailResult = await sendEmail({ to: email, subject, html });

    return NextResponse.json({
      success: true,
      message: `${artist_name}님 거절 처리 완료`,
      emailSent: emailResult.success,
      emailId: emailResult.id,
    });
  } catch (err) {
    console.error("거절 처리 에러:", err);
    return NextResponse.json(
      { error: "거절 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
