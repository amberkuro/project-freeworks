"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Supabase applications 테이블 데이터 관리 훅
 * - GET /api/applications 로 목록 조회
 * - PATCH /api/applications 로 상태 변경
 */

/** 안전한 JSON 파싱 — HTML 응답이 오더라도 터지지 않음 */
async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  // JSON이 아닌 응답(HTML 에러 페이지 등)
  const text = await res.text();
  console.error("[useApplications] 비정상 응답:", res.status, text.substring(0, 200));
  return null;
}

export function useApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications");
      const data = await safeJson(res);

      if (!data) {
        setError(`서버 응답 오류 (${res.status}) — 새로고침하거나 .next 캐시를 삭제 후 재시작해 주세요.`);
        return;
      }

      if (!res.ok) {
        setError(data.error || `조회 실패 (${res.status})`);
        return;
      }

      setApps(data.data || []);
    } catch (e) {
      setError("네트워크 오류: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  /** 로컬 state만 즉시 반영 (낙관적 업데이트) */
  const updateLocal = (id, updates) =>
    setApps((p) => p.map((a) => (a.id === id ? { ...a, ...updates } : a)));

  /** 로컬 + 서버 동시 반영 */
  const updateRemote = async (id, updates) => {
    updateLocal(id, updates);
    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
    } catch (e) {
      console.error("업데이트 실패:", e);
    }
  };

  return { apps, loading, error, fetchApps, updateLocal, updateRemote };
}
