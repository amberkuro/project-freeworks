/**
 * 인증 유틸리티
 *
 * 현재: 쿠키 기반 간단 인증 (관리자 전용)
 * 향후: Supabase Auth로 교체 시 이 파일만 수정하면 됨
 *
 * 관리자 이메일: ADMIN_EMAIL 환경변수 또는 기본값
 * 관리자 비밀번호: ADMIN_PASSWORD 환경변수 또는 기본값
 */

import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "freeworks77@naver.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Bmfldnjrtm2017";
const AUTH_COOKIE = "fw_auth";
const AUTH_SECRET = process.env.AUTH_SECRET || "freeworks-secret-key-change-in-production";

function encodeToken(payload) {
  const data = JSON.stringify(payload);
  return Buffer.from(`${AUTH_SECRET}:${data}`).toString("base64");
}

function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [secret, data] = [decoded.substring(0, AUTH_SECRET.length), decoded.substring(AUTH_SECRET.length + 1)];
    if (secret !== AUTH_SECRET) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function validateCredentials(email, password) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      success: true,
      user: { email, role: "admin", name: "프리웍스 관리자" },
    };
  }
  return { success: false, user: null };
}

export function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    return decodeToken(token);
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user?.role === "admin";
}

export function createAuthToken(user) {
  return encodeToken(user);
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;
