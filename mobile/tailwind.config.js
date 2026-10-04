/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        background: 'var(--background)',

        surface: {
          DEFAULT: 'var(--surface)',
          subtle: 'var(--surface-subtle)',
          elevated: 'var(--surface-elevated)',
        },

        foreground: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--muted-foreground)',
          subtle: 'var(--subtle-foreground)',
          inverse: 'var(--inverse-foreground)',
        },

        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          subtle: 'var(--primary-subtle)',
          foreground: 'var(--primary-foreground)',
        },

        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
          foreground: 'var(--success-foreground)',
        },

        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
          foreground: 'var(--warning-foreground)',
        },

        destructive: {
          DEFAULT: 'var(--destructive)',
          subtle: 'var(--destructive-subtle)',
          foreground: 'var(--destructive-foreground)',
        },

        income: {
          DEFAULT: 'var(--income)',
          subtle: 'var(--income-subtle)',
        },

        outcome: {
          DEFAULT: 'var(--outcome)',
          subtle: 'var(--outcome-subtle)',
        },

        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },

        input: 'var(--input)',
        ring: 'var(--ring)',
      },

      borderRadius: {
        field: 'var(--radius-field)',
        box: 'var(--radius-box)',
        selector: 'var(--radius-selector)',
      },
    },
  },

  plugins: [],
};
