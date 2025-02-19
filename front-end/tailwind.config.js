/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // tailwind의 다크모드
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        ring: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(30deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '75%': { transform: 'rotate(-30deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        ring: 'ring 1s linear infinite',
      },
    },
  },
  plugins: [],
}
