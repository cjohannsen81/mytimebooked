/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // mono kept as a token name from the Service Slip era; it now
        // resolves to the same clean sans so old markup stays smooth.
        mono: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Token names kept from the Service Slip design so existing markup
      // keeps working, but the values now resolve to the clean & smooth
      // palette: warm cream surfaces, soft sage accents, green-slate text.
      colors: {
        paper: {
          50:  '#fbfaf6',   // page background (warm cream)
          100: '#f4f1ea',   // card backdrop / hover
          200: '#e8e3d7',   // borders, dividers
          300: '#d7d1c0',   // strong border
          400: '#b9b2a0',
        },
        ink: {
          950: '#1f2924',
          900: '#2d3a34',   // headings, primary text (green slate)
          700: '#46564e',   // body strong
          500: '#6d7a72',   // muted body
          400: '#98a19a',   // captions
        },
        sage: {
          50:  '#f0f5f1',
          100: '#e2ede6',
          200: '#c8dcd0',
          300: '#a5c5b3',
          400: '#83ad96',
          500: '#68967e',   // primary accent
          600: '#54806a',   // hover / CTAs
          700: '#446856',
        },
        // status hues (soft)
        stamp: {
          red:   '#c96f5f',
          green: '#54806a',
          amber: '#b3873d',
          blue:  '#6f8fa8',
        },
        carbon: {
          canary: '#f6eedb',   // pending
          mint:   '#e2ede6',   // confirmed
          sky:    '#e4ecf1',   // completed
          rose:   '#f5e4df',   // cancelled
        },
      },
      backgroundImage: {
        'sage-gradient': 'linear-gradient(135deg, #68967e 0%, #54806a 100%)',
        'cream-gradient': 'linear-gradient(180deg, #fbfaf6 0%, #f4f1ea 100%)',
      },
      boxShadow: {
        press: '0 12px 32px -14px rgba(45,58,52,.28)',
        'press-sm': '0 4px 14px -6px rgba(45,58,52,.18)',
        sheet: '0 1px 2px rgba(45,58,52,.05), 0 8px 24px -14px rgba(45,58,52,.14)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        'fade-in': 'fadeIn 0.6s ease-out both',
        // legacy name from the slip era — now a gentle rise
        stamp: 'rise 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
