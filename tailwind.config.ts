import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'
import scrollbar from 'tailwind-scrollbar'
import animate from 'tailwindcss-animate'

export default {
  content: [],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },

    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }
      'navbar': { min: '1024px', max: '1100px' },
      'nbar100': { min: '1100px', max: '1210px' },

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1816px',
    },
    extend: {
      colors: {
        blue: {
          100: '#D9DFFE',
          200: '#BDC8FC',
          300: '#A1B0F8',
          400: '#8597F3',
          500: '#697FEC',
          600: '#4D66E3',
          700: '#334ED8',
          800: '#1B38CA',
          900: '#0624BD',
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#FF5E34',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#f7f9fb',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
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
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#FF5E34',
          'primary-focus': '#CC4A28',
          'primary-content': '#FFFFFF',

          'secondary': '#f7f9fb',
          'secondary-focus': '#f7f9fb',
          'secondary-content': '#ffffff',

          'accent': '#37cdbe',
          'accent-focus': '#2ba69a',
          'accent-content': '#ffffff',

          'neutral': '#3b424e',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',

          'base-100': '#f2f4f6',
          'base-200': '#e6eaec',
          'base-300': '#737373',
          'base-content': '#1e2734',

          '--custom': '#b2baff',

          'info': '#a5b4fc',
          'success': '#bbf7d0',
          'warning': '#fef3c7',
          'error': '#ff5724',

          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',

          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',

          '--btn-text-case': 'normalcase',
          '--navbar-padding': '0.5rem',
          '--border-btn': '1px',
        },
      },
    ],
    logs: false,
  },
  plugins: [
    animate,
    typography,
    daisyui,
    // scrollbar,
  ],
} satisfies Config
