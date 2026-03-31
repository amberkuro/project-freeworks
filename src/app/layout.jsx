import "./globals.css";

export const metadata = {
  title: "프리웍스 크리에이터 프로젝트",
  description: "그림만 보내주세요. 퀄리티는 프리웍스가 완성합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
