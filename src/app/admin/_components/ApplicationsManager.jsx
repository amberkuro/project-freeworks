"use client";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui";
import VipBadge from "./VipBadge";
import PortfolioViewer from "./PortfolioViewer";

/** 모달 설정 */
const MODAL_CONFIG = {
  rejected: {
    title: "거절",
    ph: "거절 사유",
    btn: "거절 처리",
    cls: "text-red-700 bg-red-50 border border-red-200",
  },
  on_hold: {
    title: "보류",
    ph: "보완 요청",
    btn: "보류 처리",
    cls: "text-orange-700 bg-orange-50 border border-orange-200",
  },
};

/* ─── 상세 뷰 ─── */
function DetailView({ detail, loading, updateLocal, updateRemote, onBack, onAction }) {
  const toggleVip = () => {
    updateRemote(detail.id, { isVipCreator: !detail.isVipCreator });
  };

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
            <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
              {detail.artist_name}
              {detail.isVipCreator && <VipBadge />}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{detail.email}</p>
          </div>
          <StatusBadge status={detail.status} type="app" />
        </div>

        {/* 관리자 전용 */}
        <div className="p-4 rounded-xl bg-[#fafaf6] border border-[rgba(255,214,0,0.15)] mb-5">
          <div className="text-[11px] text-gray-400 font-semibold mb-3">관리자 전용</div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-gray-700">VIP 작가</span>
            <button
              onClick={toggleVip}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${
                detail.isVipCreator ? "bg-[#FFD600]" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  detail.isVipCreator ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">
            내부 메모
          </label>
          <textarea
            value={detail.adminMemo || ""}
            onChange={(e) => updateLocal(detail.id, { adminMemo: e.target.value })}
            onBlur={(e) => updateRemote(detail.id, { adminMemo: e.target.value })}
            placeholder="내부 메모"
            rows={2}
            className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none resize-y bg-white focus:border-[#FFD600]"
          />
        </div>

        {/* 정보 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { l: "인스타그램", v: detail.instagram || "-" },
            { l: "X(트위터)", v: detail.twitter || "-" },
            { l: "희망 제품", v: detail.product_category === "acrylic" ? "아크릴" : "DTF" },
            { l: "신청일", v: detail.created_at },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#f8f8f8]">
              <div className="text-[11px] text-gray-400 font-semibold mb-1">{item.l}</div>
              <div className="text-[13px] font-semibold text-gray-700">{item.v}</div>
            </div>
          ))}
        </div>

        {/* 제품 설명 */}
        {detail.product_description && (
          <div className="p-4 rounded-lg bg-[#f8f8f8] mb-5">
            <div className="text-[11px] text-gray-400 font-semibold mb-1">제품 설명</div>
            <div className="text-[13px] text-gray-600">{detail.product_description}</div>
          </div>
        )}

        {/* 포트폴리오 */}
        <div className="p-4 rounded-lg bg-[#f8f8f8]">
          <div className="text-[11px] text-gray-400 font-semibold mb-3 flex items-center justify-between">
            <span>포트폴리오</span>
            {detail.portfolio_files?.length > 0 && (
              <span className="text-[#FFD600]">{detail.portfolio_files.length}개</span>
            )}
          </div>
          <PortfolioViewer files={detail.portfolio_files} />
        </div>
      </div>

      {/* 액션 버튼 */}
      {(detail.status === "pending" || detail.status === "on_hold") && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction(detail, "approved")}
            disabled={loading === detail.id}
            className={`px-5 py-2.5 text-sm font-bold text-black bg-[#FFD600] rounded-lg border-none cursor-pointer ${
              loading === detail.id ? "opacity-60" : ""
            }`}
          >
            {loading === detail.id ? "..." : "승인"}
          </button>
          <button
            onClick={() => onAction(detail, "on_hold")}
            className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 rounded-lg border-none cursor-pointer"
          >
            보류
          </button>
          <button
            onClick={() => onAction(detail, "rejected")}
            className="px-5 py-2.5 text-sm font-semibold text-red-700 bg-red-50 rounded-lg border-none cursor-pointer"
          >
            거절
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function ApplicationsManager({ apps, updateLocal, updateRemote, initialDetail, fetchApps }) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(null);
  const [modal, setModal] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [detail, setDetail] = useState(initialDetail || null);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  // apps 변경 시 detail 동기화
  useEffect(() => {
    if (detail) {
      const found = apps.find((a) => a.id === detail.id);
      if (found) setDetail(found);
    }
  }, [apps]);

  const handleAction = async (app, action) => {
    if (action === "approved") {
      if (!confirm("승인 처리하시겠습니까?")) return;
      await processAction(app, action, "");
    } else {
      setModal({ app, action });
      setAdminNote("");
    }
  };

  const processAction = async (app, action, note) => {
    setLoading(app.id);
    try {
      const ep = { approved: "approve", rejected: "reject", on_hold: "hold" }[action];
      const res = await fetch(`/api/admin/applications/${app.id}/${ep}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_name: app.artist_name,
          email: app.email,
          admin_note: note,
        }),
      });

      // 승인 시: 초대 메일 발송 결과 확인 (실패하면 상태 변경 안 함)
      if (action === "approved") {
        const result = await res.json();
        if (!res.ok) {
          alert(`승인 실패: ${result.error || "알 수 없는 오류"}\n\n${result.detail || ""}`);
          setLoading(null);
          return;
        }
        await updateRemote(app.id, { status: action });
        alert(
          result.alreadyInvited
            ? `${app.artist_name}님은 이미 초대된 상태입니다.\n상태를 승인으로 변경했습니다.`
            : `승인 및 초대 메일 발송 완료!\n${app.email}로 초대 메일이 전송되었습니다.`
        );
      } else {
        // 거절/보류: 기존 방식 (이메일 실패해도 상태 변경)
        await updateRemote(app.id, { status: action });
        alert({ rejected: "거절 완료", on_hold: "보류 완료" }[action]);
      }
    } catch (err) {
      alert(`처리 실패: ${err.message || "네트워크 오류"}`);
    } finally {
      setLoading(null);
      setModal(null);
    }
  };

  /* ─── 상세 뷰 ─── */
  if (detail) {
    return (
      <DetailView
        detail={detail}
        loading={loading}
        updateLocal={updateLocal}
        updateRemote={updateRemote}
        onBack={() => setDetail(null)}
        onAction={handleAction}
      />
    );
  }

  /* ─── 목록 뷰 ─── */
  return (
    <div>
      {/* 거절/보류 모달 */}
      {modal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-[17px] font-extrabold">
                {MODAL_CONFIG[modal.action].title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{modal.app.artist_name}</p>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={MODAL_CONFIG[modal.action].ph}
                rows={4}
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none resize-y focus:border-[#FFD600]"
              />
            </div>
            <div className="px-6 pb-5 flex gap-2.5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl border-none cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => processAction(modal.app, modal.action, adminNote)}
                disabled={loading === modal.app.id}
                className={`flex-1 py-3 text-sm font-bold rounded-xl border-none cursor-pointer ${
                  MODAL_CONFIG[modal.action].cls
                } ${loading === modal.app.id ? "opacity-60" : ""}`}
              >
                {loading === modal.app.id ? "..." : MODAL_CONFIG[modal.action].btn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-extrabold text-black">크리에이터 신청 관리</h1>
        <button
          onClick={fetchApps}
          className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-gray-200"
        >
          새로고침
        </button>
      </div>
      <p className="text-[13px] text-gray-400 mb-6">
        Supabase applications 테이블 실시간 조회
      </p>

      {/* 필터 */}
      <div className="flex gap-2 mb-5">
        {["all", "pending", "on_hold", "approved", "rejected"].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border-none cursor-pointer ${
              filter === v ? "bg-black text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {
              {
                all: `전체 (${apps.length})`,
                pending: `대기 (${apps.filter((a) => a.status === "pending").length})`,
                on_hold: "보류",
                approved: "승인",
                rejected: "거절",
              }[v]
            }
          </button>
        ))}
      </div>

      {/* 테이블 */}
      {apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-300">신청 내역이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#fafafa]">
                {["작가명", "이메일", "포트폴리오", "신청일", "상태", "액션"].map((h) => (
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
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => setDetail(a)}
                >
                  <td className="px-3.5 py-3">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      {a.artist_name}
                      {a.isVipCreator && <VipBadge />}
                    </span>
                    {a.adminMemo && (
                      <span className="block text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                        {a.adminMemo}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-gray-500">{a.email}</td>
                  <td className="px-3.5 py-3">
                    <span className="text-[11px] font-semibold text-[#a67c00] bg-[rgba(255,214,0,0.12)] px-2 py-0.5 rounded-full">
                      {a.portfolio_files?.length || 0}개
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-gray-400">{a.created_at}</td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={a.status} type="app" />
                  </td>
                  <td className="px-3.5 py-3" onClick={(e) => e.stopPropagation()}>
                    {a.status === "pending" || a.status === "on_hold" ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAction(a, "approved")}
                          disabled={loading === a.id}
                          className={`px-3 py-1 text-[11px] font-bold text-black bg-[#FFD600] rounded-md border-none cursor-pointer ${
                            loading === a.id ? "opacity-60" : ""
                          }`}
                        >
                          {loading === a.id ? "..." : "승인"}
                        </button>
                        <button
                          onClick={() => handleAction(a, "on_hold")}
                          className="px-3 py-1 text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-md border-none cursor-pointer"
                        >
                          보류
                        </button>
                        <button
                          onClick={() => handleAction(a, "rejected")}
                          className="px-3 py-1 text-[11px] font-semibold text-red-700 bg-red-50 rounded-md border-none cursor-pointer"
                        >
                          거절
                        </button>
                      </div>
                    ) : a.status === "approved" ? (
                      <span className="text-[11px] text-green-700">✓</span>
                    ) : a.status === "rejected" ? (
                      <span className="text-[11px] text-red-400">거절</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
