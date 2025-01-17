/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // src 폴더 내의 모든 JS, JSX, TS, TSX 파일
    "./public/index.html", // public/index.html도 포함
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "Arial", "sans-serif"], // 기본 sans-serif 계열
      },
    },
  },
  plugins: [],
};
