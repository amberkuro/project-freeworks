/**
 * 프리웍스 크리에이터 프로젝트 — 이메일 템플릿
 *
 * 변수: {artist_name}, {login_url}, {admin_note}
 */

const baseStyle = `
  body { margin: 0; padding: 0; background: #f5f5f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .container { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #ffffff; border-radius: 16px; overflow: hidden; }
  .header { background: #000000; padding: 28px 32px; }
  .logo { display: inline-flex; align-items: center; gap: 8px; }
  .logo-icon { width: 28px; height: 28px; background: #FFD600; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #000; }
  .logo-text { font-weight: 700; font-size: 14px; color: #ffffff; }
  .body { padding: 32px; }
  .title { font-size: 20px; font-weight: 800; color: #000000; margin: 0 0 16px 0; line-height: 1.4; }
  .text { font-size: 14px; color: #555555; line-height: 1.8; margin: 0 0 12px 0; }
  .text-muted { font-size: 13px; color: #999999; line-height: 1.7; }
  .btn { display: inline-block; padding: 14px 32px; background: #FFD600; color: #000000; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; margin-top: 20px; }
  .btn-outline { display: inline-block; padding: 12px 28px; background: #f0f0f0; color: #555555; font-weight: 600; font-size: 13px; text-decoration: none; border-radius: 8px; margin-top: 12px; }
  .divider { height: 1px; background: #eee; margin: 24px 0; }
  .footer { padding: 24px 32px; background: #fafafa; border-top: 1px solid #eee; }
  .footer-text { font-size: 11px; color: #bbb; line-height: 1.6; }
  .highlight-box { background: #f8f8f6; border: 1px solid #eee; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
  .note-box { background: #fff8e1; border: 1px solid rgba(255,214,0,0.2); border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
`;

function wrapHtml(content) {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">F</div>
        <span class="logo-text">FREEWORKS</span>
      </div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">본 메일은 프리웍스 크리에이터 프로젝트에서 자동 발송된 메일입니다.<br/>문의사항은 프리웍스 채널 채팅으로 연락해 주세요.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── 승인 메일 ───
export function approvalEmail({ artist_name, login_url }) {
  const subject = "프리웍스 크리에이터로 승인되었습니다 🎉";

  const html = wrapHtml(`
    <h1 class="title">${artist_name}님,<br/>크리에이터로 승인되었습니다!</h1>
    <p class="text">
      프리웍스 크리에이터 프로젝트에 승인되신 것을 축하합니다.<br/>
      지금부터 매월 4회 무료 샘플 제작 혜택을 이용하실 수 있습니다.
    </p>
    <div class="highlight-box">
      <p class="text" style="margin:0;">
        <strong>이용 안내</strong><br/>
        • 매월 4회 무료 샘플 제작<br/>
        • 전담 디자이너의 작업 지원<br/>
        • 참여 크리에이터 대상 제작 할인 혜택
      </p>
    </div>
    <p class="text">
      아래 버튼을 클릭하여 비밀번호를 설정하신 후<br/>
      바로 샘플 신청을 시작해 보세요.
    </p>
    <a href="${login_url}" class="btn">비밀번호 설정하고 시작하기</a>
    <div class="divider"></div>
    <p class="text-muted">
      로그인 후 마이페이지에서 샘플 신청, 진행 상황 확인,<br/>
      작업 커뮤니케이션 등을 이용하실 수 있습니다.
    </p>
  `);

  return { subject, html };
}

// ─── 거절 메일 ───
export function rejectionEmail({ artist_name, admin_note }) {
  const subject = "프리웍스 크리에이터 프로젝트 신청 결과 안내";

  const noteSection = admin_note
    ? `<div class="note-box"><p class="text" style="margin:0;"><strong>관리자 안내</strong><br/>${admin_note}</p></div>`
    : "";

  const html = wrapHtml(`
    <h1 class="title">신청 결과 안내</h1>
    <p class="text">
      ${artist_name}님, 안녕하세요.<br/>
      프리웍스 크리에이터 프로젝트에 관심을 가져주셔서 감사합니다.
    </p>
    <p class="text">
      보내주신 포트폴리오를 신중하게 검토하였으나,
      현재 프로젝트 운영 기준에 따라 이번 시즌에는
      함께하기 어렵게 되었습니다.
    </p>
    ${noteSection}
    <p class="text">
      이는 작가님의 작업 퀄리티에 대한 평가가 아니며,
      프로젝트 특성과 현재 운영 방향에 따른 결정입니다.
    </p>
    <div class="divider"></div>
    <p class="text">
      향후 새로운 시즌이 열릴 때 다시 신청해 주시면 감사하겠습니다.
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://freeworks-creator.vercel.app"}/apply" class="btn-outline">다시 신청하기</a>
  `);

  return { subject, html };
}

// ─── 보류 메일 ───
export function onHoldEmail({ artist_name, admin_note }) {
  const subject = "프리웍스 크리에이터 프로젝트 — 추가 자료 요청";

  const html = wrapHtml(`
    <h1 class="title">추가 자료 요청 안내</h1>
    <p class="text">
      ${artist_name}님, 안녕하세요.<br/>
      프리웍스 크리에이터 프로젝트에 관심을 가져주셔서 감사합니다.
    </p>
    <p class="text">
      보내주신 포트폴리오를 검토한 결과,
      추가 자료가 필요하여 안내드립니다.
    </p>
    ${admin_note ? `<div class="note-box"><p class="text" style="margin:0;"><strong>요청 사항</strong><br/>${admin_note}</p></div>` : ""}
    <p class="text">
      아래 내용을 보완하여 다시 신청해 주시면
      재검토 후 결과를 안내드리겠습니다.
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://freeworks-creator.vercel.app"}/apply" class="btn">보완하여 재신청하기</a>
  `);

  return { subject, html };
}
