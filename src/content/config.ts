import { defineCollection, z } from 'astro:content';
import { supabase } from '../lib/supabase';

/**
 * Termine und News liegen in Supabase und werden beim Bauen geholt — die
 * ausgelieferte Seite spricht nie selbst mit der Datenbank. Gepflegt wird
 * über `/admin`. Lesbar ist nur, was dort als veröffentlicht markiert ist.
 *
 * Schlägt die Abfrage fehl, bricht der Build ab: lieber keine neue Seite als
 * eine, auf der stillschweigend alle Termine fehlen.
 */
async function holen(tabelle: 'termine' | 'news') {
  const { data, error } = await supabase.from(tabelle).select('*').eq('veroeffentlicht', true);
  if (error) throw new Error(`Supabase (${tabelle}): ${error.message}`);
  return data;
}

const termine = defineCollection({
  loader: async () =>
    (await holen('termine')).map((t) => ({
      id: t.id,
      title: t.titel,
      date: t.datum,
      location: t.ort ?? undefined,
      time: t.uhrzeit ?? undefined,
      description: t.beschreibung,
      type: t.art,
    })),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    time: z.string().optional(),
    description: z.string(),
    type: z.enum(['sitzung', 'event', 'workshop', 'treffen']).default('treffen'),
  }),
});

const news = defineCollection({
  loader: async () =>
    (await holen('news')).map((n) => ({ id: n.id, titel: n.titel, text: n.text, datum: n.datum })),
  schema: z.object({
    titel: z.string(),
    text: z.string(),
    datum: z.coerce.date(),
  }),
});

export const collections = { termine, news };
