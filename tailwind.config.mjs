/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // BOLD MODERN COLOR PALETTE
        brand: {
          pink: '#ec4899',
          purple: '#a855f7',
          orange: '#f97316',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        gradient: {
          start: '#ec4899', // Hot pink
          middle: '#8b5cf6', // Purple
          end: '#3b82f6', // Blue
        }
      },
      fontSize: {
        // LARGER TYPOGRAPHY
        'mega': '5rem',      // 80px
        'hero': '4rem',      // 64px
        'title': '3rem',     // 48px
        'subtitle': '1.5rem', // 24px
      },
      boxShadow: {
        // DRAMATIC SHADOWS
        'bold': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'mega': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
