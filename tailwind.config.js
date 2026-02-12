/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تفعيل الدارك مود اليدوي
  theme: {
    extend: {
      colors: {
        // الألوان الأساسية
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

        // ألوان الدارك مود (Night Palette - Slate)
        night: {
            bg: '#0f172a',      // خلفية الصفحة الغامقة (Slate-900)
            surface: '#1e293b', // خلفية الكروت والناف بار (Slate-800)
            text: '#e2e8f0',    // لون النص الفاتح (Slate-200)
            muted: '#94a3b8',   // لون النص الثانوي (Slate-400)
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