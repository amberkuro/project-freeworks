"use client";

const MENU_ITEMS = [
  { key: "dashboard", label: "대시보드" },
  { key: "applications", label: "크리에이터 신청" },
  { key: "samples", label: "샘플 관리" },
  { key: "members", label: "회원 관리" },
];

export default function Sidebar({ current, onNavigate, user, onLogout }) {
  return (
    <aside className="w-[220px] bg-black p-5 flex flex-col gap-1 sticky top-0 h-screen overflow-y-auto flex-shrink-0">
      {/* 로고 */}
      <div className="flex items-center gap-2 px-3 mb-5">
        <div className="w-6 h-6 bg-[#FFD600] rounded flex items-center justify-center">
          <span className="font-extrabold text-xs text-black">F</span>
        </div>
        <span className="font-bold text-[13px] text-white">ADMIN</span>
      </div>

      {/* 메뉴 */}
      {MENU_ITEMS.map((it) => (
        <button
          key={it.key}
          onClick={() => onNavigate(it.key)}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] text-left transition-all border-none cursor-pointer ${
            current === it.key
              ? "bg-[rgba(255,214,0,0.15)] text-[#FFD600] font-semibold"
              : "bg-transparent text-white/45 font-medium"
          }`}
        >
          {it.label}
        </button>
      ))}

      {/* 하단 유저 정보 + 로그아웃 */}
      <div className="mt-auto pt-4 border-t border-white/10">
        {user && (
          <div className="px-3 mb-3">
            <p className="text-[11px] text-white/30">로그인</p>
            <p className="text-[12px] text-white/60 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 rounded-lg text-[12px] text-red-400/70 bg-transparent border-none cursor-pointer hover:bg-white/5 text-left"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
