"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setApplications(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    fetchData();
  };

  if (loading) return <div style={{ padding: 40 }}>로딩중...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        관리자 페이지
      </h1>

      {applications.map((app) => (
        <div
          key={app.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <p><b>이름:</b> {app.name}</p>
          <p><b>이메일:</b> {app.email}</p>
          <p><b>인스타:</b> {app.instagram}</p>
          <p><b>트위터:</b> {app.twitter}</p>
          <p><b>상태:</b> {app.status}</p>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => updateStatus(app.id, "approved")}
              style={{
                marginRight: 10,
                background: "green",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: 6,
              }}
            >
              승인
            </button>

            <button
              onClick={() => updateStatus(app.id, "rejected")}
              style={{
                background: "red",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: 6,
              }}
            >
              거절
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
