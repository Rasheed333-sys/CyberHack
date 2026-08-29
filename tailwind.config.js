/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#050706',
          900: '#0a0d0b',
          850: '#0d100e',
          800: '#111512',
          700: '#161b18',
          600: '#1d2320',
        },
        neon: {
          DEFAULT: '#39ff8a',
          dim: '#1f8f52',
          faint: 'rgba(57, 255, 138, 0.12)',
        },
        cyan: {
          DEFAULT: '#3ee1ff',
          dim: '#1c7d92',
        },
        warn: {
          DEFAULT: '#ff5c5c',
          amber: '#ffb84d',
        },
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(57,255,138,0.35), 0 0 18px rgba(57,255,138,0.15)',
        cyan: '0 0 0 1px rgba(62,225,255,0.35), 0 0 18px rgba(62,225,255,0.12)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(57,255,138,0.35)' },
          '100%': { boxShadow: '0 0 0 8px rgba(57,255,138,0)' },
        },
      },
      animation: {
        scan: 'scan 6s linear infinite',
        blink: 'blink 1.6s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};