"use client";
import { useState, useRef, useCallback } from "react";
import { UPLOAD_CONFIG } from "@/lib/constants";
import { getSupabaseClient, uploadLocal, generateSafeFileName, STORAGE_BUCKET } from "@/lib/supabase-client";

function getFileExt(name) { return "." + name.split(".").pop().toLowerCase(); }
function formatSize(bytes) { if (bytes < 1024) return bytes + " B"; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"; return (bytes / (1024 * 1024)).toFixed(1) + " MB"; }
function isPreviewable(file) { return UPLOAD_CONFIG.previewableTypes.includes(file.type); }

function validateFile(file) {
  const ext = getFileExt(file.name);
  if (!UPLOAD_CONFIG.allowedExtensions.includes(ext) && !UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) return `지원되지 않는 파일 형식입니다: ${file.name}`;
  if (file.size > UPLOAD_CONFIG.maxSizeBytes) return `파일 크기 초과: ${file.name} (파일당 ${UPLOAD_CONFIG.maxSizeMB}MB 이하만 업로드 가능)`;
  return null;
}

function FileCard({ item, onRetry, onRemove }) {
  const ext = getFileExt(item.name).replace(".", "").toUpperCase();
  const isImg = item.previewUrl && isPreviewable(item.file);
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-white">
      <div className="aspect-square bg-[#f8f8f6] flex items-center justify-center relative overflow-hidden">
        {isImg ? (<img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />) : (
          <div className="flex flex-col items-center gap-1.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M18 4H10C8.9 4 8 4.9 8 6V26C8 27.1 8.9 28 10 28H22C23.1 28 24 27.1 24 26V10L18 4Z" stroke="#888" strokeWidth="1.5" fill="#f0f0f0"/><path d="M18 4V10H24" stroke="#888" strokeWidth="1.5"/></svg>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{ext}</span>
          </div>
        )}
        {item.uploadStatus === "uploading" && (<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2"><div className="w-[70%] h-1.5 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-[#FFD600] rounded-full transition-all duration-300" style={{ width: `${item.uploadProgress}%` }} /></div><span className="text-white text-[12px] font-bold">{item.uploadProgress}%</span></div>)}
        {item.uploadStatus === "success" && (<div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2e7d32] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>)}
        {item.uploadStatus === "error" && (<div className="absolute inset-0 bg-red-50/80 flex flex-col items-center justify-center gap-2 p-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="1.5"/><path d="M12 8V13" stroke="#c62828" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1" fill="#c62828"/></svg><span className="text-[10px] text-[#c62828] text-center font-medium leading-tight">{item.errorMessage || "업로드 실패"}</span><button onClick={() => onRetry(item.id)} className="px-3 py-1 text-[10px] font-bold text-white bg-[#c62828] rounded-md border-none cursor-pointer hover:bg-[#b71c1c] transition-colors">재시도</button></div>)}
      </div>
      <div className="px-2.5 py-2 flex items-center justify-between gap-1 border-t border-gray-50">
        <div className="min-w-0 flex-1"><p className="text-[10px] text-gray-600 font-medium truncate">{item.name}</p><p className="text-[9px] text-gray-300">{formatSize(item.size)}</p></div>
        <button onClick={() => onRemove(item.id)} className="w-5 h-5 rounded flex items-center justify-center text-gray-300 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 text-sm leading-none">&times;</button>
      </div>
    </div>
  );
}

export default function FileUploader({ value = [], onChange }) {
  const [items, setItems] = useState(value);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const updateItems = useCallback((newItems) => { setItems(newItems); onChange?.(newItems); }, [onChange]);

  const addFiles = (fileList) => {
    const remaining = UPLOAD_CONFIG.maxFiles - items.length;
    if (remaining <= 0) { alert(`최대 ${UPLOAD_CONFIG.maxFiles}개까지 업로드 가능합니다.`); return; }
    const newItems = [];
    for (const file of Array.from(fileList).slice(0, remaining)) {
      const error = validateFile(file);
      if (error) { alert(error); continue; }
      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      newItems.push({ id, file, name: file.name, size: file.size, type: file.type, previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null, uploadProgress: 0, uploadStatus: "ready", errorMessage: null, storagePath: null, publicUrl: null });
    }
    if (newItems.length > 0) { const merged = [...items, ...newItems]; updateItems(merged); newItems.forEach((item) => startUpload(item)); }
  };

  const startUpload = async (item) => {
    const setStatus = (id, updates) => { setItems((prev) => { const next = prev.map((f) => (f.id === id ? { ...f, ...updates } : f)); onChange?.(next); return next; }); };
    setStatus(item.id, { uploadStatus: "uploading", uploadProgress: 0, errorMessage: null });
    try {
      const supabase = getSupabaseClient();
      let result;
      if (supabase) {
        const safeFileName = generateSafeFileName(item.name);
        const storagePath = `applications/${safeFileName}`;
        console.log(`[업로드 시작] ${item.name} → ${storagePath} (${item.type}, ${formatSize(item.size)})`);
        result = await supabase.upload(STORAGE_BUCKET, storagePath, item.file, (p) => setStatus(item.id, { uploadProgress: p }));
        console.log(`[업로드 완료] ${item.name} → ${result.publicUrl}`);
      } else {
        result = await uploadLocal(item.file, (p) => setStatus(item.id, { uploadProgress: p }));
      }
      setStatus(item.id, { uploadStatus: "success", uploadProgress: 100, storagePath: result.path, publicUrl: result.publicUrl });
    } catch (err) {
      console.error(`[업로드 실패] ${item.name}:`, err.message);
      let userMessage = err.message || "업로드에 실패했습니다.";
      const ext = getFileExt(item.name);
      if (userMessage.includes("400") || userMessage.includes("Invalid")) {
        userMessage = `${ext.toUpperCase().replace(".", "")} 파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.`;
      }
      setStatus(item.id, { uploadStatus: "error", uploadProgress: 0, errorMessage: userMessage });
    }
  };

  const handleRetry = (id) => { const item = items.find((f) => f.id === id); if (item) startUpload(item); };
  const handleRemove = (id) => { const item = items.find((f) => f.id === id); if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl); updateItems(items.filter((f) => f.id !== id)); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); };

  const isUploading = items.some((f) => f.uploadStatus === "uploading");
  const hasError = items.some((f) => f.uploadStatus === "error");
  const allSuccess = items.length > 0 && items.every((f) => f.uploadStatus === "success");

  return (
    <div>
      <div onClick={() => !isUploading && fileRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl py-8 text-center transition-all ${isUploading ? "opacity-50 cursor-wait" : dragActive ? "border-[#FFD600] bg-[rgba(255,214,0,0.03)] cursor-pointer" : "border-gray-200 cursor-pointer hover:border-gray-300"}`}>
        <input ref={fileRef} type="file" accept={UPLOAD_CONFIG.allowedExtensions.join(",")} multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <div className="w-12 h-12 rounded-xl bg-[rgba(255,214,0,0.08)] flex items-center justify-center mx-auto mb-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2" strokeLinecap="round"><path d="M12 5V17M12 5L7 10M12 5L17 10"/><path d="M4 20H20"/></svg></div>
        <p className="text-[13px] text-gray-500 font-medium">클릭하거나 파일을 드래그하여 업로드</p>
        <p className="text-[11px] text-gray-300 mt-1.5">작가님의 스타일을 확인할 수 있는 작업물을 업로드해 주세요</p>
        <p className="text-[10px] text-gray-300 mt-1">{UPLOAD_CONFIG.helpText}</p>
      </div>
      {items.length > 0 && (
        <div className="flex items-center justify-between mt-3 mb-2">
          <span className="text-[12px] text-gray-400">{items.length} / {UPLOAD_CONFIG.maxFiles}개{isUploading && <span className="text-[#a67c00] ml-1.5 font-semibold">업로드 중...</span>}{!isUploading && hasError && <span className="text-[#c62828] ml-1.5 font-semibold">일부 실패</span>}{allSuccess && <span className="text-[#2e7d32] ml-1.5 font-semibold">전체 완료</span>}</span>
          {hasError && !isUploading && (<button onClick={() => items.filter((f) => f.uploadStatus === "error").forEach((f) => startUpload(f))} className="text-[11px] font-bold text-[#c62828] bg-red-50 px-3 py-1 rounded-md border-none cursor-pointer hover:bg-red-100 transition-colors">실패 전체 재시도</button>)}
        </div>
      )}
      {items.length > 0 && (<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">{items.map((item) => (<FileCard key={item.id} item={item} onRetry={handleRetry} onRemove={handleRemove} />))}</div>)}
    </div>
  );
}
