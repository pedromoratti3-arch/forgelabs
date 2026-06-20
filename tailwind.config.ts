import type { Config } from 'tailwindcss';

/**
 * Forgelabs design system — locked tokens.
 * Palette, type scale and easings are mirrored from the production briefing.
 * Treat these as the single source of truth; do not introduce ad-hoc hex values.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0D0A0C', // fundo base — quase preto, leve calor
        surface: '#161214', // superfície elevada
        primary: '#DB2777', // marca / rosa primário
        accent: '#F472B6', // rosa acento / brilho
        ice: '#F5F0F2', // branco-gelo (texto)
        muted: '#A89CA2', // texto secundário
        line: 'rgba(245,240,242,0.08)', // linhas / bordas
      },
      fontFamily: {
        // Títulos: Clash Display (display geométrica de forte presença), via Fontshare
        display: ['var(--font-display)', 'Clash Display', 'Satoshi', 'system-ui', 'sans-serif'],
        // Corpo / UI: Satoshi (sans geométrica moderna), via Fontshare
        sans: ['var(--font-sans)', 'Satoshi', 'system-ui', 'sans-serif'],
        // Detalhe técnico / labels: monospace (JetBrains Mono)
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Calibrada para caber com folga em telas curtas (ex.: 1280×632) e crescer no desktop.
        'hero': ['clamp(2rem, 4vw, 4.5rem)', { lineHeight: '1.02', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['clamp(1.6rem, 3.4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'lead': ['clamp(1.05rem, 1.7vw, 1.45rem)', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      letterSpacing: {
        label: '0.2em',
      },
      maxWidth: {
        grid: '1440px',
      },
      spacing: {
        gutter: '24px',
        margin: 'clamp(1.5rem, 5vw, 6rem)',
      },
      transitionTimingFunction: {
        // Curvas-alma do briefing
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)', // entradas — "expo out", caro
        'expo-in': 'cubic-bezier(0.7, 0, 0.84, 0)', // saídas / transições
      },
      keyframes: {
        'scroll-pulse': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(6px)', opacity: '1' },
        },
        'ember-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.15)' },
        },
      },
      animation: {
        'scroll-pulse': 'scroll-pulse 2s cubic-bezier(0.16,1,0.3,1) infinite',
        'ember-pulse': 'ember-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
