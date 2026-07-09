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
          50:  '#fdfdfc',   // page background (near white)
          100: '#f7f7f4',   // card backdrop / hover
          200: '#ebebe5',   // borders, dividers
          300: '#dcdcd3',   // strong border
          400: '#c2c2b6',
        },
        ink: {
          950: '#152522',
          900: '#22403b',   // headings, primary text (deep teal slate)
          700: '#3f5a55',   // body strong
          500: '#68807b',   // muted body
          400: '#94a5a1',   // captions
        },
        // brand teal, matched to the logo (#17877B → #0E5E56)
        sage: {
          50:  '#edf6f4',
          100: '#d8ece9',
          200: '#b2dbd5',
          300: '#7fc2b9',
          400: '#45a397',
          500: '#17877b',   // primary accent (logo gradient top)
          600: '#11726a',   // hover / CTAs
          700: '#0e5e56',   // logo gradient bottom
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
        'sage-gradient': 'linear-gradient(135deg, #17877b 0%, #0e5e56 100%)',
        'cream-gradient': 'linear-gradient(180deg, #fdfdfc 0%, #f7f7f4 100%)',
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
