import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-overlay': 'var(--bg-overlay)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg': ['17px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      maxWidth: {
        app: '430px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        'glow-accent': 'var(--glow-accent)',
        'glow-accent-sm': 'var(--glow-accent-sm)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
      },
    },
  },
  plugins: [],
};

export default config;
