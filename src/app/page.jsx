"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useInView() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(32px)", transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(255,255,255,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent", transition: "all 0.3s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFD600] rounded-md flex items-center justify-center">
            <span className="font-extrabold text-sm text-black">F</span>
          </div>
          <span className="font-bold text-[15px] text-black tracking-tight">FREEWORKS</span>
        </div>
        <nav className="flex items-center gap-8">
          <a href="#about" className="text-[13px] text-gray-500 no-underline font-medium hidden md:inline">프로그램 소개</a>
          <a href="#products" className="text-[13px] text-gray-500 no-underline font-medium hidden md:inline">제품</a>
          <a href="#process" className="text-[13px] text-gray-500 no-underline font-medium hidden md:inline">진행 과정</a>
          <Link href="/login" className="text-[13px] font-semibold text-gray-600 border border-gray-200 px-5 py-2 rounded-lg no-underline hover:border-gray-400 hover:text-black transition-all">로그인</Link>
          <Link href="/apply" className="text-[13px] font-semibold text-black bg-[#FFD600] px-5 py-2 rounded-lg no-underline hover:shadow-lg hover:-translate-y-0.5 transition-all">크리에이터 신청하기</Link>
        </nav>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,214,0,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div className="relative z-10 text-center max-w-[800px] px-6 py-24">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 bg-[rgba(255,214,0,0.12)] border border-[rgba(255,214,0,0.25)] rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
              <span className="text-xs text-[#FFD600] font-semibold tracking-wider">크리에이터 프로젝트</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
              그림만 보내주세요.<br /><span className="text-[#FFD600]">퀄리티</span>는 프리웍스가<br />완성합니다.
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-[clamp(15px,2vw,18px)] text-white/50 leading-relaxed max-w-[520px] mx-auto mb-10">
              컴퓨터 작업을 못해도 괜찮습니다.<br />프리웍스 전담 디자이너가 칼선, 보정, 데이터 작업까지<br />직접 완성해 드립니다.
            </p>
          </FadeIn>
          <FadeIn delay={0.55}>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/apply" className="text-[15px] font-bold text-black bg-[#FFD600] px-9 py-3.5 rounded-xl no-underline hover:shadow-[0_8px_24px_rgba(255,214,0,0.35)] hover:-translate-y-0.5 transition-all">크리에이터 신청하기</Link>
              <a href="#about" className="text-[15px] font-semibold text-white bg-white/[0.08] border border-white/[0.15] px-9 py-3.5 rounded-xl no-underline hover:bg-white/[0.14] transition-all">프로그램 알아보기</a>
            </div>
          </FadeIn>
          <FadeIn delay={0.7}>
            <div className="flex justify-center gap-10 mt-14">
              {[["월 4회", "무료 샘플 제작"], ["전담 디자이너", "작업 지원"], ["제작 할인", "혜택 제공"]].map(([t, b], i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-extrabold text-[#FFD600] mb-1">{t}</div>
                  <div className="text-xs text-white/40 font-medium">{b}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Value Props */}
      <section id="about" className="bg-white py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-[#FFD600] tracking-widest uppercase">WHY FREEWORKS</span>
              <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-black mt-3 tracking-tight">작가님은 그림에만 집중하세요</h2>
              <p className="text-[15px] text-gray-400 mt-3">나머지는 프리웍스가 알아서 해드립니다</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "그림만 보내주세요", desc: "완성 데이터가 없어도 괜찮습니다. 그림 자료만 보내주시면 됩니다." },
              { title: "전담 디자이너가 완성", desc: "프리웍스 전담 디자이너가 칼선 작업, 색보정, 인쇄 데이터까지 직접 작업하여 퀄리티를 높여드립니다." },
              { title: "완전 무료 샘플", desc: "승인된 크리에이터는 매월 4회 무료 샘플 제작이 가능합니다. 비용 부담 없이 굿즈를 경험하세요." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="p-9 rounded-2xl border border-gray-100 bg-[#fafafa] hover:border-[rgba(255,214,0,0.4)] hover:shadow-md transition-all h-full">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-[rgba(255,214,0,0.1)] flex items-center justify-center">
                    <div className="w-4 h-4 rounded bg-[#FFD600]" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2.5">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-[#f5f5f3] py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-[#FFD600] tracking-widest uppercase">PRODUCTS</span>
              <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-black mt-3 tracking-tight">샘플 제작 가능한 제품</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "아크릴 굿즈", desc: "아크릴 스탠드, 키링 등 다양한 아크릴 제품을 제작할 수 있습니다.", tags: ["아크릴 키링", "아크릴 스탠드", "아크릴 배지", "아크릴 마그넷", "아크릴 코롯토", "아크릴 그립톡", "아크릴 집게"] },
              { name: "DTF 스티커", desc: "고품질 DTF 인쇄 스티커를 제작합니다. 선명한 발색과 내구성이 특징입니다.", tags: ["커스텀 스티커"] },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
                  <div className="h-52 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center relative">
                    <span className="text-5xl font-black text-white/20 relative">{p.name}</span>
                  </div>
                  <div className="p-7">
                    <h3 className="text-[22px] font-extrabold text-black mb-2.5">{p.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{p.desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      {p.tags.map((tag, j) => (
                        <span key={j} className="text-[11px] font-semibold text-black bg-[rgba(255,214,0,0.15)] px-3 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Artwork Banner */}
      <section className="bg-black py-20 px-6 relative overflow-hidden">
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,214,0,0.08) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
        <FadeIn>
          <div className="max-w-[700px] mx-auto text-center relative">
            <h2 className="text-[clamp(24px,4vw,36px)] font-extrabold text-white leading-snug tracking-tight">
              컴퓨터 작업을 못해도<br /><span className="text-[#FFD600]">그림만 있으면</span> 신청할 수 있습니다
            </h2>
            <p className="text-[15px] text-white/50 leading-relaxed mt-5">
              신청 시 "그림만 있음" 옵션을 선택하면<br />프리웍스 전담 디자이너가 칼선, 색보정, 인쇄용 데이터 작업을 도와드립니다.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Process */}
      <section id="process" className="bg-white py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-[#FFD600] tracking-widest uppercase">PROCESS</span>
              <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-black mt-3 tracking-tight">진행 과정</h2>
              <p className="text-[15px] text-gray-400 mt-3">신청부터 본제작까지, 심플한 6단계로 진행됩니다</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["01", "크리에이터 신청", "신청서 작성 후 포트폴리오를 제출합니다"],
              ["02", "심사 및 승인", "프리웍스가 포트폴리오를 검토하고 승인합니다"],
              ["03", "샘플 제작 신청", "승인 후 월 4회 무료 샘플을 신청합니다"],
              ["04", "프리웍스 제작", "전담 디자이너가 작업하여 샘플을 제작합니다"],
              ["05", "홍보 및 완료", "샘플을 받아 SNS 홍보를 진행합니다"],
              ["06", "본제작 전환", "마음에 드시면 채널로 본제작을 문의합니다"],
            ].map(([num, title, desc], i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="p-7 rounded-xl border border-gray-100 bg-[#fafafa] relative overflow-hidden hover:border-[rgba(255,214,0,0.4)] transition-colors">
                  <span className="text-3xl font-black text-[rgba(255,214,0,0.15)] absolute top-3 right-4 leading-none">{num}</span>
                  <div className="text-[10px] font-bold text-[#FFD600] tracking-wider mb-2.5">STEP {num}</div>
                  <h3 className="text-base font-bold text-black mb-1.5">{title}</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black py-24 px-6 relative overflow-hidden">
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <FadeIn>
          <div className="max-w-[600px] mx-auto text-center relative">
            <h2 className="text-[clamp(28px,5vw,44px)] font-extrabold text-white leading-tight tracking-tight">
              지금 바로<br /><span className="text-[#FFD600]">크리에이터</span>로 신청하세요
            </h2>
            <p className="text-[15px] text-white/40 leading-relaxed mt-4 mb-9">
              심사 후 승인되면 안내 이메일을 보내드립니다.<br />승인된 크리에이터만 샘플 제작 혜택을 이용할 수 있습니다.
            </p>
            <Link href="/apply" className="inline-block text-base font-bold text-black bg-[#FFD600] px-12 py-4 rounded-xl no-underline hover:shadow-[0_8px_32px_rgba(255,214,0,0.3)] hover:-translate-y-0.5 transition-all">크리에이터 신청하기</Link>
            <p className="text-xs text-white/25 mt-4">
              이미 승인된 회원이신가요?{" "}
              <Link href="/login" className="text-[#FFD600] underline underline-offset-2">로그인</Link>
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] px-6 py-12 border-t border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-start flex-wrap gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#FFD600] rounded flex items-center justify-center"><span className="font-extrabold text-xs text-black">F</span></div>
                <span className="font-bold text-[13px] text-white">FREEWORKS</span>
              </div>
              <p className="text-xs text-white/30">그림만 보내주세요. 퀄리티는 프리웍스가 완성합니다.</p>
            </div>
            <div className="flex gap-10">
              <div>
                <div className="text-[11px] font-bold text-white/50 mb-3 tracking-wider">바로가기</div>
                <div className="flex flex-col gap-2">
                  <a href="#about" className="text-[13px] text-white/35 no-underline">프로그램 소개</a>
                  <a href="#products" className="text-[13px] text-white/35 no-underline">제품</a>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-white/50 mb-3 tracking-wider">문의</div>
                <div className="flex flex-col gap-2">
                  <Link href="/apply" className="text-[13px] text-white/35 no-underline">크리에이터 신청</Link>
                  <Link href="/login" className="text-[13px] text-white/35 no-underline">로그인</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-5 flex justify-between items-center">
            <span className="text-[11px] text-white/20">&copy; 2026 Freeworks. All rights reserved.</span>
            <span className="text-[11px] text-white/15">크리에이터 프로젝트</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
