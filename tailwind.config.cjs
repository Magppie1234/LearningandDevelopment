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
        // Semantic status ramp — the ONLY status colours in the portal.
        // success = achieved/passed/completed · warning = at risk/approaching
        // danger = overdue/failed/critical · info = neutral progress/active
        // neutral = not started/inactive. Definitions in globals.css.
        success: {
          DEFAULT: 'rgb(var(--sem-success) / <alpha-value>)',
          bg: 'rgb(var(--sem-success-bg) / <alpha-value>)',
          fg: 'rgb(var(--sem-success-fg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--sem-warning) / <alpha-value>)',
          bg: 'rgb(var(--sem-warning-bg) / <alpha-value>)',
          fg: 'rgb(var(--sem-warning-fg) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--sem-danger) / <alpha-value>)',
          bg: 'rgb(var(--sem-danger-bg) / <alpha-value>)',
          fg: 'rgb(var(--sem-danger-fg) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--sem-info) / <alpha-value>)',
          bg: 'rgb(var(--sem-info-bg) / <alpha-value>)',
          fg: 'rgb(var(--sem-info-fg) / <alpha-value>)',
        },
        'sem-neutral': {
          DEFAULT: 'rgb(var(--sem-neutral) / <alpha-value>)',
          bg: 'rgb(var(--sem-neutral-bg) / <alpha-value>)',
          fg: 'rgb(var(--sem-neutral-fg) / <alpha-value>)',
        },
        // Theme-aware hairline / tint. Replaces the 467 hardcoded
        // rgba(0,59,70,x) values, which were invisible in dark mode.
        hairline: 'rgb(var(--rule) / <alpha-value>)',
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
        // "Warm Stone" — Kitchen Command Center palette (fixed across themes).
        // Copper accent intentionally reuses accent-copper above.
        stone: {
          charcoal: 'rgb(var(--stone-charcoal) / <alpha-value>)',
          espresso: 'rgb(var(--stone-espresso) / <alpha-value>)',
          brass: 'rgb(var(--stone-brass) / <alpha-value>)',
          sage: 'rgb(var(--stone-sage) / <alpha-value>)',
          ivory: 'rgb(var(--stone-ivory) / <alpha-value>)',
          ink: 'rgb(var(--stone-ink) / <alpha-value>)',
          // Hairlines and tints ON a stone surface. Replaces the literal
          // `white/N` these panels used to carry, which silently assumed the
          // surface beneath was dark.
          veil: 'rgb(var(--stone-veil) / <alpha-value>)',
        },
      },
      fontFamily: {
        // Display serif for headings (already loaded in layout.tsx). Elegant,
        // high-contrast — fits the premium Warm Stone look. Body stays Inter.
        serif: ['"Cormorant Garamond"', 'Georgia', 'ui-serif', 'serif'],
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
        // Restrained elevation ladder: cards barely lift, only overlays float.
        xs: '0 1px 2px 0 rgb(24 20 16 / 0.05)',
        card: '0 1px 2px rgb(24 20 16 / 0.04), 0 1px 3px rgb(24 20 16 / 0.06)',
        raised: '0 2px 4px rgb(24 20 16 / 0.05), 0 4px 12px rgb(24 20 16 / 0.07)',
        elevated: '0 8px 24px rgb(24 20 16 / 0.12), 0 2px 6px rgb(24 20 16 / 0.06)',
        inner: 'inset 0 2px 4px rgb(24 20 16 / 0.04)',
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
