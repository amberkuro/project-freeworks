"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "대시보드", icon: "📊" },
    { href: "/admin/applications", label: "신청 관리", icon: "📋" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* 사이드바 */}
      <aside
        style={{
          width: 220,
          background: "#111",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#FFD600",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 13,
                color: "#000",
              }}
            >
              F
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
              FREEWORKS
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              marginTop: 6,
            }}
          >
            관리자 시스템
          </div>
        </div>

        {/* 메뉴 */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#FFD600" : "rgba(255,255,255,0.45)",
                  background: isActive
                    ? "rgba(255,214,0,0.12)"
                    : "transparent",
                  textDecoration: "none",
                  marginBottom: 2,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          FREEWORKS ADMIN v1.0
        </div>
      </aside>

      {/* 본문 */}
      <main
        style={{
          flex: 1,
          background: "#f8f8f6",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
