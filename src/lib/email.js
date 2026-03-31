/**
 * 이메일 발송 유틸리티
 *
 * Resend (https://resend.com) 사용
 * 환경변수: RESEND_API_KEY
 *
 * 개발 환경에서는 실제 발송 없이 콘솔 로그만 출력합니다.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "프리웍스 <noreply@freeworks.kr>";

export async function sendEmail({ to, subject, html }) {
  // 개발 환경 — API 키 없으면 콘솔 로그만
  if (!RESEND_API_KEY) {
    console.log("══════════════════════════════════════");
    console.log("📧 이메일 발송 (개발 모드 — 실제 발송 안 됨)");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${html.substring(0, 200)}...`);
    console.log("══════════════════════════════════════");
    return { success: true, dev: true, id: `dev-${Date.now()}` };
  }

  // 프로덕션 — Resend API 호출
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Resend API 에러:", error);
      return { success: false, error };
    }

    const data = await res.json();
    console.log(`📧 이메일 발송 완료: ${to} (ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error("이메일 발송 실패:", err);
    return { success: false, error: err.message };
  }
}
