/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Education SaaS Brand Colors (Emerald / Mint / Sage)
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Backward-compatible pastel design tokens mapped to cohesive emerald/warm palette
        pastel: {
          mint: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
          },
          sky: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0284C7',
            600: '#0369A1',
          },
          yellow: {
            50: '#FEFCE8',
            100: '#FEF9C3',
            200: '#FEF08A',
            300: '#FDE047',
            400: '#FACC15',
            500: '#EAB308',
          },
          peach: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
          },
          coral: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444',
          },
          lavender: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
          },
          warm: {
            white: '#F8FAFC',
            card: '#FFFFFF',
            border: '#E2E8F0',
            subtle: '#F1F5F9',
          }
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Inter', 'system-ui', 'sans-serif'],
        math: ['Prompt', 'Cambria Math', 'serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'pastel-sm': '0 1px 3px 0 rgba(5, 150, 105, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'pastel-md': '0 4px 16px -2px rgba(5, 150, 105, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'pastel-lg': '0 10px 25px -5px rgba(5, 150, 105, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'pastel-hover': '0 12px 28px -4px rgba(5, 150, 105, 0.16), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      }
    },
  },
  plugins: [],
}

