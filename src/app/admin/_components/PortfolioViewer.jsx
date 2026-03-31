"use client";
import { useState } from "react";
import Lightbox from "./Lightbox";

export default function PortfolioViewer({ files }) {
  const [lb, setLb] = useState(null);

  if (!files?.length) {
    return (
      <p className="text-[13px] text-gray-300 py-4 text-center">
        포트폴리오 없음
      </p>
    );
  }

  const isImg = (f) =>
    (f.type?.startsWith("image/") && !f.name?.match(/\.(psd|ai|eps)$/i)) ||
    f.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const isPdf = (f) =>
    f.type === "application/pdf" || f.name?.match(/\.pdf$/i);

  return (
    <>
      {lb && <Lightbox src={lb.url} alt={lb.name} onClose={() => setLb(null)} />}

      <div className="grid grid-cols-3 gap-2.5">
        {files.map((f, i) => {
          const ext = f.name?.split(".").pop().toUpperCase() || "FILE";

          return (
            <div key={i} className="relative group">
              {isImg(f) ? (
                <div
                  className="aspect-square rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:border-[#FFD600]"
                  onClick={() => setLb(f)}
                >
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg border border-gray-100 flex flex-col items-center justify-center gap-1.5 no-underline hover:border-[#FFD600] bg-[#fafafa]"
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M16 4H8C6.9 4 6 4.9 6 6V22C6 23.1 6.9 24 8 24H20C21.1 24 22 23.1 22 22V10L16 4Z"
                      stroke={isPdf(f) ? "#c62828" : "#666"}
                      strokeWidth="1.5"
                      fill={isPdf(f) ? "#ffebee" : "#f0f0f0"}
                    />
                  </svg>
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    {ext}
                  </span>
                  <span className="text-[9px] text-[#FFD600] font-bold">
                    다운로드
                  </span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
