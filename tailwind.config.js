/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A8BFF',    // brighter blue (vibrant, more saturated)
        secondary: '#1A2A4A',  // brighter navy blue (deeper but more vibrant)
        bg: '#F5F0E8',         // dirty white (warm, slightly off-white/cream)
      },
      fontFamily: {
        sans: ['Cherry Bomb One', 'system-ui', 'sans-serif'],
        heading: ['Cherry Bomb One', 'sans-serif'],
      },
    },
  },
  plugins: [],
}