/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5e92b8', // لونك الأساسي
          dark: '#4a7594',    // درجة أغمق قليلًا (ممتازة للـ Hover)
          light: '#89b3d3',   // درجة أفتح (للخلفيات الخفيفة)
        },
        accent: {
          DEFAULT: '#ECC846',
          dark: '#D4B03A',
          light: '#F4D866',
        },
        text: {
          DEFAULT: '#2C2C2C',
          light: '#6B6B6B',
        },
        background: '#FFFFFF',
      },
      fontFamily: {
        script: ['Dancing Script', 'cursive'],
        body: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}