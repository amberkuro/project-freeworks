import { createClient } from "@supabase/supabase-js";

let browserSupabase = null;

export function getSupabase() {
  if (browserSupabase) return browserSupabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[Supabase] 환경변수 없음");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", url ? "설정됨" : "없음");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", anonKey ? "설정됨" : "없음");
    return null;
  }

  browserSupabase = createClient(url, anonKey);
  return browserSupabase;
}

export const STORAGE_BUCKET = "portfolios";
