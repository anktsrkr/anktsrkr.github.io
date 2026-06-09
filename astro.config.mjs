import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://anktsrkr.github.io',
  trailingSlash: 'always',
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
