/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        paper: '#f8f5f0',
        olive: '#7a8266',
        textMain: '#5a564e',
      }
    },
  },
  plugins: [],
}