const path = require('path')

// Absolute, forward-slash glob so fast-glob resolves it regardless of the
// process CWD (the dev server is launched from a parent folder).
const srcGlob = path
  .join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')
  .replace(/\\/g, '/')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [srcGlob],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Theme-aware tokens (light values + .dark "Obsidian" overrides live
        // in globals.css as RGB triplets so /opacity modifiers keep working).
        parchment: 'rgb(var(--m-parchment) / <alpha-value>)',
        cream: 'rgb(var(--m-cream) / <alpha-value>)',
        ink: {
          primary: 'rgb(var(--m-ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--m-ink-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--m-ink-tertiary) / <alpha-value>)',
        },
        // §4 copper/silver accent duo (SilverStone story). Copper = primary
        // actions/active/progress; silver = certified/complete/secondary.
        'accent-copper': 'rgb(var(--m-accent-copper) / <alpha-value>)',
        'accent-silver': 'rgb(var(--m-accent-silver) / <alpha-value>)',
        // DEPRECATED alias — resolves to copper; prefer accent-copper in new code.
        'accent-gold': 'rgb(var(--m-accent-gold) / <alpha-value>)',
        'surface-blue': '#d8c4a8',
        'surface-olive': '#a89373',
        'surface-beige': '#c2b59b',
        'surface-warm': 'rgb(var(--m-surface-warm) / <alpha-value>)',
        'surface-dark': '#2c1f14',
        'surface-sage': '#9c8159',
        'surface-rose': '#c4a48c',
        'surface-gold': '#d4b88a',
        'surface-cream': 'rgb(var(--m-cream) / <alpha-value>)',
        'surface-mid': '#8a6f52',
        'surface-light': '#d8c9b0',
      },
      fontFamily: {
        serif: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: 'calc(var(--radius) - 6px)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 4px 20px rgba(0, 59, 70, 0.08)',
        elevated: '0 8px 30px rgba(0, 59, 70, 0.12)',
        inner: 'inset 0 2px 4px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ticker-scroll-vertical': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        ticker: 'ticker-scroll 40s linear infinite',
        'ticker-vertical': 'ticker-scroll-vertical 25s linear infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
