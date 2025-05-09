/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4a88eb',
          DEFAULT: '#3366cc',
          dark: '#254e9e',
        },
        secondary: {
          light: '#63b3ed',
          DEFAULT: '#4299e1',
          dark: '#2b6cb0',
        },
        background: {
          light: '#f7fafc',
          DEFAULT: '#edf2f7',
          dark: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} 