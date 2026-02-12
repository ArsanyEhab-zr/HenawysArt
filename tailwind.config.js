/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 👇 ده اللي بيشغل الدارك مود
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // ألوانك الأساسية
        primary: {
          DEFAULT: '#5e92b8',
          dark: '#4a7594',
          light: '#89b3d3',
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

        // 👇👇 دي "التأليفة" بتاعتنا اللي ناقصة عندك 👇👇
        night: {
            bg: '#0f172a',      // لون الخلفية الكحلي
            surface: '#1e293b', // لون الكروت
            text: '#e2e8f0',    // لون النص الأبيض
            muted: '#94a3b8',   // لون النص الثانوي
        }
      },
      fontFamily: {
        script: ['Dancing Script', 'cursive'],
        body: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}