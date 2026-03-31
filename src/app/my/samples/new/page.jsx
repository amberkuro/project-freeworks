"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo, SiteHeader } from "@/components/ui";
import { PRODUCT_OPTIONS } from "@/lib/constants";
import { MOCK_USER, MOCK_SAMPLES } from "@/lib/mock-data";
import { shouldBlock } from "@/lib/promo";

export default function NewSamplePage() {
  const user = MOCK_USER;
  const isBlocked = MOCK_SAMPLES.some((s) => shouldBlock(s));
  const [form, setForm] = useState({ product_category: "", product_description: "", data_type: "artwork_only" });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const canSubmit = form.product_category && form.product_description && !isBlocked;

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <SiteHeader><div className="flex items-center gap-2"><Logo /></div><div /></SiteHeader>
        <main className="max-w-[600px] mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#c62828] flex items-center justify-center mx-auto mb-6"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="14" cy="14" r="11"/><path d="M14 9V15"/><circle cx="14" cy="19" r="1" fill="white"/></svg></div>
          <h1 className="text-[24px] font-extrabold text-black mb-3">샘플 신청이 제한되었습니다</h1>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-2">홍보 미완료 건이 있어 신규 샘플 신청이 제한되었습니다.</p>
          <p className="text-[13px] text-gray-300 mb-8">미완료 홍보를 제출하시거나, 카카오 채널로 문의해 주세요.</p>
          <Link href="/my" className="inline-block px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg no-underline">마이페이지로 돌아가기</Link>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center max-w-[480px] px-6">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M7 14L12 19L21 9" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h1 className="text-[24px] font-extrabold text-black mb-3">샘플 신청이 완료되었습니다</h1>
          <p className="text-sm text-gray-400 mb-8">프리웍스에서 확인 후 진행합니다.</p>
          <Link href="/my" className="inline-block px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg no-underline">마이페이지로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-[#fafafa] focus:border-[#FFD600] transition-colors";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader><div className="flex items-center gap-2"><Logo /><span className="text-xs text-gray-300 ml-2">크리에이터</span></div><div className="flex items-center gap-3"><span className="text-[13px] text-gray-500">{user.artist_name}</span><div className="w-[30px] h-[30px] rounded-lg bg-black flex items-center justify-center"><span className="text-xs font-bold text-[#FFD600]">{user.artist_name.charAt(0)}</span></div></div></SiteHeader>
      <main className="max-w-[640px] mx-auto px-6 py-8">
        <Link href="/my" className="text-[13px] text-gray-400 no-underline">&larr; 마이페이지</Link>
        <h1 className="text-[24px] font-extrabold text-black mt-3 mb-2">새 샘플 신청</h1>
        <p className="text-sm text-gray-400 mb-8">이번 달 남은 횟수: <span className="font-bold text-black">{user.monthly_quota - user.used_quota}회</span></p>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-black mb-5 flex items-center gap-2"><div className="w-1 h-4 bg-[#FFD600] rounded" />제품 선택</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">{PRODUCT_OPTIONS.map((opt) => (<button type="button" key={opt.value} onClick={() => setForm((p) => ({ ...p, product_category: opt.value }))} className={`p-4 rounded-xl text-left transition-all ${form.product_category === opt.value ? "border-2 border-[#FFD600] bg-[rgba(255,214,0,0.04)]" : "border border-gray-200 bg-[#fafafa]"}`}><div className="text-sm font-bold text-black">{opt.label}</div><div className="text-xs text-gray-400 mt-1">{opt.desc}</div></button>))}</div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">제품 설명 <span className="text-[#FFD600]">*</span></label>
          <textarea name="product_description" value={form.product_description} onChange={handleChange} placeholder="원하는 제품을 설명해 주세요" rows={4} className={`${inputStyle} resize-y`} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-7">
          <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2"><div className="w-1 h-4 bg-[#FFD600] rounded" />데이터 타입</h2>
          <div className="grid grid-cols-2 gap-3">{[{ value: "artwork_only", label: "그림만 있음", desc: "프리웍스에서 데이터 제작" }, { value: "complete_data", label: "완성 데이터", desc: "인쇄용 데이터 보유" }].map((opt) => (<button type="button" key={opt.value} onClick={() => setForm((p) => ({ ...p, data_type: opt.value }))} className={`p-4 rounded-xl text-left transition-all ${form.data_type === opt.value ? "border-2 border-[#FFD600] bg-[rgba(255,214,0,0.04)]" : "border border-gray-200 bg-[#fafafa]"}`}><div className="text-sm font-bold text-black">{opt.label}</div><div className="text-xs text-gray-400 mt-1">{opt.desc}</div></button>))}</div>
        </div>
        <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit} className={`w-full py-4 text-base font-bold rounded-xl transition-all ${canSubmit ? "text-black bg-[#FFD600] cursor-pointer hover:shadow-lg" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}>샘플 신청하기</button>
      </main>
    </div>
  );
}
