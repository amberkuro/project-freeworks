"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { PRODUCT_OPTIONS, AGREEMENTS } from "@/lib/constants";
import FileUploader from "@/components/FileUploader";
import { getSupabase } from "@/lib/supabase";

export default function ApplyPage() {
  const [form, setForm] = useState({
    artist_name: "",
    instagram: "",
    twitter: "",
    email: "",
    product_category: "",
    product_description: "",
  });
  const [agreements, setAgreements] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const allAgreed = AGREEMENTS.every((a) => agreements[a.key]);
  const hasSns = !!(form.instagram.trim() || form.twitter.trim());
  const filesReady =
    uploadedFiles.length > 0 &&
    uploadedFiles.every((f) => f.uploadStatus === "success");
  const isUploading = uploadedFiles.some(
    (f) => f.uploadStatus === "uploading"
  );
  const allFilled =
    form.artist_name &&
    form.email &&
    hasSns &&
    form.product_category &&
    form.product_description &&
    filesReady;
  const canSubmit = allFilled && allAgreed && !submitting && !isUploading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const supabase = getSupabase();

      if (!supabase || typeof supabase.from !== "function") {
        throw new Error("Supabase 연결 실패: 설정을 확인해 주세요.");
      }

      const portfolioUrls = uploadedFiles.map((f) => ({
        name: f.name,
        url: f.publicUrl,
        type: f.type,
        size: f.size,
      }));

      const formData = {
        name: form.artist_name,
        email: form.email,
        instagram: form.instagram || null,
        twitter: form.twitter || null,
        category: form.product_category,
        description: form.product_description,
        portfolio_urls: JSON.stringify(portfolioUrls),
        status: "pending",
      };

      console.log("insert 실행 직전", formData);

      const { data, error } = await supabase
        .from("applications")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            instagram: formData.instagram,
            twitter: formData.twitter,
            category: formData.category,
            description: formData.description,
            portfolio_urls: formData.portfolio_urls,
            status: "pending",
          },
        ])
        .select();

      if (error) {
        console.error("insert 실패", error);
        throw new Error(
          `저장 실패: ${error.message || error.details || JSON.stringify(error)}`
        );
      } else {
        console.log("insert 성공", data);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("신청 처리 에러:", err);
      setSubmitError(
        err.message || "신청에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center max-w-[480px] px-6">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M7 14L12 19L21 9"
                stroke="#FFD600"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[28px] font-extrabold text-black mb-3">
            신청이 완료되었습니다
          </h1>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-2">
            프리웍스에서 포트폴리오를 검토한 뒤
            <br />
            승인 결과를 이메일로 안내드립니다.
          </p>
          <p className="text-[13px] text-gray-300 mb-8">
            승인 후 안내받은 이메일로 로그인하실 수 있습니다.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg no-underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle =
    "w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-[#fafafa] focus:border-[#FFD600] transition-colors";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center h-14">
          <Logo />
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-6 py-12">
        <div className="mb-10">
          <Link href="/" className="text-[13px] text-gray-400 no-underline">
            &larr; 홈으로
          </Link>
          <h1 className="text-[28px] font-extrabold text-black mt-3 tracking-tight">
            크리에이터 신청
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            포트폴리오 검토 후 승인 결과를 이메일로 안내드립니다.
            <br />
            <span className="text-gray-300">
              승인된 분에 한해 계정이 생성되며, 별도 회원가입은 필요하지
              않습니다.
            </span>
          </p>
        </div>

        {submitError && (
          <div className="px-4 py-3 rounded-xl mb-5 bg-red-50 border border-red-100 text-[13px] text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-base font-bold text-black mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FFD600] rounded" />
              기본 정보
            </h2>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
              작가명 / 닉네임 <span className="text-[#FFD600]">*</span>
            </label>
            <input
              name="artist_name"
              placeholder="활동명을 입력해 주세요"
              value={form.artist_name}
              onChange={handleChange}
              className={`${inputStyle} mb-5`}
            />
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
              이메일 <span className="text-[#FFD600]">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className={`${inputStyle} mb-5`}
            />
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-semibold text-gray-800">
                SNS 계정 <span className="text-[#FFD600]">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  hasSns ? "text-green-700" : "text-gray-400"
                }`}
              >
                {hasSns ? "✓ 입력 완료" : "1개 이상 입력"}
              </span>
            </div>
            <div
              className={`p-4 rounded-xl border ${
                hasSns
                  ? "border-[rgba(255,214,0,0.3)]"
                  : "border-gray-100"
              } bg-[#fafafa]`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.instagram.trim()
                      ? "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
                      : "bg-gray-200"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={form.instagram.trim() ? "#fff" : "#bbb"}
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <input
                  name="instagram"
                  placeholder="@username"
                  value={form.instagram}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#FFD600]"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.twitter.trim() ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={form.twitter.trim() ? "#fff" : "#bbb"}
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <input
                  name="twitter"
                  placeholder="@username"
                  value={form.twitter}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#FFD600]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-base font-bold text-black mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FFD600] rounded" />
              희망 제품
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {PRODUCT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() =>
                    setForm((p) => ({ ...p, product_category: opt.value }))
                  }
                  className={`p-4 rounded-xl text-left transition-all ${
                    form.product_category === opt.value
                      ? "border-2 border-[#FFD600] bg-[rgba(255,214,0,0.04)]"
                      : "border border-gray-200 bg-[#fafafa]"
                  }`}
                >
                  <div className="text-sm font-bold text-black">
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
              샘플 제품 설명 <span className="text-[#FFD600]">*</span>
            </label>
            <textarea
              name="product_description"
              placeholder="어떤 제품을 만들고 싶으신지 설명해 주세요"
              value={form.product_description}
              onChange={handleChange}
              rows={4}
              className={`${inputStyle} resize-y`}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-base font-bold text-black mb-1.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FFD600] rounded" />
              포트폴리오 <span className="text-[#FFD600] text-[13px]">*</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4 pl-3">
              승인 검토를 위해 작가님의 작업물을 몇 가지 업로드해 주세요
            </p>
            <FileUploader value={uploadedFiles} onChange={setUploadedFiles} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-7">
            <h2 className="text-base font-bold text-black mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FFD600] rounded" />
              약관 동의
            </h2>
            <div
              onClick={() => {
                const n = {};
                const all = AGREEMENTS.every((a) => agreements[a.key]);
                AGREEMENTS.forEach((a) => {
                  n[a.key] = !all;
                });
                setAgreements(n);
              }}
              className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-lg mb-3 ${
                allAgreed
                  ? "bg-[rgba(255,214,0,0.08)] border border-[rgba(255,214,0,0.3)]"
                  : "bg-[#f8f8f8] border border-gray-100"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  allAgreed
                    ? "border-[#FFD600] bg-[#FFD600]"
                    : "border-gray-300"
                }`}
              >
                {allAgreed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-bold text-black">
                전체 동의하기
              </span>
            </div>
            {AGREEMENTS.map((a) => (
              <div
                key={a.key}
                onClick={() =>
                  setAgreements((p) => ({ ...p, [a.key]: !p[a.key] }))
                }
                className="flex items-center gap-2.5 cursor-pointer px-3 py-2.5"
              >
                <div
                  className={`w-[18px] h-[18px] rounded flex-shrink-0 border-2 flex items-center justify-center ${
                    agreements[a.key]
                      ? "border-[#FFD600] bg-[#FFD600]"
                      : "border-gray-300"
                  }`}
                >
                  {agreements[a.key] && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-gray-500">{a.label}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-4 text-base font-bold rounded-xl transition-all ${
              canSubmit
                ? "text-black bg-[#FFD600] cursor-pointer hover:shadow-lg"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
          >
            {submitting
              ? "신청 중..."
              : isUploading
              ? "파일 업로드 중..."
              : "신청하기"}
          </button>
          {isUploading && (
            <p className="text-[11px] text-[#a67c00] text-center mt-2">
              파일 업로드 완료 후 신청 가능합니다
            </p>
          )}
          {!isUploading && (
            <p className="text-[11px] text-gray-300 text-center mt-3">
              신청 후 검토까지 영업일 기준 2~3일 소요됩니다
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
