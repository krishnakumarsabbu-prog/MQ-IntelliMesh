/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0B1020',
          800: '#0F172A',
          700: '#111827',
          600: '#1E293B',
          500: '#334155',
          400: '#475569',
        },
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        emerald: {
          DEFAULT: '#10B981',
          400: '#34D399',
          500: '#10B981',
        },
        amber: {
          DEFAULT: '#F59E0B',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        rose: {
          DEFAULT: '#EF4444',
          400: '#F87171',
          500: '#EF4444',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
