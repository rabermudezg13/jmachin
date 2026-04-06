/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f8',
          100: '#dbe8f5',
          600: '#1e4d8c',
          700: '#1a3f75',
          800: '#16325e',
          900: '#1e3a5f',
        },
      },
    },
  },
  plugins: [],
}
