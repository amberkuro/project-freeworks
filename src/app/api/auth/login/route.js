import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  validateCredentials,
  createAuthToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/auth/login
 *
 * 이중 인증:
 *   1차) 관리자 계정 확인 (기존 환경변수 기반 — 변경 없음)
 *   2차) Supabase Auth signInWithPassword (승인된 크리에이터)
 *
 * 관리자 인증이 항상 먼저 실행되므로 기존 관리자 로그인은 영향 없음
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════
    // 1. 관리자 인증 (기존 방식 — 완전히 동일)
    // ════════════════════════════════════════
    const adminResult = validateCredentials(email, password);

    if (adminResult.success) {
      const token = createAuthToken(adminResult.user);
      const response = NextResponse.json({
        success: true,
        user: adminResult.user,
      });
      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    // ════════════════════════════════════════
    // 2. 크리에이터 인증 (Supabase Auth)
    // ════════════════════════════════════════
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Supabase 미설정 → 관리자 인증 실패와 동일한 메시지
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // signInWithPassword는 ANON_KEY로 호출해야 함
    // getSupabase() 싱글톤은 SERVICE_ROLE_KEY를 사용하므로 별도 클라이언트 생성
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.signInWithPassword({ email, password });

    if (authError || !authData?.user) {
      // 관리자도 아니고 Supabase Auth도 실패 → 최종 401
      console.log(
        `[로그인 실패] ${email}:`,
        authError?.message || "인증 실패"
      );
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // ════════════════════════════════════════
    // 3. applications 테이블에서 작가 정보 조회
    // ════════════════════════════════════════
    let artistName = email;
    let artistData = {};

    const supabase = getSupabase();
    if (supabase) {
      const { data: appRow } = await supabase
        .from("applications")
        .select("name, email, category, description, instagram, twitter")
        .eq("email", email)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (appRow) {
        artistName = appRow.name || email;
        artistData = {
          instagram: appRow.instagram || "",
          twitter: appRow.twitter || "",
          product_category: appRow.category || "",
        };
      }
    }

    // ════════════════════════════════════════
    // 4. fw_auth 쿠키 생성 (member role)
    // ════════════════════════════════════════
    const memberUser = {
      email,
      role: "member",
      name: artistName,
      artist_name: artistName,
      supabase_uid: authData.user.id,
      ...artistData,
    };

    const token = createAuthToken(memberUser);
    const response = NextResponse.json({
      success: true,
      user: memberUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    console.log(`[로그인 성공] 크리에이터: ${artistName} (${email})`);
    return response;
  } catch (err) {
    console.error("로그인 에러:", err);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
