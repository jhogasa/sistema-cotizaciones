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
          50: '#effff2',
          100: '#dbfee8',
          200: '#a5f3c6',
          300: '#bbe9c6',
          400: '#abebcd',
          500: '#0aac89',
          600: '#005341',
          700: '#005341',
          800: '#005341',
          900: '#005341',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}