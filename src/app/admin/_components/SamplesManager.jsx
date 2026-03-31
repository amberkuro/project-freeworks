"use client";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui";
import { STATUS_MAP, COURIER_NAME } from "@/lib/constants";
import { MOCK_SAMPLES } from "@/lib/mock-data";
import {
  getPromoStatus,
  getEventPromoStatus,
  calcPromoDeadline,
  shouldBlock,
} from "@/lib/promo";
import DeliveryBadge from "./DeliveryBadge";

/** 샘플 상태 전이 맵 */
const STATUS_TRANSITIONS = {
  submitted: ["reviewing", "cancelled"],
  reviewing: ["in_production", "cancelled"],
  in_production: ["shipping_needed", "revision_requested", "cancelled"],
  revision_requested: ["in_production"],
  shipping_needed: [],
  shipping_ready: ["shipped"],
  shipped: ["in_transit"],
  in_transit: ["delivered"],
  delivered: ["promo_pending"],
  promo_pending: ["completed"],
  completed: [],
  cancelled: [],
};

/* ─── 상세 뷰 ─── */
function SampleDetailView({
  detail,
  tracking,
  setTracking,
  trackLoading,
  trackResult,
  trackError,
  onBack,
  onShip,
  onTrack,
  onDeliveryConfirm,
  updateSample,
}) {
  const promo = getPromoStatus(detail);
  const evPromo = getEventPromoStatus(detail);
  const blocked = shouldBlock(detail);
  const nextStatuses = STATUS_TRANSITIONS[detail.status] || [];

  return (
    <div>
      <button
        onClick={onBack}
        className="text-[13px] text-gray-400 mb-6 bg-transparent border-none cursor-pointer flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round">
          <path d="M14 4L6 10L14 16" />
        </svg>
        목록으로
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-black">
              {detail.product_description}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{detail.sample_number}</p>
          </div>
          <StatusBadge status={detail.status} />
        </div>

        {/* 홍보 상태 */}
        <div className="p-4 rounded-lg bg-[#fafaf6] border border-[rgba(255,214,0,0.15)] mb-4">
          <div className="text-[11px] text-gray-400 font-semibold mb-2">홍보</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-white">
              <div className="text-[10px] text-gray-400">온라인</div>
              <div className="text-[12px] font-bold mt-0.5" style={{ color: promo.color }}>
                {promo.text}
              </div>
            </div>
            <div className="p-2 rounded bg-white">
              <div className="text-[10px] text-gray-400">행사</div>
              <div className="text-[12px] font-bold mt-0.5" style={{ color: evPromo.color }}>
                {evPromo.text}
                {detail.eventPromoSubmitted && " 🔴"}
              </div>
            </div>
          </div>
          {blocked && (
            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-red-50">
              <span className="text-[12px] font-bold text-[#c62828]">⚠ 차단됨</span>
              <button
                onClick={() => updateSample(detail.id, { adminUnlocked: true })}
                className="text-[11px] font-bold text-white bg-[#c62828] px-3 py-1 rounded-md border-none cursor-pointer"
              >
                해제
              </button>
            </div>
          )}
        </div>

        {/* 배송 정보 */}
        <div className="p-4 rounded-lg bg-[#f8f8f8] mb-4">
          <div className="text-[11px] text-gray-400 font-semibold mb-2">📦 배송 정보</div>
          {detail.shipping ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "수령인", v: detail.shipping.recipient },
                { l: "연락처", v: detail.shipping.phone },
                { l: "주소", v: `${detail.shipping.address} ${detail.shipping.address_detail || ""}` },
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-white">
                  <div className="text-[10px] text-gray-400">{item.l}</div>
                  <div className="text-[12px] font-semibold text-gray-700 mt-0.5">{item.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">미입력</p>
          )}
        </div>

        {/* 출고 처리 (shipping_ready 상태일 때) */}
        {detail.status === "shipping_ready" && (
          <div className="p-4 rounded-xl border-2 border-[#FFD600] bg-[rgba(255,214,0,0.03)] mb-4">
            <h3 className="text-[13px] font-bold mb-3">출고 처리</h3>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-gray-500">택배사</span>
                <span className="text-[13px] font-bold">{COURIER_NAME}</span>
              </div>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="우체국 운송장 번호"
                className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none bg-white focus:border-[#FFD600]"
              />
            </div>
            <button
              onClick={onShip}
              disabled={!tracking}
              className={`w-full py-2.5 text-[13px] font-bold rounded-lg border-none ${
                tracking
                  ? "text-black bg-[#FFD600] cursor-pointer"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
              }`}
            >
              출고 처리
            </button>
          </div>
        )}

        {/* 배송 추적 */}
        {detail.trackingNumber && (
          <div className="p-4 rounded-lg bg-[#f8f8f8] mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-gray-400 font-semibold">
                🚚 배송 추적
                {detail.deliveryConfirmedByAdmin && (
                  <span className="ml-1.5 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    관리자 확정
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DeliveryBadge status={detail.deliveryStatus} />
                {detail.deliveryStatus !== "delivered" && (
                  <button
                    onClick={() => onTrack(detail)}
                    disabled={trackLoading}
                    className={`text-[11px] font-bold px-3 py-1 rounded-md border-none cursor-pointer ${
                      trackLoading
                        ? "text-gray-400 bg-gray-100"
                        : "text-[#1565c0] bg-[#e3f2fd]"
                    }`}
                  >
                    {trackLoading ? "..." : "배송 조회"}
                  </button>
                )}
                {detail.deliveryStatus !== "delivered" && (
                  <button
                    onClick={onDeliveryConfirm}
                    className="text-[11px] font-bold px-3 py-1 rounded-md border-none cursor-pointer text-white bg-[#2e7d32]"
                  >
                    배송완료
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded bg-white">
                <div className="text-[10px] text-gray-400">택배사</div>
                <div className="text-[12px] font-semibold text-gray-700 mt-0.5">{COURIER_NAME}</div>
              </div>
              <div className="p-2 rounded bg-white">
                <div className="text-[10px] text-gray-400">운송장</div>
                <div className="text-[12px] font-semibold text-gray-700 mt-0.5">
                  {detail.trackingNumber}
                </div>
              </div>
            </div>

            {trackError && (
              <div className="p-2 rounded-lg bg-red-50 text-[12px] text-red-700 mb-2">
                {trackError}
              </div>
            )}

            {trackResult?.details && (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                {trackResult.details
                  .slice()
                  .reverse()
                  .map((d, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 text-[11px] flex gap-3 ${
                        i > 0 ? "border-t border-gray-50" : ""
                      }`}
                    >
                      <span className="text-gray-400 w-[110px] flex-shrink-0">{d.time}</span>
                      <span className="text-gray-700 font-medium">{d.location}</span>
                      <span className="text-gray-500">{d.detail}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 상태 전이 버튼 */}
        {nextStatuses.length > 0 && detail.status !== "shipping_ready" && (
          <div className="flex gap-2">
            {nextStatuses.map((n) => (
              <button
                key={n}
                onClick={() => updateSample(detail.id, { status: n })}
                className={`px-4 py-2 text-[12px] font-bold rounded-lg border-none cursor-pointer ${
                  n === "cancelled"
                    ? "text-red-700 bg-red-50"
                    : "text-black bg-[#FFD600]"
                }`}
              >
                {STATUS_MAP[n]?.label || n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function SamplesManager({ initialDetail }) {
  const [filter, setFilter] = useState("all");
  const [samples, setSamples] = useState(MOCK_SAMPLES);
  const [detail, setDetail] = useState(initialDetail || null);
  const [tracking, setTracking] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");

  const filtered = filter === "all" ? samples : samples.filter((s) => s.status === filter);

  /** 샘플 로컬 상태 업데이트 */
  const updateSample = (id, updates) => {
    setSamples((p) => p.map((x) => (x.id === id ? { ...x, ...updates } : x)));
    if (detail?.id === id) {
      setDetail((d) => ({ ...d, ...updates }));
    }
  };

  /** 출고 처리 */
  const handleShip = () => {
    if (!tracking) return alert("운송장 번호를 입력하세요.");
    const dl = calcPromoDeadline(new Date().toISOString());
    updateSample(detail.id, {
      courierName: COURIER_NAME,
      trackingNumber: tracking,
      shippedAt: new Date().toISOString(),
      status: "shipped",
      deliveryStatus: "shipped",
      promoDeadline: dl,
    });
    alert("출고 완료!");
  };

  /** 배송 추적 조회 */
  const handleTrack = async (s) => {
    const target = s || detail;
    if (!target?.trackingNumber || target.deliveryConfirmedByAdmin) return;

    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const res = await fetch(
        `/api/delivery?tracking=${encodeURIComponent(target.trackingNumber)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setTrackError(data.error);
        return;
      }

      setTrackResult(data);

      if (!target.deliveryConfirmedByAdmin) {
        updateSample(target.id, {
          deliveryStatus: data.status,
          status: data.status === "delivered" ? "delivered" : target.status,
          lastCheckedAt: new Date().toISOString(),
        });
      }
    } catch {
      setTrackError("네트워크 오류");
    } finally {
      setTrackLoading(false);
    }
  };

  /** 배송완료 수동 확정 */
  const handleDeliveryConfirm = () => {
    if (!confirm("배송완료 수동 처리?")) return;
    updateSample(detail.id, {
      deliveryStatus: "delivered",
      status: "delivered",
      deliveredAt: new Date().toISOString(),
      deliveryConfirmedByAdmin: true,
    });
    alert("배송완료 처리됨");
  };

  // 상세 진입 시 자동 배송 조회
  useEffect(() => {
    if (
      detail?.trackingNumber &&
      detail?.deliveryStatus !== "delivered" &&
      !detail?.deliveryConfirmedByAdmin
    ) {
      handleTrack(detail);
    }
  }, [detail?.id]);

  /* ─── 상세 뷰 ─── */
  if (detail) {
    return (
      <SampleDetailView
        detail={detail}
        tracking={tracking}
        setTracking={setTracking}
        trackLoading={trackLoading}
        trackResult={trackResult}
        trackError={trackError}
        onBack={() => {
          setDetail(null);
          setTrackResult(null);
        }}
        onShip={handleShip}
        onTrack={handleTrack}
        onDeliveryConfirm={handleDeliveryConfirm}
        updateSample={updateSample}
      />
    );
  }

  /* ─── 목록 뷰 ─── */
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black mb-6">샘플 관리</h1>

      {/* 필터 */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {[
          { value: "all", label: "전체" },
          ...Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label })),
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-full border-none cursor-pointer ${
              filter === f.value
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#fafafa]">
              {["샘플번호", "설명", "배송", "상태"].map((h) => (
                <th
                  key={h}
                  className="px-3.5 py-3 text-left font-semibold text-gray-400 border-b border-gray-100"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                onClick={() => {
                  setDetail(s);
                  setTracking(s.trackingNumber || "");
                  setTrackResult(null);
                  setTrackError("");
                }}
              >
                <td className="px-3.5 py-3 font-semibold text-gray-700 text-xs">
                  {s.sample_number}
                </td>
                <td className="px-3.5 py-3 text-gray-500 truncate max-w-[200px]">
                  {s.product_description}
                </td>
                <td className="px-3.5 py-3">
                  {s.deliveryStatus ? (
                    <DeliveryBadge status={s.deliveryStatus} />
                  ) : (
                    <span className="text-[10px] text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3.5 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
