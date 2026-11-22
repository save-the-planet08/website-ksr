import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Statisch bis auf `/news` und `/termine`: die tragen `prerender = false` und
// holen ihre Daten bei jedem Aufruf aus Supabase (siehe `src/lib/inhalte.ts`).
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://ksr-rheingau-taunus.de',
  build: { inlineStylesheets: 'auto' },
  // Ohne diese Liste kennt Astro auf Vercel die öffentliche Domain nicht und
  // weist das Absenden der Umfrage als „Cross-site“ ab (403).
  security: {
    allowedDomains: [
      { protocol: 'https', hostname: 'website-ksr.vercel.app' },
      { protocol: 'https', hostname: 'ksr-rheingau-taunus.de' },
      { protocol: 'https', hostname: 'www.ksr-rheingau-taunus.de' },
    ],
  },
});
