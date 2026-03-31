import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSupabase, STORAGE_BUCKET } from "@/lib/supabase";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function generateSafeFileName(originalName) {
  const ext = originalName.includes(".") ? "." + originalName.split(".").pop().toLowerCase() : "";
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${random}${ext}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    if (!files || files.length === 0) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    if (files.length > 5) return NextResponse.json({ error: "최대 5개까지 업로드 가능합니다." }, { status: 400 });

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/postscript", "image/vnd.adobe.photoshop",
      "application/eps", "application/x-eps", "image/svg+xml",
      "application/zip", "application/x-zip-compressed", "application/x-zip",
      "application/octet-stream",
    ];
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".ai", ".psd", ".eps", ".svg", ".zip"];
    const maxSize = 50 * 1024 * 1024;
    const uploaded = [];
    const supabase = getSupabase();

    for (const file of files) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
        console.error(`[업로드 거절] 파일: ${file.name}, MIME: ${file.type}, 확장자: ${ext}`);
        return NextResponse.json({ error: `허용되지 않는 파일 형식: ${file.name} (${file.type})` }, { status: 400 });
      }
      if (file.size > maxSize) return NextResponse.json({ error: `파일 크기 50MB 초과: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)` }, { status: 400 });

      const safeFileName = generateSafeFileName(file.name);
      console.log(`[업로드] 원본: ${file.name} → 저장: ${safeFileName} (${file.type}, ${(file.size / 1024 / 1024).toFixed(1)}MB)`);

      if (supabase) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = `applications/${safeFileName}`;
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, { contentType: file.type || "application/octet-stream" });
        if (error) { console.error(`[Supabase 에러] ${file.name}:`, error); return NextResponse.json({ error: `스토리지 업로드 실패: ${file.name}` }, { status: 500 }); }
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        uploaded.push({ name: file.name, url: urlData.publicUrl, type: file.type, size: file.size });
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, safeFileName), buffer);
        uploaded.push({ name: file.name, url: `/uploads/${safeFileName}`, type: file.type, size: file.size });
        console.log(`📁 로컬 저장: public/uploads/${safeFileName}`);
      }
    }
    return NextResponse.json({ success: true, files: uploaded });
  } catch (err) {
    console.error("[업로드 서버 에러]", err);
    return NextResponse.json({ error: "파일 업로드 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
