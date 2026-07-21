import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lifted dark: deep indigo-slate surfaces (not near-black), so the site
        // reads richer and brighter while staying "engineer".
        ink: {
          950: '#0d1526', // page background
          900: '#141d33', // card surface
          800: '#1c2842', // raised / hover
          700: '#283452', // border-ish
        },
        // Dual accent → a cyan-to-violet gradient is the brand signature.
        accent: {
          DEFAULT: '#38bdf8',
          muted: '#0ea5e9',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          amber: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.15), 0 8px 40px -12px rgba(56,189,248,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
