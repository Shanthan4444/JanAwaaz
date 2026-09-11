/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#F8F7F3',
        surface: '#FFFFFF',
        primary: '#D8D4C8',
        secondary: '#C8C3B5',
        accent: '#2F2F2F',
        success: '#6D8B74',
        warning: '#C9A86A',
        error: '#B56B6B',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_900Black', 'serif'],
        inter: ['Inter_400Regular', 'sans-serif'],
        'inter-bold': ['Inter_700Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
