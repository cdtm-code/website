// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cliniquedentairetemaramall.com',
  integrations: [tailwind(), sitemap()],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    server: {
      allowedHosts: ['test-cdtm.dev2.rbouh.com'],
    },
  },
});
