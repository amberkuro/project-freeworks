/**
 * 홍보 상태 관리 유틸리티
 *
 * 온라인 홍보 (필수): SNS/온라인 채널에 홍보 URL 1개 이상, 출고 후 7일 이내
 * 행사장 홍보 (선택): QR 아크릴 배치 후 사진 업로드, 완료 시 제작 할인 혜택
 */

/**
 * 홍보 마감일 계산 (출고일 + 7일)
 */
export function calcPromoDeadline(shippedAt) {
  if (!shippedAt) return null;
  const d = new Date(shippedAt);
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

/**
 * D-day 계산
 * 양수: 남은 일수, 0: 오늘, 음수: 초과
 */
export function calcDday(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diff = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * D-day 표시 텍스트
 */
export function formatDday(deadline) {
  const d = calcDday(deadline);
  if (d === null) return "";
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-Day";
  return `D+${Math.abs(d)} (초과)`;
}

/**
 * 자동 차단 판정
 * - 출고 후 7일 경과 && 온라인 홍보 미완료 → 차단
 */
export function shouldBlock(sample) {
  if (!sample.shippedAt) return false;
  if (sample.promoSubmitted) return false;
  if (sample.adminUnlocked) return false;
  const deadline = calcPromoDeadline(sample.shippedAt);
  const dday = calcDday(deadline);
  return dday !== null && dday < 0;
}

/**
 * 홍보 상태 텍스트
 */
export function getPromoStatus(sample) {
  if (sample.promoSubmitted) return { text: "완료", color: "#2e7d32", bg: "#e8f5e9" };
  if (!sample.shippedAt) return { text: "출고 전", color: "#888", bg: "#f0f0f0" };
  const deadline = calcPromoDeadline(sample.shippedAt);
  const dday = calcDday(deadline);
  if (dday === null) return { text: "—", color: "#888", bg: "#f0f0f0" };
  if (dday < 0) return { text: "기한 초과", color: "#c62828", bg: "#ffebee" };
  if (dday <= 2) return { text: `${formatDday(deadline)} 임박`, color: "#e65100", bg: "#fff3e0" };
  return { text: formatDday(deadline), color: "#0277bd", bg: "#e1f5fe" };
}

/**
 * 행사 홍보 상태
 */
export function getEventPromoStatus(sample) {
  if (sample.eventPromoSubmitted) return { text: "완료", color: "#2e7d32", bg: "#e8f5e9" };
  return { text: "미완료", color: "#888", bg: "#f0f0f0" };
}
