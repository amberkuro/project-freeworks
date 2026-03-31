"use client";
import { StatusBadge } from "@/components/ui";
import { MOCK_SAMPLES } from "@/lib/mock-data";
import VipBadge from "./VipBadge";

export default function Dashboard({ apps, onNavigate, onSelectApp, onSelectSample }) {
  const pending = apps.filter((a) => a.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black mb-6">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-3.5 mb-9">
        {[
          { label: "신규 크리에이터", value: pending, accent: true },
          { label: "전체 신청", value: apps.length },
          { label: "승인됨", value: apps.filter((a) => a.status === "approved").length },
          { label: "샘플 진행", value: MOCK_SAMPLES.length },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-gray-100">
            <div className="text-[11px] text-gray-400 font-semibold mb-1.5">
              {s.label}
            </div>
            <div
              className={`text-[28px] font-black ${
                s.accent ? "text-[#FFD600]" : "text-black"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* 최근 목록 */}
      <div className="grid grid-cols-2 gap-5">
        {/* 최근 크리에이터 신청 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">최근 크리에이터 신청</h2>
            <button
              onClick={() => onNavigate("applications")}
              className="text-[11px] text-gray-400 bg-transparent border-none cursor-pointer hover:text-black"
            >
              전체 보기 →
            </button>
          </div>

          {apps.length === 0 ? (
            <p className="text-[13px] text-gray-300 p-4">신청 내역 없음</p>
          ) : (
            apps.slice(0, 5).map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  onNavigate("applications");
                  setTimeout(() => onSelectApp?.(a), 50);
                }}
                className="px-4 py-3 rounded-lg border border-gray-100 mb-2 bg-white flex justify-between items-center cursor-pointer hover:border-[#FFD600] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{a.artist_name}</span>
                  {a.isVipCreator && <VipBadge />}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} type="app" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <path d="M7 4L13 10L7 16" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 최근 샘플 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">최근 샘플</h2>
            <button
              onClick={() => onNavigate("samples")}
              className="text-[11px] text-gray-400 bg-transparent border-none cursor-pointer hover:text-black"
            >
              전체 보기 →
            </button>
          </div>

          {MOCK_SAMPLES.slice(0, 3).map((s) => (
            <div
              key={s.id}
              onClick={() => {
                onNavigate("samples");
                setTimeout(() => onSelectSample?.(s), 50);
              }}
              className="px-4 py-3 rounded-lg border border-gray-100 mb-2 bg-white flex justify-between items-center cursor-pointer hover:border-[#FFD600] hover:shadow-sm transition-all group"
            >
              <div>
                <span className="text-[13px] font-bold">
                  {s.product_description}
                </span>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
