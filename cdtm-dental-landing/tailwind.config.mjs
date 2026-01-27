/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary) / 0.05)',
          100: 'rgb(var(--color-primary) / 0.1)',
          200: 'rgb(var(--color-primary) / 0.2)',
          300: 'rgb(var(--color-primary) / 0.3)',
          400: 'rgb(var(--color-primary) / 0.6)',
          500: 'rgb(var(--color-primary) / 1)',
          600: 'rgb(var(--color-primary) / 0.9)',
          700: 'rgb(var(--color-primary) / 0.8)',
          800: 'rgb(var(--color-primary) / 0.7)',
          900: 'rgb(var(--color-primary) / 0.6)',
        },
        secondary: {
          50: '#fdf8f6',
          100: '#f9ede7',
          200: '#f3ddd1',
          300: '#e9c5b0',
          400: '#dba682',
          500: '#c98c5f',
          600: '#b47348',
          700: '#965d3b',
          800: '#7a4d35',
          900: '#64412f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
