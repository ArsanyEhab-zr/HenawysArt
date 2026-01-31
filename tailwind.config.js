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
          DEFAULT: '#6da3c2',
          dark: '#5a8ba8',
          light: '#80b4d4',
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
