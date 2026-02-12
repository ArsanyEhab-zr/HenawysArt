/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 👇 1. تفعيل الدارك مود اليدوي (عشان الزرار يشتغل)
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5e92b8', // لونك الأزرق الهادي
          dark: '#4a7594',
          light: '#89b3d3',
        },
        accent: {
          DEFAULT: '#ECC846', // الأصفر بتاعك
          dark: '#D4B03A',
          light: '#F4D866',
        },
        text: {
          DEFAULT: '#2C2C2C', 
          light: '#6B6B6B',
        },
        background: '#FFFFFF',
        
        // 👇 2. ألوان الدارك مود الجديدة (Slate Palette)
        // دي درجات كحلي غامق "Matte" ماشية جداً مع لونك الأساسي
        night: {
            bg: '#0f172a',      // (Slate-900) خلفية الصفحة
            surface: '#1e293b', // (Slate-800) خلفية الكروت والناف بار
            text: '#e2e8f0',    // (Slate-200) لون الكتابة (أبيض هادي مش فاقع)
            muted: '#94a3b8',   // (Slate-400) للكلام الثانوي
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