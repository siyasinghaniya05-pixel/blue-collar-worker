/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#030712',
        },
        tier: {
          basic: '#10B981',   // Green Level 1
          skilled: '#3B82F6', // Blue Level 2
          expert: '#8B5CF6',  // Purple Level 3
          master: '#F59E0B',  // Amber/Gold Level 4
        }
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
