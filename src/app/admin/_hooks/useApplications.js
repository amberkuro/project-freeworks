"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Supabase applications 테이블 데이터 관리 훅
 * - GET /api/applications 로 목록 조회
 * - PATCH /api/applications 로 상태 변경
 */
export function useApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || `조회 실패 (${res.status})`);
        return;
      }
      const d = await res.json();
      setApps(d.data || []);
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
