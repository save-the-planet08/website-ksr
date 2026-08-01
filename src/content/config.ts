import { defineCollection, z } from 'astro:content';

/**
 * Termine sind der einzige Inhalt, der sich laufend ändert.
 * Eine Datei pro Termin in `src/content/termine/` — mehr braucht es nicht.
 */
const termine = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    location: z.string().optional(),
    time: z.string().optional(),
    description: z.string(),
    type: z.enum(['sitzung', 'event', 'workshop', 'treffen']).default('treffen'),
  }),
});

export const collections = { termine };
