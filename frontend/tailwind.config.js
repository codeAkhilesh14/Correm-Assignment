/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#d9e5ff',
          200: '#bcd2ff',
          300: '#90b4ff',
          400: '#5d8eff',
          500: '#3362fc', // Primary Fintech Blue
          600: '#1e3ffa',
          700: '#142be6',
          800: '#1224bc',
          900: '#152494',
        },
        darkbg: {
          50: '#1a1f2c',
          100: '#121620',
          200: '#0a0d14',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
