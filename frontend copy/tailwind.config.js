/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // Enables dark: prefix
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#EFF6FF', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        accent: { 50: '#FAF5FF', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9' },
        highlight: { 500: '#10B981', 600: '#059669' },  // Emerald/teal for CTAs
        bgDark: '#0F172A',  // Slate 950 for dark bg
        card: { DEFAULT: '#F8FAFC', dark: '#1E293B' },  // Light/dark cards
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'social': '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
      }
    },
  },
  plugins: [],
}
