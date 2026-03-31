import { createClient } from "@supabase/supabase-js";

/**
 * 브라우저 + 서버 공용 Supabase 클라이언트
 * @supabase/supabase-js 공식 SDK 사용
 */

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[Supabase] 환경변수 미설정");
    console.error("  NEXT_PUBLIC_SUPABASE_URL:", url ? "OK" : "없음");
    console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "없음");
    return null;
  }

  supabase = createClient(url, key);
  console.log("[Supabase] 클라이언트 생성 완료:", url);
  return supabase;
}

/**
 * 브라우저 전용 클라이언트 (ANON_KEY)
 * 신청 insert 등 공개 작업용
 */
let browserClient = null;

export function getBrowserSupabase() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[Supabase Browser] 환경변수 미설정");
    return null;
  }

  browserClient = createClient(url, key);
  return browserClient;
}

export const STORAGE_BUCKET = "portfolios";
