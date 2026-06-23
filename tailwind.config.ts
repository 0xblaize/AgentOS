import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent — used sparingly (logo, focus ring, status dot).
        acid: '#c8ff00',
        // Institutional dashboard palette. Slate-tinted blacks beat pure #000;
        // they read like a Bloomberg terminal instead of a CRT.
        surface: {
          0: '#0b0d12', // root
          1: '#13161d', // panel
          2: '#1a1e27', // card / row hover
          3: '#23283238', // border-ish overlay
        },
        ink: {
          DEFAULT: '#e2e6ee',
          dim: '#9aa3b2',
          mute: '#5b6371',
        },
        line: 'rgba(255,255,255,0.06)',
        profit: '#34d399',
        loss: '#fb7185',
        warn: '#fbbf24',
        info: '#7dd3fc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        acid: '0 0 80px rgba(200,255,0,0.25)',
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
