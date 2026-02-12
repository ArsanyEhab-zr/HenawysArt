/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تفعيل الدارك مود
  theme: {
    extend: {
      colors: {
        // الألوان الأساسية (ثابتة)
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
        // الألوان المتغيرة (تتغير حسب الثيم)
        text: {
          DEFAULT: '#2C2C2C',
          light: '#6B6B6B',
        },
        background: '#FFFFFF',

        // 👇👇 ربطنا الألوان بمتغيرات CSS اللي عرفناها فوق 👇👇
        night: {
            bg: 'var(--night-bg)', 
            surface: 'var(--night-surface)',
            text: 'var(--night-text)',
            muted: 'var(--night-muted)',
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