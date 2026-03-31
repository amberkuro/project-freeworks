"use client";
import VipBadge from "./VipBadge";

/**
 * 회원 관리
 * - applications 테이블에서 status === "approved" 인 데이터를 회원으로 표시
 * - 향후 별도 users 테이블 연동 시 이 컴포넌트만 교체하면 됨
 */
export default function MembersManager({ apps }) {
  const members = (apps || []).filter((a) => a.status === "approved");

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
                {["작가명", "이메일", "희망 제품", "상태", "승인일"].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
