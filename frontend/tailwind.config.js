/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // src 폴더 내의 모든 JS, JSX, TS, TSX 파일
    "./public/index.html", // public/index.html도 포함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
