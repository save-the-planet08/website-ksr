import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://ksr-rheingau-taunus.de',
  build: { inlineStylesheets: 'auto' },
});
