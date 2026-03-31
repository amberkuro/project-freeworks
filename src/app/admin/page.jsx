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

export default function AdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <div style={{ padding: 40 }}>로딩중...</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 24 }}>
        관리자 페이지
      </h1>

      {applications.length === 0 ? (
        <div>신청 내역이 없습니다.</div>
      ) : (
        applications.map((app) => {
          const portfolioFiles = parsePortfolioUrls(app.portfolio_urls);

          return (
            <div
              key={app.id}
              style={{
                border: "1px solid #ddd",
                padding: 24,
                marginBottom: 24,
                borderRadius: 12,
                background: "#fff",
              }}
            >
              <div style={{ marginBottom: 16, lineHeight: 1.8 }}>
                <p><b>이름:</b> {app.name}</p>
                <p><b>이메일:</b> {app.email}</p>
                <p><b>인스타:</b> {app.instagram || "-"}</p>
                <p><b>트위터:</b> {app.twitter || "-"}</p>
                <p><b>상태:</b> {app.status}</p>
                <p><b>카테고리:</b> {app.category || "-"}</p>
                <p><b>설명:</b> {app.description || "-"}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, marginBottom: 12 }}>포트폴리오</h3>

                {portfolioFiles.length === 0 ? (
                  <p style={{ color: "#666" }}>업로드된 포트폴리오가 없습니다.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {portfolioFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #e5e5e5",
                          borderRadius: 10,
                          padding: 12,
                          background: "#fafafa",
                        }}
                      >
                        {isImageFile(file.url, file.type) ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <img
                              src={file.url}
                              alt={file.name || `portfolio-${index}`}
                              style={{
                                width: "100%",
                                height: 160,
                                objectFit: "cover",
                                borderRadius: 8,
                                marginBottom: 10,
                                display: "block",
                              }}
                            />
                          </a>
                        ) : (
                          <div
                            style={{
                              height: 160,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#eee",
                              borderRadius: 8,
                              marginBottom: 10,
                              fontSize: 14,
                              color: "#666",
                              textAlign: "center",
                              padding: 8,
                            }}
                          >
                            미리보기 없음
                          </div>
                        )}

                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                            {file.name || `파일 ${index + 1}`}
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#0070f3", wordBreak: "break-all" }}
                          >
                            파일 열기
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => updateStatus(app.id, "approved")}
                  style={{
                    marginRight: 10,
                    background: "green",
                    color: "white",
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  승인
                </button>

                <button
                  onClick={() => updateStatus(app.id, "rejected")}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  거절
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
