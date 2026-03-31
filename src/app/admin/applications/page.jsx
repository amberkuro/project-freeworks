"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function parsePortfolioUrls(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return [];
  }
}

function isImageFile(url = "", type = "") {
  return (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (!error) {
      fetchData();
    } else {
      alert("상태 변경 실패");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
        로딩중...
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filters = [
    { key: "all", label: "전체" },
    { key: "pending", label: "검토 대기" },
    { key: "approved", label: "승인" },
    { key: "rejected", label: "거절" },
  ];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#000" }}>
          신청 관리
        </h1>
        <button
          onClick={fetchData}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#888",
            background: "#f0f0f0",
            border: "none",
            padding: "6px 14px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          새로고침
        </button>
      </div>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
        크리에이터 신청 목록 · Supabase 실시간 조회
      </p>

      {/* 필터 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: filter === f.key ? "#000" : "#f0f0f0",
              color: filter === f.key ? "#fff" : "#666",
              transition: "all 0.15s",
            }}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* 신청 목록 */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 48,
            textAlign: "center",
            color: "#ccc",
            fontSize: 14,
          }}
        >
          해당 상태의 신청이 없습니다
        </div>
      ) : (
        filtered.map((app) => {
          const portfolioFiles = parsePortfolioUrls(app.portfolio_urls);

          const statusColor =
            app.status === "approved"
              ? { c: "#2e7d32", bg: "#e8f5e9" }
              : app.status === "rejected"
                ? { c: "#c62828", bg: "#ffebee" }
                : { c: "#a67c00", bg: "#fff8e1" };

          return (
            <div
              key={app.id}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 28,
                marginBottom: 20,
              }}
            >
              {/* 헤더 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#000",
                      margin: 0,
                    }}
                  >
                    {app.name}
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#999",
                      marginTop: 4,
                    }}
                  >
                    {app.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: statusColor.c,
                    background: statusColor.bg,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  {app.status}
                </span>
              </div>

              {/* 정보 그리드 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "인스타그램", value: app.instagram || "-" },
                  { label: "트위터", value: app.twitter || "-" },
                  { label: "카테고리", value: app.category || "-" },
                  {
                    label: "신청일",
                    value: app.created_at
                      ? new Date(app.created_at).toLocaleDateString("ko-KR")
                      : "-",
                  },
                ].map((info, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f8f8f8",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#999",
                        marginBottom: 4,
                      }}
                    >
                      {info.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* 설명 */}
              {app.description && (
                <div
                  style={{
                    background: "#f8f8f8",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#999",
                      marginBottom: 4,
                    }}
                  >
                    제품 설명
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#555",
                      lineHeight: 1.6,
                    }}
                  >
                    {app.description}
                  </div>
                </div>
              )}

              {/* 포트폴리오 */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#999",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>포트폴리오</span>
                  {portfolioFiles.length > 0 && (
                    <span style={{ color: "#a67c00" }}>
                      {portfolioFiles.length}개
                    </span>
                  )}
                </div>

                {portfolioFiles.length === 0 ? (
                  <p style={{ color: "#ccc", fontSize: 13 }}>
                    업로드된 포트폴리오가 없습니다.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {portfolioFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#fafafa",
                        }}
                      >
                        {isImageFile(file.url, file.type) ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <img
                              src={file.url}
                              alt={file.name || `portfolio-${index}`}
                              style={{
                                width: "100%",
                                height: 140,
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </a>
                        ) : (
                          <div
                            style={{
                              height: 140,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f0f0f0",
                              fontSize: 13,
                              color: "#999",
                            }}
                          >
                            미리보기 없음
                          </div>
                        )}
                        <div style={{ padding: "8px 10px" }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#555",
                              marginBottom: 4,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.name || `파일 ${index + 1}`}
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11,
                              color: "#FFD600",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            파일 열기
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 승인/거절 버튼 */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => updateStatus(app.id, "approved")}
                  style={{
                    background: "#FFD600",
                    color: "#000",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  승인
                </button>
                <button
                  onClick={() => updateStatus(app.id, "rejected")}
                  style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  거절
                </button>
                {app.status !== "pending" && (
                  <button
                    onClick={() => updateStatus(app.id, "pending")}
                    style={{
                      background: "#f0f0f0",
                      color: "#666",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    대기로 변경
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
