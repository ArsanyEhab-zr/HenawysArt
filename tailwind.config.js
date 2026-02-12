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
        primary: { DEFAULT: '#5e92b8', dark: '#4a7594', light: '#89b3d3' },
        accent: { DEFAULT: '#ECC846', dark: '#D4B03A', light: '#F4D866' },
        text: { DEFAULT: '#2C2C2C', light: '#6B6B6B' },
        background: '#FFFFFF',
        
        // ألوان الدارك مود (Slate Palette)
        night: {
            bg: '#0f172a',      // Slate-900 (الخلفية)
            surface: '#1e293b', // Slate-800 (الناف بار والكروت)
            text: '#e2e8f0',    // Slate-200 (النص)
            muted: '#94a3b8',   // Slate-400 (النص الفرعي)
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