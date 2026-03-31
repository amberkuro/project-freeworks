"use client";
import { useState } from "react";
import VipBadge from "./VipBadge";

/**
 * 회원 관리
 * - applications 테이블에서 status === "approved" 인 데이터를 회원으로 표시
 * - 재초대: Auth 삭제 후 초대 메일 재발송
 * - 삭제: Auth 삭제 + applications.status → rejected
 */
export default function MembersManager({ apps, fetchApps }) {
  const members = (apps || []).filter((a) => a.status === "approved");
  const [loadingId, setLoadingId] = useState(null); // 로딩 중인 회원 id
  const [loadingAction, setLoadingAction] = useState(null); // "reinvite" | "delete"

  /** 재초대 */
  const handleReinvite = async (member) => {
    if (!confirm(`${member.artist_name}님에게 초대 메일을 다시 발송하시겠습니까?\n\n기존 비밀번호는 초기화되며, 새로 설정해야 합니다.`)) {
      return;
    }

    setLoadingId(member.id);
    setLoadingAction("reinvite");

    try {
      const res = await fetch("/api/admin/members/reinvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: member.email,
          artist_name: member.artist_name,
          application_id: member.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`재초대 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }

      alert(`${member.artist_name}님에게 초대 메일을 다시 발송했습니다.`);
    } catch (err) {
      alert(`재초대 실패: ${err.message || "네트워크 오류"}`);
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  /** 삭제 */
  const handleDelete = async (member) => {
    if (!confirm(`${member.artist_name}님을 정말 삭제하시겠습니까?\n\n• Supabase 로그인 계정이 삭제됩니다\n• 신청 상태가 "거절"로 변경됩니다\n• 이 작업은 되돌릴 수 없습니다`)) {
      return;
    }

    setLoadingId(member.id);
    setLoadingAction("delete");

    try {
      const res = await fetch("/api/admin/members/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: member.email,
          application_id: member.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`삭제 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }

      alert(`${member.artist_name}님이 삭제되었습니다.`);

      // 목록 새로고침
      if (fetchApps) fetchApps();
    } catch (err) {
      alert(`삭제 실패: ${err.message || "네트워크 오류"}`);
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  const isLoading = (id, action) =>
    loadingId === id && loadingAction === action;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-black">회원 관리</h1>
        <span className="text-[13px] text-gray-400">
          승인된 크리에이터 {members.length}명
        </span>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-300">승인된 크리에이터가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#fafafa]">
                {["작가명", "이메일", "희망 제품", "상태", "승인일", "관리"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3.5 py-3 text-left font-semibold text-gray-400 border-b border-gray-100"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="px-3.5 py-3 font-bold text-black">
                    <span className="flex items-center gap-1.5">
                      {m.artist_name}
                      {m.isVipCreator && <VipBadge />}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-gray-500">{m.email}</td>
                  <td className="px-3.5 py-3 text-gray-500">
                    {m.product_category === "acrylic" ? "아크릴" : "DTF"}
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-green-700 bg-green-50">
                      활성
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-gray-400">{m.created_at}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleReinvite(m)}
                        disabled={loadingId === m.id}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border-none cursor-pointer ${
                          isLoading(m.id, "reinvite")
                            ? "text-gray-400 bg-gray-100"
                            : "text-[#1565c0] bg-[#e3f2fd] hover:bg-[#bbdefb]"
                        }`}
                      >
                        {isLoading(m.id, "reinvite") ? "..." : "재초대"}
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        disabled={loadingId === m.id}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border-none cursor-pointer ${
                          isLoading(m.id, "delete")
                            ? "text-gray-400 bg-gray-100"
                            : "text-red-700 bg-red-50 hover:bg-red-100"
                        }`}
                      >
                        {isLoading(m.id, "delete") ? "..." : "삭제"}
                      </button>
                    </div>
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
