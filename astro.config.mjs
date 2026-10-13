import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Statisch bis auf `/news` und `/termine`: die tragen `prerender = false` und
// holen ihre Daten bei jedem Aufruf aus Supabase (siehe `src/lib/inhalte.ts`).
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://ksr-rheingau-taunus.de',
  build: { inlineStylesheets: 'auto' },
});
