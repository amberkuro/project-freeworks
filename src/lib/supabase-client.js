let client = null;

export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  client = {
    storageUrl: `${url}/storage/v1`,
    anonKey,
    upload: async (bucket, path, file, onProgress) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${url}/storage/v1/object/${bucket}/${path}`, true);
        xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
        xhr.setRequestHeader("x-upsert", "true");
        // PDF/AI 등 Content-Type을 명시적으로 설정
        const contentType = file.type || "application/octet-stream";
        xhr.setRequestHeader("Content-Type", contentType);

        xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ path, publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` });
          } else {
            let errorMsg = `스토리지 업로드 실패 (${xhr.status})`;
            try {
              const errBody = JSON.parse(xhr.responseText);
              console.error("[Supabase Storage 에러]", { status: xhr.status, body: errBody, path, fileType: file.type, fileSize: file.size });
              if (errBody.message) errorMsg = errBody.message;
              if (errBody.error) errorMsg = errBody.error;
              if (errorMsg.includes("Bucket not found")) errorMsg = "스토리지 버킷이 존재하지 않습니다";
              if (errorMsg.includes("Invalid key")) errorMsg = "파일 경로에 허용되지 않는 문자가 포함되어 있습니다";
              if (errorMsg.includes("Payload too large")) errorMsg = "파일 크기가 스토리지 제한을 초과했습니다";
            } catch { console.error("[Supabase Storage 에러]", xhr.status, xhr.responseText?.substring(0, 500)); }
            reject(new Error(errorMsg));
          }
        };
        xhr.onerror = () => { console.error("[네트워크 에러] 파일:", file.name, "크기:", file.size); reject(new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.")); };
        xhr.ontimeout = () => reject(new Error("업로드 시간이 초과되었습니다."));
        xhr.timeout = 180000;
        xhr.send(file);
      });
    },
    getPublicUrl: (bucket, path) => `${url}/storage/v1/object/public/${bucket}/${path}`,
  };
  return client;
}

export function generateSafeFileName(originalName) {
  const ext = originalName.includes(".") ? "." + originalName.split(".").pop().toLowerCase() : "";
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${random}${ext}`;
}

export function uploadLocal(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { const data = JSON.parse(xhr.responseText); if (data.success && data.files?.[0]) resolve({ path: data.files[0].url, publicUrl: data.files[0].url }); else reject(new Error(data.error || "업로드 처리 실패")); }
        catch { reject(new Error("서버 응답 파싱 실패")); }
      } else {
        let msg = `업로드 실패 (${xhr.status})`;
        try { const err = JSON.parse(xhr.responseText); msg = err.error || msg; } catch {}
        console.error("[로컬 업로드 에러]", xhr.status, xhr.responseText?.substring(0, 300));
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("네트워크 오류가 발생했습니다."));
    xhr.timeout = 180000;
    xhr.send(formData);
  });
}

export const STORAGE_BUCKET = "portfolios";
