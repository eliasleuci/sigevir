/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sigevir: {
          navy: "#1B2A3B",
          blue: "#2E75B6",
          light: "#F4F7FA",
          dark: "#101820",
          accent: "#3B82F6",
          danger: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      breakpoints: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}
