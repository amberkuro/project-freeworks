"use client";
import { MOCK_MEMBERS } from "@/lib/mock-data";

export default function MembersManager() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black mb-6">회원 관리</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#fafafa]">
              {["작가명", "이메일", "상태", "사용", "가입일"].map((h) => (
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
            {MOCK_MEMBERS.map((m) => (
              <tr key={m.id} className="border-b border-gray-50">
                <td className="px-3.5 py-3 font-bold text-black">{m.artist_name}</td>
                <td className="px-3.5 py-3 text-gray-500">{m.email}</td>
                <td className="px-3.5 py-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      m.status === "active"
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {m.status === "active" ? "활성" : "정지"}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <span className="font-bold">{m.used_quota}</span>
                  <span className="text-gray-300"> / {m.monthly_quota}</span>
                </td>
                <td className="px-3.5 py-3 text-gray-400">{m.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
