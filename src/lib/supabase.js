let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("[Supabase] 환경변수 없음 — 개발 모드로 동작");
    return null;
  }
  supabase = {
    storage: {
      from: (bucket) => ({
        upload: async (path, file, options) => {
          const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, ...options?.contentType ? { "Content-Type": options.contentType } : {} },
            body: file,
          });
          if (!res.ok) { const err = await res.json(); return { data: null, error: err }; }
          return { data: { path }, error: null };
        },
        getPublicUrl: (path) => ({ data: { publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` } }),
      }),
    },
  };
  return supabase;
}

export const STORAGE_BUCKET = "portfolios";
