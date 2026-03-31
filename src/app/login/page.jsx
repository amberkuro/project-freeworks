"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        setLoading(false);
        return;
      }

      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/my");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      <div className="hidden md:flex flex-col justify-center w-[420px] bg-black p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,214,0,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#FFD600] rounded-lg flex items-center justify-center">
              <span className="font-extrabold text-base text-black">F</span>
            </div>
            <span className="font-bold text-[15px] text-white">FREEWORKS</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-white leading-snug">크리에이터<br />프로젝트</h1>
          <p className="text-sm text-white/40 mt-4 leading-relaxed">승인된 크리에이터 및 관리자 전용 로그인입니다.</p>
          <div className="mt-10 flex gap-6">
            {[["월 4회", "무료 샘플"], ["전담", "디자이너"], ["할인", "혜택"]].map(([t, b], i) => (
              <div key={i}>
                <div className="text-base font-extrabold text-[#FFD600]">{t}</div>
                <div className="text-[11px] text-white/30 mt-0.5">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 bg-[#FFD600] rounded-md flex items-center justify-center">
              <span className="font-extrabold text-sm text-black">F</span>
            </div>
            <span className="font-bold text-[15px] text-black">FREEWORKS</span>
          </div>

          <h2 className="text-2xl font-extrabold text-black mb-2">로그인</h2>
          <p className="text-sm text-gray-400 mb-8">관리자 또는 승인된 크리에이터 계정으로 로그인해 주세요.</p>

          {error && (
            <div className="px-4 py-3 rounded-xl mb-5 bg-red-50 border border-red-100 text-[13px] text-red-700 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#c62828" strokeWidth="1.5"/>
                <path d="M8 5V8.5" stroke="#c62828" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#c62828"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일을 입력하세요"
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#FFD600] transition-colors" />
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">비밀번호</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력"
                  className="w-full px-3.5 py-3 pr-11 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#FFD600] transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    {showPassword ? (
                      <><path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="#bbb" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="#bbb" strokeWidth="1.5"/></>
                    ) : (
                      <><path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#bbb" strokeWidth="1.5"/><path d="M3 3L17 17" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-3.5 text-[15px] font-bold text-black bg-[#FFD600] rounded-xl border-none cursor-pointer transition-all ${loading ? "opacity-60 cursor-wait" : "hover:shadow-lg"}`}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-8 p-5 rounded-xl bg-[#f5f5f3] border border-gray-100 text-center">
            <p className="text-[13px] text-gray-500">아직 계정이 없으신가요?</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">크리에이터 신청 후 승인되면 로그인할 수 있습니다.</p>
            <Link href="/apply" className="inline-block px-6 py-2.5 text-[13px] font-semibold text-white bg-black rounded-lg no-underline">크리에이터 신청하기</Link>
          </div>

          <div className="text-center mt-5">
            <Link href="/" className="text-[13px] text-gray-400 no-underline hover:text-gray-600">← 홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
