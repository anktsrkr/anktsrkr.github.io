import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://anktsrkr.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: {
    cacheDir: '.astro-cache/vite',
    optimizeDeps: {
      noDiscovery: true,
      include: []
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
