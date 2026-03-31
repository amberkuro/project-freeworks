"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 관리자 인증 훅
 * - /api/auth/me 로 현재 세션 확인
 * - admin role 아니면 /login 으로 리다이렉트
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.role === "admin") setUser(d.user);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.replace("/login");
  };

  return { user, checking, logout };
}
