/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0D0D0F', light: '#161618', dark: '#080809', '50': '#1a1a1d' },
        secondary: { DEFAULT: '#00bf63', light: '#33d480', dark: '#009e52' },
        accent: { purple: '#8b5cf6', blue: '#3b82f6', pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
