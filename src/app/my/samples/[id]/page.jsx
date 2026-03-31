"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Logo, StatusBadge, SiteHeader } from "@/components/ui";
import { INQUIRY_URL, DELIVERY_STATUS_MAP } from "@/lib/constants";
import { MOCK_USER, MOCK_SAMPLES } from "@/lib/mock-data";
import { getPromoStatus, getEventPromoStatus, formatDday, calcPromoDeadline, shouldBlock } from "@/lib/promo";

function DeliveryBadge({ status }) {
  const info = DELIVERY_STATUS_MAP[status] || { label: status || "—", color: "#888", bg: "#f0f0f0" };
  return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: info.color, background: info.bg }}>{info.label}</span>;
}

function ShippingForm({ initial, onSubmit }) {
  const [form, setForm] = useState(initial || { recipient: MOCK_USER.artist_name, phone: "", zipcode: "", address: "", address_detail: "", request: "" });
  const c = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const ok = form.recipient && form.phone && form.zipcode && form.address;
  const is = "w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#FFD600] transition-colors";
  return (<div className="p-5 rounded-xl border-2 border-[#0277bd] bg-[#e1f5fe]/30 mb-5"><h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2"><div className="w-1 h-3.5 bg-[#0277bd] rounded" />배송 정보 입력</h3><p className="text-xs text-gray-400 mb-4 pl-3">제작된 샘플을 받으실 주소를 입력해 주세요.</p>
    <div className="grid grid-cols-2 gap-3 mb-3"><div><label className="block text-[12px] font-semibold text-gray-600 mb-1">수령인명 *</label><input name="recipient" value={form.recipient} onChange={c} className={is} /></div><div><label className="block text-[12px] font-semibold text-gray-600 mb-1">연락처 *</label><input name="phone" value={form.phone} onChange={c} placeholder="010-0000-0000" className={is} /></div></div>
    <div className="mb-3"><label className="block text-[12px] font-semibold text-gray-600 mb-1">우편번호 *</label><input name="zipcode" value={form.zipcode} onChange={c} className={`${is} max-w-[200px]`} /></div>
    <div className="mb-3"><label className="block text-[12px] font-semibold text-gray-600 mb-1">주소 *</label><input name="address" value={form.address} onChange={c} className={is} /></div>
    <div className="mb-3"><label className="block text-[12px] font-semibold text-gray-600 mb-1">상세주소</label><input name="address_detail" value={form.address_detail} onChange={c} className={is} /></div>
    <div className="mb-4"><label className="block text-[12px] font-semibold text-gray-600 mb-1">배송 요청사항</label><input name="request" value={form.request} onChange={c} className={is} /></div>
    <button onClick={() => ok && onSubmit(form)} disabled={!ok} className={`w-full py-3 text-sm font-bold rounded-lg ${ok ? "text-black bg-[#FFD600] cursor-pointer" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}>배송 정보 저장</button></div>);
}

function ShippingInfo({ shipping }) {
  return (<div className="p-5 rounded-xl border border-gray-100 bg-[#f8f8f8] mb-5"><h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2"><div className="w-1 h-3.5 bg-[#00695c] rounded" />배송 정보</h3><div className="grid grid-cols-2 gap-2.5">{[{ l:"수령인", v:shipping.recipient }, { l:"연락처", v:shipping.phone }, { l:"우편번호", v:shipping.zipcode }, { l:"주소", v:`${shipping.address} ${shipping.address_detail||""}`.trim() }].map((i, idx) => (<div key={idx} className="p-2.5 rounded-lg bg-white"><div className="text-[10px] text-gray-400 font-semibold mb-0.5">{i.l}</div><div className="text-[13px] font-semibold text-gray-700">{i.v}</div></div>))}</div>{shipping.request && <div className="mt-2.5 p-2.5 rounded-lg bg-white"><div className="text-[10px] text-gray-400 font-semibold mb-0.5">배송 요청</div><div className="text-[13px] text-gray-600">{shipping.request}</div></div>}</div>);
}

function DeliveryTracker({ trackingNumber, deliveryStatus, deliveryConfirmedByAdmin }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [curStatus, setCurStatus] = useState(deliveryStatus);
  const track = async () => { if (deliveryConfirmedByAdmin) return; setLoading(true); setError(""); try { const r = await fetch(`/api/delivery?tracking=${encodeURIComponent(trackingNumber)}`); const d = await r.json(); if (!r.ok) { setError(d.error || "조회 실패"); return; } setResult(d); if (!deliveryConfirmedByAdmin) setCurStatus(d.status); } catch { setError("네트워크 오류"); } finally { setLoading(false); } };
  useEffect(() => { if (deliveryStatus !== "delivered" && !deliveryConfirmedByAdmin) track(); }, []);
  return (<div className="p-5 rounded-xl border border-gray-100 bg-[#f8f8f8] mb-5"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-black flex items-center gap-2"><div className="w-1 h-3.5 bg-[#1565c0] rounded" />배송 현황 (우체국)</h3><div className="flex items-center gap-2"><DeliveryBadge status={curStatus} />{curStatus !== "delivered" && !deliveryConfirmedByAdmin && <button onClick={track} disabled={loading} className={`text-[11px] font-bold px-3 py-1 rounded-md border-none cursor-pointer ${loading ? "text-gray-400 bg-gray-100" : "text-[#1565c0] bg-[#e3f2fd]"}`}>{loading ? "조회 중..." : "배송 조회"}</button>}</div></div>
    <div className="grid grid-cols-2 gap-2.5 mb-3"><div className="p-2.5 rounded-lg bg-white"><div className="text-[10px] text-gray-400 font-semibold mb-0.5">택배사</div><div className="text-[13px] font-semibold text-gray-700">우체국택배</div></div><div className="p-2.5 rounded-lg bg-white"><div className="text-[10px] text-gray-400 font-semibold mb-0.5">운송장</div><div className="text-[13px] font-semibold text-gray-700">{trackingNumber}</div></div></div>
    {error && <div className="p-2.5 rounded-lg bg-red-50 text-[12px] text-red-700 mb-2">{error}</div>}
    {result?.details?.length > 0 && (<div className="border border-gray-100 rounded-lg overflow-hidden">{result.details.slice().reverse().map((d, i) => (<div key={i} className={`px-3 py-2.5 text-[11px] ${i > 0 ? "border-t border-gray-50" : ""} ${i === 0 ? "bg-[rgba(255,214,0,0.04)]" : ""}`}><div className="flex items-center gap-2 mb-0.5"><span className="text-gray-400">{d.time}</span><span className="font-semibold text-gray-700">{d.location}</span></div><div className="text-gray-500">{d.detail}</div></div>))}</div>)}</div>);
}

export default function SampleDetailPage() {
  const params = useParams();
  const sampleData = MOCK_SAMPLES.find((s) => s.id === params.id) || MOCK_SAMPLES[0];
  const [sample, setSample] = useState(sampleData);
  const [promoUrl, setPromoUrl] = useState(sample.promoUrl || "");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(sample.messages || []);
  const [copied, setCopied] = useState(false);

  const promo = getPromoStatus(sample);
  const eventPromo = getEventPromoStatus(sample);
  const deadline = calcPromoDeadline(sample.shippedAt);
  const ddayText = formatDday(deadline);
  const hasTracking = !!sample.trackingNumber;
  const needsShipping = sample.status === "shipping_needed" && !sample.shipping;

  const lastReadBefore = sampleData.member_last_read_at || "1970-01-01";
  const unreadIds = new Set((sampleData.messages || []).filter((m) => m.sender_role === "admin" && m.created_at > lastReadBefore).map((m) => m.id));
  const firstUnreadId = (sampleData.messages || []).find((m) => m.sender_role === "admin" && m.created_at > lastReadBefore)?.id;
  const sendMessage = () => { if (!newMessage.trim()) return; setMessages((p) => [...p, { id: `m-${Date.now()}`, sender_role: "member", content: newMessage, created_at: new Date().toLocaleString("ko-KR") }]); setNewMessage(""); };
  const handleShippingSubmit = (data) => { setSample((p) => ({ ...p, shipping: data, status: "shipping_ready" })); alert("배송 정보가 저장되었습니다."); };

  const handlePromoSubmit = () => {
    if (!promoUrl.trim()) return;
    setSample((p) => ({ ...p, promoSubmitted: true, promoUrl: promoUrl.trim(), status: "completed" }));
    alert("홍보 URL이 제출되었습니다. 감사합니다!");
  };

  const handleEventPromo = () => {
    setSample((p) => ({ ...p, eventPromoSubmitted: true }));
    alert("행사장 홍보가 확인되었습니다! 제작 할인 혜택이 적용됩니다.");
  };

  const copyInfo = () => {
    const text = `[프리웍스 크리에이터 정보]\n\n작가명: ${MOCK_USER.artist_name}\n이메일: ${MOCK_USER.email}\nSNS: ${MOCK_USER.instagram || ""} ${MOCK_USER.twitter || ""}\n\n온라인 홍보: ${sample.promoSubmitted ? "완료" : "미완료"}\n행사장 홍보: ${sample.eventPromoSubmitted ? "완료" : "미완료"}\n\n샘플: ${sample.sample_number}\n상태: ${sample.status}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader><div className="flex items-center gap-2"><Logo /><span className="text-xs text-gray-300 ml-2">크리에이터</span></div><div className="flex items-center gap-3"><span className="text-[13px] text-gray-500">{MOCK_USER.artist_name}</span><div className="w-[30px] h-[30px] rounded-lg bg-black flex items-center justify-center"><span className="text-xs font-bold text-[#FFD600]">{MOCK_USER.artist_name.charAt(0)}</span></div></div></SiteHeader>
      <main className="max-w-[800px] mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 mb-6 text-[13px] text-gray-300"><Link href="/my" className="text-gray-400 no-underline font-medium">마이페이지</Link><span>›</span><span className="text-black font-semibold">{sample.sample_number}</span></div>
        <div className="flex justify-between items-start mb-7"><div><div className="text-xs text-gray-300 font-semibold">{sample.sample_number}</div><h1 className="text-[22px] font-extrabold text-black mt-1">{sample.product_description}</h1></div><StatusBadge status={sample.status} /></div>
        <div className="grid grid-cols-3 gap-2.5 mb-7">{[{ l:"제품군", v:sample.product_category==="acrylic"?"아크릴 굿즈":"DTF 스티커" }, { l:"데이터", v:sample.data_type==="artwork_only"?"그림만 있음":"완성 데이터" }, { l:"신청일", v:sample.created_at }].map((i, idx) => (<div key={idx} className="p-3.5 rounded-lg bg-[#f8f8f8]"><div className="text-[11px] text-gray-400 font-semibold mb-1">{i.l}</div><div className="text-[13px] font-semibold text-gray-700">{i.v}</div></div>))}</div>

        {needsShipping && (<div className="p-4 rounded-xl mb-5 bg-[#e1f5fe] border border-[#0277bd]/20 flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-[#0277bd] flex items-center justify-center flex-shrink-0"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 7L10 3L18 7V13L10 17L2 13V7Z"/><path d="M2 7L10 11L18 7"/><path d="M10 11V17"/></svg></div><div><div className="text-[13px] font-bold text-[#01579b]">배송 정보를 입력해 주세요</div></div></div>)}
        {needsShipping && <ShippingForm onSubmit={handleShippingSubmit} />}
        {sample.shipping && <ShippingInfo shipping={sample.shipping} />}
        {hasTracking && <DeliveryTracker trackingNumber={sample.trackingNumber} deliveryStatus={sample.deliveryStatus} deliveryConfirmedByAdmin={sample.deliveryConfirmedByAdmin} />}

        {/* 홍보 섹션 (출고 이후 표시) */}
        {sample.shippedAt && (
          <div className={`p-5 rounded-xl mb-5 border ${sample.promoSubmitted ? "border-green-200 bg-green-50/30" : "border-[#FFD600]/30 bg-[rgba(255,214,0,0.02)]"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-black flex items-center gap-2"><div className={`w-1 h-3.5 rounded ${sample.promoSubmitted ? "bg-[#2e7d32]" : "bg-[#FFD600]"}`} />온라인 홍보 <span className="text-[11px] font-normal text-gray-400">(필수)</span></h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: promo.color, background: promo.bg }}>{promo.text}</span>
                {!sample.promoSubmitted && ddayText && <span className={`text-[11px] font-bold ${ddayText.includes("초과") ? "text-[#c62828]" : "text-[#0277bd]"}`}>{ddayText}</span>}
              </div>
            </div>
            {!sample.promoSubmitted ? (
              <><p className="text-xs text-gray-400 mb-3">샘플을 홍보한 SNS 또는 온라인 채널 URL을 입력해 주세요.</p>
              <div className="flex gap-2 mb-2"><input type="url" value={promoUrl} onChange={(e) => setPromoUrl(e.target.value)} placeholder="홍보 URL (예: https://instagram.com/p/...)" className="flex-1 px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#FFD600]" /></div>
              <button onClick={handlePromoSubmit} disabled={!promoUrl.trim()} className={`px-6 py-2.5 text-[13px] font-bold rounded-lg ${promoUrl.trim() ? "text-black bg-[#FFD600] cursor-pointer" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}>홍보 완료</button></>
            ) : (
              <div className="text-[13px] text-green-700">✓ 홍보 완료: <a href={sample.promoUrl} target="_blank" rel="noopener" className="text-blue-600">{sample.promoUrl}</a></div>
            )}
          </div>
        )}

        {/* 행사장 홍보 (선택) */}
        {sample.shippedAt && (
          <div className={`p-5 rounded-xl mb-5 border ${sample.eventPromoSubmitted ? "border-green-200 bg-green-50/30" : "border-gray-100 bg-[#f8f8f8]"}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-black flex items-center gap-2"><div className={`w-1 h-3.5 rounded ${sample.eventPromoSubmitted ? "bg-[#2e7d32]" : "bg-gray-300"}`} />행사장 홍보 <span className="text-[11px] font-normal text-gray-400">(선택)</span></h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: eventPromo.color, background: eventPromo.bg }}>{eventPromo.text}</span>
            </div>
            {!sample.eventPromoSubmitted ? (
              <><p className="text-xs text-gray-400 mb-3">행사장에 QR 아크릴을 배치하고 사진을 찍어 제출하면, 프리웍스 제작 할인 혜택을 받으실 수 있습니다.</p>
              <button onClick={handleEventPromo} className="px-5 py-2 text-[13px] font-semibold text-gray-600 bg-gray-100 rounded-lg border-none cursor-pointer hover:bg-gray-200">행사 홍보 완료</button></>
            ) : (
              <div className="text-[13px] text-green-700">✓ 행사 홍보 완료 — 제작 할인 혜택이 적용됩니다</div>
            )}
          </div>
        )}

        {/* 본제작 문의 + 정보 복사 */}
        {sample.promoSubmitted && (
          <div className="flex gap-2.5 mb-5">
            <a href={`${INQUIRY_URL}?sample=${sample.sample_number}`} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#FFD600] no-underline font-bold text-[15px] text-black hover:shadow-lg">본 제작 문의하기</a>
            <button onClick={copyInfo} className="px-5 py-3.5 rounded-xl bg-black text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-gray-800">{copied ? "✓ 복사됨" : "정보 복사"}</button>
          </div>
        )}

        {/* 커뮤니케이션 */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-[#fafafa] flex justify-between items-center"><h3 className="text-sm font-bold text-black">작업 커뮤니케이션</h3>{unreadIds.size > 0 && <span className="text-[11px] text-[#a67c00] font-semibold">새 메시지 {unreadIds.size}건</span>}</div>
          <div className="p-5 max-h-[450px] overflow-y-auto">
            {messages.length === 0 ? (<p className="text-[13px] text-gray-300 text-center py-8">아직 메시지가 없습니다</p>) : (
              <div className="flex flex-col gap-3">{messages.map((msg) => { const isFirst = msg.id === firstUnreadId; const isUnread = unreadIds.has(msg.id); return (<div key={msg.id}>
                {isFirst && (<div className="flex items-center gap-2.5 my-1 mb-3 text-[11px] font-semibold text-[#a67c00]"><div className="flex-1 h-px bg-[rgba(255,214,0,0.3)]" /><span>새 메시지</span><div className="flex-1 h-px bg-[rgba(255,214,0,0.3)]" /></div>)}
                <div className={`flex ${msg.sender_role === "member" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed" style={{ background: msg.sender_role === "member" ? "#000" : isUnread ? "rgba(255,214,0,0.08)" : "#f4f4f4", color: msg.sender_role === "member" ? "#fff" : "#333", border: isUnread && msg.sender_role === "admin" ? "1px solid rgba(255,214,0,0.2)" : "none" }}>
                    <div className="mb-1">{msg.content}</div>
                    <div className={`text-[10px] text-right ${msg.sender_role === "member" ? "text-white/40" : "text-gray-400"}`}>{msg.sender_role === "admin" ? "프리웍스" : "나"} · {msg.created_at}</div>
                  </div>
                </div>
              </div>); })}</div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2"><input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="메시지를 입력하세요..." className="flex-1 px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none" /><button onClick={sendMessage} className="px-5 py-2.5 text-[13px] font-semibold text-white bg-black rounded-lg cursor-pointer">전송</button></div>
        </div>
      </main>
    </div>
  );
}
