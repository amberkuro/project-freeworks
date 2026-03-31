"use client";
import { useAuth } from "./_hooks/useAuth";
import { AdminNavProvider, useAdminNav } from "./_hooks/AdminContext";
import Sidebar from "./_components/Sidebar";

/**
 * 내부 쉘: AdminNavProvider 안에서 useAdminNav 사용 가능
 */
function AdminShell({ user, logout, children }) {
  const { view, nav } = useAdminNav();

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex">
      <Sidebar current={view} onNavigate={nav} user={user} onLogout={logout} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

/**
 * Admin 레이아웃
 * - 인증 체크 (admin role 필수)
 * - Sidebar + 콘텐츠 영역 공통 구조
 * - 네비게이션 컨텍스트 제공
 */
export default function AdminLayout({ children }) {
  const { user, checking, logout } = useAuth();

  // 인증 확인 중 로딩
  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="w-10 h-10 bg-[#FFD600] rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="font-extrabold text-base text-black">F</span>
        </div>
      </div>
    );
  }

  // 비인증 → useAuth 내부에서 /login 리다이렉트 처리됨
  if (!user) return null;

  return (
    <AdminNavProvider>
      <AdminShell user={user} logout={logout}>
        {children}
      </AdminShell>
    </AdminNavProvider>
  );
}
