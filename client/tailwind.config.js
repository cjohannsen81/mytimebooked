/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Zilla Slab"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      // "Service Slip" palette — an old carbon-copy work-order pad:
      // aged paper surfaces, green-black ink, rubber-stamp accents,
      // and triplicate-form carbon tints for statuses.
      colors: {
        paper: {
          50:  '#fcfaf2',   // top sheet
          100: '#f4efdf',   // page background
          200: '#e7dfc6',   // borders, dividers
          300: '#d5c9a6',   // strong border
          400: '#b8a97e',   // aged edge
        },
        ink: {
          950: '#181d18',
          900: '#242b23',   // primary ink
          700: '#3e4739',
          500: '#68705f',   // faded ink
          400: '#8d9184',   // pencil
        },
        stamp: {
          red:   '#b23a2a',
          green: '#2f7d4e',
          amber: '#a86f0f',
          blue:  '#2b5f9e',
        },
        carbon: {
          canary: '#f7ecc2', // pending copy
          mint:   '#dcead4', // confirmed copy
          sky:    '#d9e5ef', // completed copy
          rose:   '#f3d8d0', // void copy
        },
      },
      boxShadow: {
        // Letterpress offset — buttons and slips sit ON the paper.
        press: '3px 3px 0 0 #242b23',
        'press-sm': '2px 2px 0 0 #242b23',
        sheet: '0 1px 2px rgba(36,43,35,0.08), 0 6px 16px -8px rgba(36,43,35,0.25)',
      },
      keyframes: {
        stampIn: {
          '0%':   { opacity: 0, transform: 'scale(1.9) rotate(-14deg)' },
          '55%':  { opacity: 1, transform: 'scale(0.92) rotate(-3deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(-4deg)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        stamp: 'stampIn 0.35s cubic-bezier(0.2, 1.4, 0.4, 1) both',
        rise: 'rise 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
