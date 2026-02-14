/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          pink: '#f472b6',
          green: '#10b981',
          indigo: '#6366f1',
        },
        space: {
          950: '#030712', // Deep near black
          900: '#0f172a', // Deep slate
          800: '#1e293b',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          surface: 'rgba(255, 255, 255, 0.03)',
        }
      },
      letterSpacing: {
        tightest: '-.05em',
        widest: '.2em',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
};
