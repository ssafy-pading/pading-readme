/** @type {import('tailwindcss').Config} */
export default {
  darkMode : 'class', // tailwind의 다크모드
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}