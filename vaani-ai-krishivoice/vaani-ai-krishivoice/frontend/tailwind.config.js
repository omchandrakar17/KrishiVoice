/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vaani: {
          bg: '#0a0e12',
          surface: '#111823',
          card: '#151d2b',
          border: '#232f42',
          primary: '#22c55e',
          primaryDark: '#15803d',
          accent: '#f59e0b',
          accent2: '#38bdf8',
          text: '#e6edf3',
          muted: '#8b98a9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 20% 20%, rgba(34,197,94,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(56,189,248,0.15) 0px, transparent 50%), radial-gradient(at 50% 90%, rgba(245,158,11,0.12) 0px, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4,0,0.6,1) infinite',
        float: 'float 6s ease-in-out infinite',
        'wave-bar': 'wave-bar 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'wave-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
