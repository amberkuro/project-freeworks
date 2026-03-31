"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setApplications(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
        로딩중...
      </div>
    );
  }

  const total = applications.length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "전체 신청", value: total, color: "#000" },
    { label: "검토 대기", value: pending, color: "#FFD600", accent: true },
    { label: "승인", value: approved, color: "#2e7d32" },
    { label: "거절", value: rejected, color: "#c62828" },
  ];

  const recent = applications.slice(0, 5);

  const statusStyle = (status) => {
    if (status === "approved") return { color: "#2e7d32", bg: "#e8f5e9" };
    if (status === "rejected") return { color: "#c62828", bg: "#ffebee" };
    return { color: "#888", bg: "#f0f0f0" };
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000 }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#000",
          marginBottom: 8,
        }}
      >
        관리자 대시보드
      </h1>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>
        크리에이터 신청 현황을 한눈에 확인할 수 있습니다.
      </p>

      {/* 통계 카드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#999",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: s.accent ? s.color : "#000",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* 최근 신청 */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>최근 신청</h2>
        <Link
          href="/admin/applications"
          style={{
            fontSize: 12,
            color: "#888",
            textDecoration: "none",
          }}
        >
          전체 보기 →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "#ccc",
            fontSize: 14,
          }}
        >
          아직 신청 내역이 없습니다
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              fontSize: 13,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["작가명", "이메일", "카테고리", "신청일", "상태"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#999",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recent.map((app) => {
                const st = statusStyle(app.status);
                return (
                  <tr
                    key={app.id}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 700,
                        color: "#000",
                      }}
                    >
                      {app.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
                      {app.email}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
                      {app.category || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#999" }}>
                      {app.created_at
                        ? new Date(app.created_at).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: st.color,
                          background: st.bg,
                          padding: "3px 10px",
                          borderRadius: 20,
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
