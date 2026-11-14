/**
 * Der Kompass auf dem Server: Code prüfen, Antworten säubern, absenden.
 *
 * Der Browser spricht nie mit Supabase — er schickt sein Formular an
 * `/umfrage/senden`, und erst Vercel ruft die Datenbank. Supabase sieht damit
 * keine IP-Adresse eines Schülers.
 */
import { supabase } from './supabase';
import { teile, FREITEXT_MAX, type Bedingung, type Frage } from '../data/umfrage';

export type Antworten = Record<string, string | string[]>;
export type Zustand = 'offen' | 'zu' | 'falsch';

const CODE = /^RTK-[A-Z0-9]{6}$/;

/**
 * Nur im lokalen Dev-Server: ein Code, der ohne Datenbank durch die ganze
 * Umfrage führt. Im Build ist `import.meta.env.DEV` falsch — der Zweig fällt
 * dort komplett weg.
 */
const TESTCODE = 'RTK-TEST26';
const lokalerTest = (code: string) => import.meta.env.DEV && code === TESTCODE;

/** Nimmt „rtk-7k3p9x", „7K3P 9X" und „RTK7K3P9X" gleichermaßen an. */
export function codeNormal(roh: unknown): string {
  const zeichen = String(roh ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const kern = zeichen.length === 9 && zeichen.startsWith('RTK') ? zeichen.slice(3) : zeichen;
  return kern ? `RTK-${kern}` : '';
}

export async function schulePruefen(code: string): Promise<{ zustand: Zustand; schule?: string }> {
  if (!CODE.test(code)) return { zustand: 'falsch' };
  if (lokalerTest(code)) return { zustand: 'offen', schule: 'Testschule (nur lokal)' };
  const { data, error } = await supabase.rpc('umfrage_schule', { p_code: code });
  if (error) throw new Error(`Supabase (umfrage_schule): ${error.message}`);
  const zeile = data?.[0];
  return { zustand: zeile?.zustand ?? 'falsch', schule: zeile?.schule ?? undefined };
}

function text(roh: FormDataEntryValue | null): string {
  return String(roh ?? '').replace(/\s+/g, ' ').trim().slice(0, FREITEXT_MAX);
}

function erfuellt(b: Bedingung | undefined, a: Antworten) {
  if (!b) return true;
  const wert = a[b.frage];
  return typeof wert === 'string' && b.ist.includes(wert);
}

/**
 * Liest nur, was der Fragebogen kennt. Unbekannte Felder fallen weg, ungültige
 * Werte auch, und Fragen, deren Bedingung nicht erfüllt ist, werden nicht
 * gespeichert — selbst wenn der Browser sie mitschickt.
 */
export function saeubern(form: FormData): Antworten {
  const a: Antworten = {};
  const fragen: Frage[] = teile.flatMap((t) => t.fragen);

  for (const f of fragen) {
    if (!erfuellt(f.wenn, a)) continue;

    if (f.art === 'einzel') {
      const v = String(form.get(f.id) ?? '');
      if (!f.optionen.some((o) => o.id === v)) continue;
      a[f.id] = v;
      if (f.unterfeld && f.unterfeld.bei.includes(v)) {
        const t = text(form.get(`${f.id}.${f.unterfeld.id}`));
        if (t) a[`${f.id}.${f.unterfeld.id}`] = t;
      }
    } else if (f.art === 'mehr') {
      const gueltig = new Set(f.optionen.map((o) => o.id));
      let v = [...new Set(form.getAll(f.id).map(String))].filter((x) => gueltig.has(x));
      if (f.allein && v.includes(f.allein)) v = [f.allein];
      if (f.max && v.length > f.max) continue;
      if (!v.length) continue;
      a[f.id] = v;
      if (f.sonstiges && v.includes('sonstiges')) {
        const t = text(form.get(`${f.id}.sonstiges`));
        if (t) a[`${f.id}.sonstiges`] = t;
      }
    } else if (f.art === 'matrix') {
      for (const z of f.zeilen) {
        const v = String(form.get(`${f.id}.${z.id}`) ?? '');
        if (f.skala.some((s) => s.id === v)) a[`${f.id}.${z.id}`] = v;
      }
    } else {
      const t = text(form.get(f.id));
      if (t) a[f.id] = t;
    }
  }
  return a;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function absenden(id: string, code: string, antworten: Antworten) {
  if (lokalerTest(code)) {
    console.info('[umfrage] Testabgabe, nicht gespeichert:', id, antworten);
    return 'ok';
  }
  // Ohne JavaScript gibt es keine ID aus dem Browser; dann eine eigene.
  const sicher = UUID.test(id) ? id : crypto.randomUUID();
  const { data, error } = await supabase.rpc('umfrage_absenden', {
    p_id: sicher, p_code: code, p_antworten: antworten,
  });
  if (error) throw new Error(`Supabase (umfrage_absenden): ${error.message}`);
  return data as 'ok' | 'zu' | 'falsch';
}

export function keinCache(headers: Headers) {
  headers.set('Cache-Control', 'no-store');
  headers.set('Vercel-CDN-Cache-Control', 'no-store');
}
