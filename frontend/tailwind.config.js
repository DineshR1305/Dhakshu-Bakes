/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#F9F5EC',
          200: '#F3EAD8',
          300: '#E8D6B7',
          400: '#DABF92',
          500: '#CBA36D',
        },
        bakery: {
          light: '#FAF6EF',
          DEFAULT: '#8B4513',
          dark: '#2D1810',
          accent: '#D97706',
          caramel: '#C07D38',
          gold: '#E5A642',
          rose: '#D94862',
          chocolate: '#3E2723',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
