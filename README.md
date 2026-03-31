# 프리웍스 크리에이터 프로젝트

그림만 보내주세요. 퀄리티는 프리웍스가 완성합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/apply` | 크리에이터 신청 |
| `/login` | 로그인 (→ 마이페이지 이동) |
| `/my` | 승인 회원 마이페이지 |
| `/my/samples/new` | 새 샘플 신청 |
| `/my/samples/:id` | 샘플 상세 (커뮤니케이션, 홍보 URL, 본제작 문의) |
| `/admin` | 관리자 페이지 |

## 기술 스택

- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3
- 더미 데이터 (Supabase 연동 전)

## Vercel 배포

```bash
npm i -g vercel
vercel
```

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.jsx          # 루트 레이아웃
│   ├── page.jsx            # 랜딩 페이지
│   ├── globals.css
│   ├── apply/page.jsx      # 크리에이터 신청
│   ├── login/page.jsx      # 로그인
│   ├── my/
│   │   ├── page.jsx        # 마이페이지
│   │   └── samples/
│   │       ├── new/page.jsx    # 새 샘플 신청
│   │       └── [id]/page.jsx   # 샘플 상세
│   └── admin/page.jsx      # 관리자
├── components/
│   └── ui.jsx              # 공통 컴포넌트
└── lib/
    ├── constants.js         # 상수
    └── mock-data.js         # 더미 데이터
```
