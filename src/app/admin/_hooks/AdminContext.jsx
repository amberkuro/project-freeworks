"use client";
import { createContext, useContext, useState } from "react";

/**
 * Admin 네비게이션 컨텍스트
 * - layout.jsx (Sidebar)와 page.jsx (콘텐츠 영역) 간 상태 공유
 * - view: 현재 활성 뷰 (dashboard | applications | samples | members)
 * - pa/ps: Dashboard에서 클릭 시 상세로 바로 이동하기 위한 초기값
 */
const AdminNavContext = createContext(null);

export function AdminNavProvider({ children }) {
  const [view, setView] = useState("dashboard");
  const [pa, setPa] = useState(null); // 선택된 신청 상세
  const [ps, setPs] = useState(null); // 선택된 샘플 상세

  const nav = (v) => {
    setView(v);
    setPa(null);
    setPs(null);
  };

  return (
    <AdminNavContext.Provider value={{ view, setView, nav, pa, setPa, ps, setPs }}>
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);
  if (!ctx) {
    throw new Error("useAdminNav must be used within AdminNavProvider");
  }
  return ctx;
}
