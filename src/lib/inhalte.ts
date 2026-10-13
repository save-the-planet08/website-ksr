import { supabase } from './supabase';

/**
 * News und Termine kommen bei jedem Aufruf frisch aus Supabase — die Seiten
 * `/news` und `/termine` werden auf dem Server gerendert, nicht beim Bauen.
 * Der Browser des Besuchers spricht nie mit Supabase, nur Vercel tut es.
 * Lesbar ist nur, was in `/admin` als veröffentlicht markiert ist.
 */

export type TerminArt = 'sitzung' | 'event' | 'workshop' | 'treffen';

export interface Termin {
  id: string;
  title: string;
  date: Date;
  location?: string;
  time?: string;
  description: string;
  type: TerminArt;
}

export interface Beitrag {
  id: string;
  titel: string;
  text: string;
  datum: Date;
}

// Supabase liefert `YYYY-MM-DD`; als UTC-Mitternacht gelesen, wie früher die
// Daten aus den Markdown-Dateien.
const tag = (iso: string) => new Date(`${iso}T00:00:00Z`);

export async function termineHolen(): Promise<Termin[]> {
  const { data, error } = await supabase
    .from('termine')
    .select('id, titel, datum, uhrzeit, ort, beschreibung, art')
    .eq('veroeffentlicht', true)
    .order('datum');
  if (error) throw new Error(`Supabase (termine): ${error.message}`);
  return data.map((t) => ({
    id: t.id,
    title: t.titel,
    date: tag(t.datum),
    location: t.ort ?? undefined,
    time: t.uhrzeit ?? undefined,
    description: t.beschreibung,
    type: t.art,
  }));
}

export async function newsHolen(): Promise<Beitrag[]> {
  const { data, error } = await supabase
    .from('news')
    .select('id, titel, text, datum')
    .eq('veroeffentlicht', true)
    .order('datum', { ascending: false });
  if (error) throw new Error(`Supabase (news): ${error.message}`);
  return data.map((n) => ({ id: n.id, titel: n.titel, text: n.text, datum: tag(n.datum) }));
}

/**
 * Vercels CDN hält die Seite eine Minute; danach bekommt der nächste Besucher
 * noch die alte Fassung, während im Hintergrund die neue geholt wird. Fällt
 * Supabase aus, bleibt die letzte Fassung bis zu einem Tag stehen.
 */
export function zwischenspeichern(headers: Headers) {
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Vercel-CDN-Cache-Control', 's-maxage=60, stale-while-revalidate=86400, stale-if-error=86400');
}
