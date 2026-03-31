export const INQUIRY_URL = "http://pf.kakao.com/_qxgXyG/chat";

export const STATUS_MAP = {
  submitted: { label: "신청 완료", color: "#888", bg: "#f0f0f0" },
  reviewing: { label: "검토 중", color: "#1a73e8", bg: "#e8f0fe" },
  in_production: { label: "제작 진행", color: "#a67c00", bg: "#fff8e1" },
  revision_requested: { label: "수정 요청", color: "#e65100", bg: "#fff3e0" },
  file_reupload_requested: { label: "파일 재업로드 요청", color: "#e65100", bg: "#fff3e0" },
  shipping_needed: { label: "배송 정보 필요", color: "#0277bd", bg: "#e1f5fe" },
  shipping_ready: { label: "배송 정보 완료", color: "#00695c", bg: "#e0f2f1" },
  shipped: { label: "출고 완료", color: "#546e7a", bg: "#eceff1" },
  in_transit: { label: "배송 중", color: "#1565c0", bg: "#e3f2fd" },
  delivered: { label: "배송 완료", color: "#2e7d32", bg: "#e8f5e9" },
  promo_pending: { label: "홍보 대기", color: "#7b1fa2", bg: "#f3e5f5" },
  completed: { label: "샘플 완료", color: "#2e7d32", bg: "#e8f5e9" },
  cancelled: { label: "취소", color: "#c62828", bg: "#ffebee" },
};

export const DELIVERY_STATUS_MAP = {
  shipped: { label: "출고 완료", color: "#546e7a", bg: "#eceff1" },
  delivered_to_courier: { label: "인수 완료", color: "#546e7a", bg: "#eceff1" },
  in_transit: { label: "배송 중", color: "#1565c0", bg: "#e3f2fd" },
  delivered: { label: "배송 완료", color: "#2e7d32", bg: "#e8f5e9" },
};

export const APP_STATUS = {
  pending: { label: "검토 대기", color: "#888", bg: "#f0f0f0" },
  approved: { label: "승인", color: "#2e7d32", bg: "#e8f5e9" },
  rejected: { label: "거절", color: "#c62828", bg: "#ffebee" },
  on_hold: { label: "보류", color: "#e65100", bg: "#fff3e0" },
};

export const PRODUCT_OPTIONS = [
  { value: "acrylic", label: "아크릴 관련 굿즈", desc: "아크릴 스탠드, 키링 등" },
  { value: "dtf_sticker", label: "DTF 스티커", desc: "커스텀 스티커, 다이컷 등" },
];

export const AGREEMENTS = [
  { key: "review", label: "검수 후 승인 여부가 결정되는 점에 동의합니다." },
  { key: "policy", label: "프리웍스 크리에이터 프로젝트 운영 기준에 동의합니다." },
  { key: "upload", label: "샘플 수령 후 후기 업로드 조건에 동의합니다." },
  { key: "privacy", label: "개인정보 수집 및 이용에 동의합니다." },
];

export const UPLOAD_CONFIG = {
  maxFiles: 5,
  maxSizeBytes: 50 * 1024 * 1024,
  maxSizeMB: 50,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".ai", ".psd", ".eps", ".svg", ".zip"],
  allowedMimeTypes: [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "application/pdf", "application/postscript", "image/vnd.adobe.photoshop",
    "application/eps", "application/x-eps",
    "application/zip", "application/x-zip-compressed", "application/x-zip",
  ],
  previewableTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  helpText: "JPG, JPEG, PNG, GIF, PDF, AI, PSD, EPS, SVG, ZIP / 최대 5개 / 파일당 50MB 이하",
};

// 우체국택배 전용
export const COURIER_NAME = "우체국택배";
