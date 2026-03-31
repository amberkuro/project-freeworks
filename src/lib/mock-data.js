export const MOCK_USER = {
  artist_name: "하늘작가", email: "sky@artist.com", instagram: "@skyart_illust", twitter: "@skyart_x",
  monthly_quota: 4, used_quota: 1, is_first_login: true, isBlocked: false,
};

export const MOCK_SAMPLES = [
  { id: "s1", sample_number: "S-260301-001", product_category: "acrylic", product_description: "캐릭터 아크릴 스탠드 10cm", data_type: "artwork_only", status: "in_transit", created_at: "2026-03-01", member_last_read_at: "2026-03-02 11:00",
    shipping: { recipient: "김하늘", phone: "010-1234-5678", zipcode: "06100", address: "서울시 강남구 테헤란로 123", address_detail: "4층 프리웍스", request: "부재 시 경비실에 맡겨주세요" },
    courierName: "우체국택배", trackingNumber: "1234567890123", shippedAt: "2026-03-25T10:00:00Z", deliveryStatus: "in_transit", lastCheckedAt: "2026-03-26 09:00", deliveredAt: null, deliveryConfirmedByAdmin: false,
    promoDeadline: "2026-04-01T10:00:00Z", promoSubmitted: false, promoUrl: "", eventPromoSubmitted: false, isBlocked: false, adminUnlocked: false,
    messages: [
      { id: "m1", sender_role: "admin", content: "안녕하세요! 칼선 작업 진행합니다.", created_at: "2026-03-02 10:30" },
      { id: "m2", sender_role: "member", content: "감사합니다! 뒷면 단색 부탁드려요.", created_at: "2026-03-02 11:00" },
      { id: "m3", sender_role: "admin", content: "반영 완료했습니다.", created_at: "2026-03-03 14:20" },
      { id: "m4", sender_role: "admin", content: "제작 완료! 택배 발송 예정입니다.", created_at: "2026-03-05 09:00" },
    ],
  },
  { id: "s2", sample_number: "S-260315-002", product_category: "dtf_sticker", product_description: "일러스트 다이컷 스티커 세트", data_type: "complete_data", status: "shipping_ready", created_at: "2026-03-15", member_last_read_at: "2026-03-16 09:00",
    shipping: { recipient: "김하늘", phone: "010-1234-5678", zipcode: "06100", address: "서울시 강남구 테헤란로 123", address_detail: "4층", request: "" },
    courierName: "", trackingNumber: "", shippedAt: null, deliveryStatus: null, lastCheckedAt: null, deliveredAt: null, deliveryConfirmedByAdmin: false,
    promoDeadline: null, promoSubmitted: false, promoUrl: "", eventPromoSubmitted: false, isBlocked: false, adminUnlocked: false,
    messages: [
      { id: "m5", sender_role: "admin", content: "데이터 확인! 제작 들어갑니다.", created_at: "2026-03-16 09:00" },
      { id: "m6", sender_role: "admin", content: "제작 완료! 배송 정보 확인 후 출고합니다.", created_at: "2026-03-18 11:30" },
    ],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: "n1", template_id: "approval", title: "프리웍스 크리에이터로 승인되었습니다", is_read: true, created_at: "2026-02-01" },
  { id: "n2", template_id: "onboarding", title: "프리웍스 크리에이터 시작 가이드", is_read: false, created_at: "2026-02-01" },
];

export const MOCK_APPS = [
  { id: "a1", artist_name: "별빛화가", email: "star@art.com", instagram: "@starart", twitter: "@starart_x", product_category: "acrylic", product_description: "캐릭터 아크릴 스탠드", status: "pending", created_at: "2026-03-28", isVipCreator: false, adminMemo: "",
    portfolio_files: [{ name: "character_01.jpg", url: "https://picsum.photos/seed/star1/400/400", type: "image/jpeg" }, { name: "character_02.png", url: "https://picsum.photos/seed/star2/400/400", type: "image/png" }, { name: "portfolio.pdf", url: "#", type: "application/pdf" }] },
  { id: "a2", artist_name: "달빛작가", email: "moon@art.com", instagram: "@moonart", twitter: "", product_category: "dtf_sticker", product_description: "일러스트 스티커 세트", status: "pending", created_at: "2026-03-27", isVipCreator: true, adminMemo: "팔로워 12만, 협업 가치 높음",
    portfolio_files: [{ name: "sticker_design.jpg", url: "https://picsum.photos/seed/moon1/400/400", type: "image/jpeg" }] },
  { id: "a3", artist_name: "구름그림", email: "cloud@art.com", instagram: "@cloudart", twitter: "@cloud_draw", product_category: "acrylic", product_description: "미니 아크릴 키링", status: "approved", created_at: "2026-03-20", isVipCreator: false, adminMemo: "",
    portfolio_files: [{ name: "keyring_art.png", url: "https://picsum.photos/seed/cloud1/400/400", type: "image/png" }, { name: "keyring_art2.jpg", url: "https://picsum.photos/seed/cloud2/400/400", type: "image/jpeg" }] },
];

export const MOCK_MEMBERS = [
  { id: "u1", artist_name: "하늘작가", email: "sky@art.com", instagram: "@skyart", status: "active", monthly_quota: 4, used_quota: 1, total_samples: 3, created_at: "2026-02-01" },
  { id: "u2", artist_name: "구름그림", email: "cloud@art.com", instagram: "@cloudart", status: "active", monthly_quota: 4, used_quota: 3, total_samples: 7, created_at: "2026-03-20" },
];
