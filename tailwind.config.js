/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          950: '#050607',
          925: '#080a0d',
          900: '#0b0f12',
          850: '#0d1216',
          800: '#10151a',
          700: '#161c22',
          600: '#1e262d',
          500: '#2a343c',
        },
        neon: {
          DEFAULT: '#39ff8a',
          dim: '#1f8f52',
          deep: '#0f4a2c',
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
        line2: 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(57,255,138,0.35), 0 0 18px rgba(57,255,138,0.15)',
        'neon-sm': '0 0 0 1px rgba(57,255,138,0.28), 0 0 8px rgba(57,255,138,0.10)',
        cyan: '0 0 0 1px rgba(62,225,255,0.35), 0 0 18px rgba(62,225,255,0.12)',
        panel: '0 8px 24px -12px rgba(0,0,0,0.6)',
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
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        scan: 'scan 6s linear infinite',
        blink: 'blink 1.6s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        fadeUp: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};