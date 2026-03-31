"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";

/**
 * /auth/callback
 *
 * Supabase 초대 메일 링크 클릭 후 리다이렉트되는 페이지
 *
 * 흐름:
 * 1. Supabase JS가 URL 해시 토큰을 자동 처리 → 세션 생성
 * 2. 비밀번호 설정 폼 표시
 * 3. updateUser({ password }) → 비밀번호 저장
 * 4. POST /api/auth/login → fw_auth 쿠키 생성
 * 5. /my 로 이동
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [step, setStep] = useState("loading"); // loading | set-password | success | error
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Supabase 연결 실패");
      setStep("error");
      return;
    }

    // Supabase JS가 URL 해시의 토큰을 자동 감지하여 세션을 생성
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (sess) {
          setSession(sess);
          setStep("set-password");
        }
      }
    );

    // 이미 세션이 있는 경우 (해시 처리 완료 후)
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (existing) {
        setSession(existing);
        setStep("set-password");
      } else {
        // 잠시 대기 후에도 세션 없으면 에러
        setTimeout(() => {
          setStep((prev) => {
            if (prev === "loading") return "error";
            return prev;
          });
          setError("초대 링크가 유효하지 않거나 만료되었습니다. 관리자에게 재초대를 요청해 주세요.");
        }, 5000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = getBrowserSupabase();

      // ─── 1. Supabase Auth 비밀번호 설정 ───
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(`비밀번호 설정 실패: ${updateError.message}`);
        setSubmitting(false);
        return;
      }

      // ─── 2. fw_auth 쿠키 생성 (앱 인증 시스템 연동) ───
      const email = session.user.email;
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        // 쿠키 생성 실패해도 비밀번호는 이미 설정됨 → 로그인 페이지로 안내
        setStep("success");
        return;
      }

      // ─── 3. /my 로 이동 ───
      router.push("/my");
    } catch (err) {
      setError(`오류가 발생했습니다: ${err.message}`);
      setSubmitting(false);
    }
  };

  // ─── 로딩 ───
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-[#FFD600] rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="font-extrabold text-base text-black">F</span>
          </div>
          <p className="text-sm text-gray-400">초대 링크를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // ─── 에러 ───
  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="font-extrabold text-base text-red-500">!</span>
          </div>
          <h2 className="text-lg font-bold text-black mb-2">링크 오류</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 text-sm font-semibold text-white bg-black rounded-lg no-underline"
          >
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  // ─── 비밀번호 설정 완료 (쿠키 생성 실패 시 폴백) ───
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="font-extrabold text-base text-green-600">✓</span>
          </div>
          <h2 className="text-lg font-bold text-black mb-2">비밀번호 설정 완료!</h2>
          <p className="text-sm text-gray-500 mb-6">
            이제 이메일과 비밀번호로 로그인할 수 있습니다.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 text-sm font-bold text-black bg-[#FFD600] rounded-lg no-underline"
          >
            로그인하기
          </a>
        </div>
      </div>
    );
  }

  // ─── 비밀번호 설정 폼 ───
  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* 좌측 패널 (md 이상) */}
      <div className="hidden md:flex flex-col justify-center w-[420px] bg-black p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,214,0,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#FFD600] rounded-lg flex items-center justify-center">
              <span className="font-extrabold text-base text-black">F</span>
            </div>
            <span className="font-bold text-[15px] text-white">FREEWORKS</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-white leading-snug">
            환영합니다!
          </h1>
          <p className="text-sm text-white/40 mt-4 leading-relaxed">
            크리에이터로 승인되셨습니다.<br />
            비밀번호를 설정하면 바로 시작할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 bg-[#FFD600] rounded-md flex items-center justify-center">
              <span className="font-extrabold text-sm text-black">F</span>
            </div>
            <span className="font-bold text-[15px] text-black">FREEWORKS</span>
          </div>

          <h2 className="text-2xl font-extrabold text-black mb-2">
            비밀번호 설정
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {session?.user?.email} 계정의 비밀번호를 설정해 주세요.
          </p>

          {error && (
            <div className="px-4 py-3 rounded-xl mb-5 bg-red-50 border border-red-100 text-[13px] text-red-700 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#c62828" strokeWidth="1.5" />
                <path d="M8 5V8.5" stroke="#c62828" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="#c62828" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSetPassword}>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상 입력"
                  className="w-full px-3.5 py-3 pr-11 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#FFD600] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    {showPassword ? (
                      <>
                        <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="#bbb" strokeWidth="1.5" />
                        <circle cx="10" cy="10" r="3" stroke="#bbb" strokeWidth="1.5" />
                      </>
                    ) : (
                      <>
                        <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#bbb" strokeWidth="1.5" />
                        <path d="M3 3L17 17" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                비밀번호 확인
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력"
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#FFD600] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 text-[15px] font-bold text-black bg-[#FFD600] rounded-xl border-none cursor-pointer transition-all ${
                submitting ? "opacity-60 cursor-wait" : "hover:shadow-lg"
              }`}
            >
              {submitting ? "설정 중..." : "비밀번호 설정하고 시작하기"}
            </button>
          </form>

          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-[13px] text-gray-400 no-underline hover:text-gray-600"
            >
              이미 비밀번호를 설정하셨나요? 로그인하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
