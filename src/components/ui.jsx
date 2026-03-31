"use client";
import Link from "next/link";
import { STATUS_MAP, APP_STATUS } from "@/lib/constants";

export function Logo({ size = "sm" }) {
  const s = size === "sm" ? 24 : 32;
  const fs = size === "sm" ? 12 : 16;
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <div
        className="flex items-center justify-center rounded-md"
        style={{ width: s, height: s, background: "#FFD600" }}
      >
        <span style={{ fontWeight: 800, fontSize: fs, color: "#000" }}>F</span>
      </div>
      <span className="font-bold text-sm text-black">FREEWORKS</span>
    </Link>
  );
}

export function StatusBadge({ status, type = "sample" }) {
  const map = type === "app" ? APP_STATUS : STATUS_MAP;
  const s = map[status] || { label: status, color: "#888", bg: "#f0f0f0" };
  return (
    <span
      className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

export function SiteHeader({ children }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-14">
        {children}
      </div>
    </header>
  );
}

export function getUnreadCount(sample) {
  if (!sample.messages || sample.messages.length === 0) return 0;
  const lastRead = sample.member_last_read_at || "1970-01-01";
  return sample.messages.filter(
    (m) => m.sender_role === "admin" && m.created_at > lastRead
  ).length;
}
