/**
 * 우체국 배송조회 유틸리티
 *
 * 우체국 종적 조회 API (공공데이터포털)
 * https://apis.data.go.kr/1900000/jungCkTraceService/retrieveLetter
 *
 * 환경변수: POST_SERVICE_KEY (공공데이터포털 인증키, URL 인코딩 된 키)
 * 없으면 개발 모드 (더미 데이터 반환)
 */

/**
 * 우체국 trackState → 내부 상태 매핑
 *
 * 우체국 종적 상태 예시:
 * - 접수 → shipped
 * - 발송 → in_transit
 * - 도착 → in_transit
 * - 배달준비 → in_transit
 * - 배달완료 → delivered
 */
function mapTrackState(detail) {
  const state = (detail || "").trim();
  if (state.includes("배달완료") || state.includes("수령")) return "delivered";
  if (state.includes("발송") || state.includes("도착") || state.includes("배달준비") || state.includes("이동")) return "in_transit";
  return "shipped"; // 접수, 기타
}

/**
 * 우체국 배송 조회 (서버용)
 * @param {string} trackingNumber - 운송장 번호 (등기번호)
 */
export async function trackDelivery(trackingNumber) {
  const serviceKey = process.env.POST_SERVICE_KEY;

  if (!serviceKey) {
    console.log(`[우체국 배송조회 개발모드] 운송장: ${trackingNumber}`);
    return {
      success: true,
      dev: true,
      courier: "우체국택배",
      trackingNumber,
      status: "in_transit",
      statusText: "배송 중",
      lastDetail: "서울강남우체국 도착",
      lastTime: new Date().toISOString(),
      details: [
        { time: "2026-03-28 09:00", status: "접수", location: "서울중앙우체국", detail: "등기 접수" },
        { time: "2026-03-28 14:30", status: "발송", location: "서울중앙우체국", detail: "발송" },
        { time: "2026-03-29 06:00", status: "도착", location: "경기광주우체국", detail: "경유" },
        { time: "2026-03-29 08:00", status: "도착", location: "서울강남우체국", detail: "도착" },
      ],
    };
  }

  try {
    const url = `https://apis.data.go.kr/1900000/jungCkTraceService/retrieveLetter?ServiceKey=${serviceKey}&rgist=${trackingNumber}&typeCode=json`;

    console.log(`[우체국 API 호출] 운송장: ${trackingNumber}`);

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("[우체국 API 에러]", res.status, res.statusText);
      return { success: false, error: `우체국 API 오류 (${res.status})` };
    }

    const data = await res.json();

    // 응답 구조 확인
    const items = data?.response?.body?.items?.item;

    if (!items || (Array.isArray(items) && items.length === 0)) {
      return { success: false, error: "운송장 정보를 찾을 수 없습니다. 번호를 확인해 주세요." };
    }

    const itemList = Array.isArray(items) ? items : [items];

    // 종적 데이터 파싱
    const details = itemList.map((item) => ({
      time: item.dlvyDate || item.prcsDt || "",
      status: item.detailDc || item.trackState || "",
      location: item.nowLc || item.prcsPo || "",
      detail: item.detailDc || "",
    }));

    const lastItem = details[details.length - 1];
    const lastStatus = mapTrackState(lastItem?.status || lastItem?.detail);

    const statusTextMap = {
      shipped: "출고 완료",
      in_transit: "배송 중",
      delivered: "배송 완료",
    };

    return {
      success: true,
      courier: "우체국택배",
      trackingNumber,
      status: lastStatus,
      statusText: statusTextMap[lastStatus] || "확인 중",
      lastDetail: lastItem?.detail || "",
      lastTime: lastItem?.time || "",
      details,
    };
  } catch (err) {
    console.error("[우체국 배송조회 에러]", err);
    return { success: false, error: "배송조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
