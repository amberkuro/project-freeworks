"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo, StatusBadge, SiteHeader, getUnreadCount } from "@/components/ui";
import { INQUIRY_URL } from "@/lib/constants";
import { MOCK_USER, MOCK_SAMPLES } from "@/lib/mock-data";
import { getPromoStatus, getEventPromoStatus, formatDday, shouldBlock } from "@/lib/promo";

export default function MyPage() {
  const user = MOCK_USER;
  const samples = MOCK_SAMPLES;
  const isBlocked = samples.some((s) => shouldBlock(s));
  const [copied, setCopied] = useState(false);

  const copyCreatorInfo = () => {
    const latestSample = samples[0];
    const promoStatus = latestSample ? (latestSample.promoSubmitted ? "완료" : "미완료") : "—";
    const eventStatus = latestSample ? (latestSample.eventPromoSubmitted ? "완료" : "미완료") : "—";
    const sampleStatus = latestSample ? (latestSample.status === "completed" ? "완료" : "진행 중") : "없음";

    const text = `[프리웍스 크리에이터 정보]\n\n작가명: ${user.artist_name}\n이메일: ${user.email}\nSNS: ${user.instagram || ""} ${user.twitter || ""}\n\n온라인 홍보: ${promoStatus}\n행사장 홍보: ${eventStatus}\n\n샘플 상태: ${sampleStatus}`.trim();

    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader>
        <div className="flex items-center gap-2"><Logo /><span className="text-xs text-gray-300 ml-2">크리에이터</span></div>
        <div className="flex items-center gap-3"><span className="text-[13px] text-gray-500">{user.artist_name}</span><div className="w-[30px] h-[30px] rounded-lg bg-black flex items-center justify-center"><span className="text-xs font-bold text-[#FFD600]">{user.artist_name.charAt(0)}</span></div></div>
      </SiteHeader>
      <main className="max-w-[800px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-extrabold text-black mb-6">마이페이지</h1>

        {/* 차단 알림 */}
        {isBlocked && (
          <div className="p-4 rounded-xl mb-5 bg-[#ffebee] border border-red-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c62828] flex items-center justify-center flex-shrink-0"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6V11"/><circle cx="10" cy="14" r="0.5" fill="white"/></svg></div>
            <div><div className="text-[13px] font-bold text-[#c62828]">홍보 미완료로 샘플 신청이 제한되었습니다</div><div className="text-xs text-red-700/60 mt-0.5">미완료 홍보를 제출하시면 해제됩니다. 문의: 카카오 채널</div></div>
          </div>
        )}

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex justify-between items-start mb-4">
            <div><h2 className="text-lg font-extrabold text-black">{user.artist_name}</h2><p className="text-sm text-gray-400 mt-0.5">{user.email}</p></div>
            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">활성</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-[#f8f8f8] text-center"><div className="text-[11px] text-gray-400 font-semibold mb-1">이번 달 사용</div><div className="text-lg font-black text-black">{user.used_quota}<span className="text-sm text-gray-300 font-medium"> / {user.monthly_quota}</span></div></div>
            <div className="p-3 rounded-lg bg-[#f8f8f8] text-center"><div className="text-[11px] text-gray-400 font-semibold mb-1">인스타그램</div><div className="text-[13px] font-semibold text-gray-700">{user.instagram || "—"}</div></div>
            <div className="p-3 rounded-lg bg-[#f8f8f8] text-center"><div className="text-[11px] text-gray-400 font-semibold mb-1">X(트위터)</div><div className="text-[13px] font-semibold text-gray-700">{user.twitter || "—"}</div></div>
          </div>
        </div>

        {/* 본제작 문의 + 정보 복사 */}
        <div className="flex gap-2.5 mb-5">
          <a href={INQUIRY_URL} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#FFD600] no-underline font-bold text-[14px] text-black hover:shadow-lg transition-all">본제작 문의하기</a>
          <button onClick={copyCreatorInfo} className="px-5 py-3.5 rounded-xl bg-black text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-gray-800 transition-colors">{copied ? "✓ 복사됨" : "정보 복사"}</button>
        </div>

        {/* 샘플 목록 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-black">샘플 내역</h2>
          {!isBlocked && (
            <Link href="/my/samples/new" className="text-[13px] font-bold text-black bg-[#FFD600] px-5 py-2 rounded-lg no-underline hover:shadow-md transition-all">+ 새 샘플 신청</Link>
          )}
          {isBlocked && (
            <span className="text-[12px] text-red-500 font-semibold">신청 제한 중</span>
          )}
        </div>

        {samples.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-sm text-gray-300">아직 신청한 샘플이 없습니다</p></div>
        ) : (
          <div className="flex flex-col gap-3">
            {samples.map((s) => {
              const unread = getUnreadCount(s.messages, s.member_last_read_at, "admin");
              const promo = getPromoStatus(s);
              const eventPromo = getEventPromoStatus(s);
              return (
                <Link key={s.id} href={`/my/samples/${s.id}`} className="bg-white rounded-xl border border-gray-100 p-4 no-underline hover:border-[#FFD600] hover:shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="text-xs text-gray-300 font-semibold">{s.sample_number}</div>
                      <div className="text-[15px] font-bold text-black mt-0.5">{s.product_description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && <span className="text-[10px] font-bold text-[#a67c00] bg-[rgba(255,214,0,0.15)] px-2 py-0.5 rounded-full">{unread}</span>}
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-gray-400">{s.created_at}</span>
                    {s.shippedAt && (<><span className="text-gray-200">|</span><span style={{ color: promo.color }} className="font-semibold">홍보: {promo.text}</span></>)}
                    {s.courierName && (<><span className="text-gray-200">|</span><span className="text-gray-500">{s.courierName}</span></>)}
                    {s.deliveryStatus && (<><span className="text-gray-200">|</span><span className="font-semibold" style={{ color: s.deliveryStatus === "delivered" ? "#2e7d32" : s.deliveryStatus === "in_transit" ? "#1565c0" : "#546e7a" }}>{s.deliveryStatus === "delivered" ? "배송 완료" : s.deliveryStatus === "in_transit" ? "배송 중" : "출고"}</span></>)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
