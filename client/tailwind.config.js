/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep evergreen — primary brand color.
        pine: {
          50:  '#eef7f2',
          100: '#d7ecdf',
          200: '#b0d9c2',
          300: '#7fbf9e',
          400: '#4da17a',
          500: '#2e8560',
          600: '#1f6b4c',
          700: '#1a563e',
          800: '#164534',
          900: '#11362a',
          950: '#0a231b',
        },
        // Warm amber — accent for CTAs and highlights.
        sun: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Warm neutrals for backgrounds and text.
        linen: {
          50:  '#fbfaf7',
          100: '#f4f2ec',
          200: '#e7e3d8',
          300: '#d4cfc0',
        },
        ink: {
          900: '#1b241f',
          700: '#3a463f',
          500: '#5f6b64',
          400: '#8a938d',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};
