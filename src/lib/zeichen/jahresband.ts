/**
 * Das Schuljahr als Band.
 *
 * Kein Ornament: hier stehen die tatsächlichen Termine aus
 * `src/content/termine/`, jeder an seinem Tag. Wer den Inhalt ändert, ändert
 * das Bild — sonst wäre es Tapete mit Kalendermuster.
 *
 * Der Stichtag wird beim Bauen gesetzt. Das ist dieselbe Annahme, unter der die
 * Seite ohnehin schon zwischen „kommend" und „vergangen" trennt
 * (`src/pages/termine.astro`): eine statische Seite kennt kein Heute außer dem
 * ihres letzten Builds.
 */
import { achse, geplottet, knoten } from './baukasten';
import { rechteck } from './typen';
import type { Gruppe, Zeichnung } from './typen';

export interface Bandtermin {
  /** ISO-Datum, dient zugleich als Griff für die Szene. */
  iso: string;
  datum: Date;
}

export interface Banddaten {
  termine: Bandtermin[];
  heute: Date;
}

const BREITE = 1200;
const HOEHE = 150;
const GRUND = 104;
const WACKELN = 1.1;

/** Das Schuljahr, in dem ein Datum liegt: 1. August bis 31. Juli. */
function schuljahr(d: Date): [Date, Date] {
  const jahr = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return [new Date(jahr, 7, 1), new Date(jahr + 1, 6, 31)];
}

export function jahresband(daten?: Banddaten): Zeichnung {
  const heute = daten?.heute ?? new Date();
  const termine = daten?.termine ?? [];
  const [von, bis] = schuljahr(heute);

  const spanne = bis.getTime() - von.getTime();
  const x = (d: Date) => ((d.getTime() - von.getTime()) / spanne) * BREITE;

  /* Termine außerhalb dieses Schuljahres werden nicht gezeigt. Sie an den Rand
     zu klemmen wäre gelogen — dann stünde ein Stapel Marken auf dem 1. August,
     an dem nichts war. Das Band zeigt ein Jahr, nicht alles. */
  const imJahr = termine.filter((t) => t.datum >= von && t.datum <= bis);

  /* --- Das Lineal ------------------------------------------------------- */
  const monate: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const mx = (BREITE / 12) * i;
    monate.push(achse(mx, GRUND - 16, mx, GRUND + 10));
  }

  // Wochen als kurze Kerben. Sie geben dem Band sein Maß, ohne es zu füllen.
  const wochen: string[] = [];
  for (let t = new Date(von); t <= bis; t.setDate(t.getDate() + 7)) {
    const wx = x(t);
    wochen.push(achse(wx, GRUND - 6, wx, GRUND));
  }

  /* --- Die Termine ------------------------------------------------------ */
  const gruppen: Gruppe[] = [
    { name: 'grund', pfade: [achse(0, GRUND, BREITE, GRUND)], strich: true, breite: 1.6 },
    { name: 'wochen', pfade: wochen, strich: true, breite: 1, deckung: 0.3 },
    { name: 'monate', pfade: monate, strich: true, breite: 1.4, deckung: 0.7 },
  ];

  /* Stiel und Kopf sitzen in einer Gruppe, damit die Szene beide zusammen
     setzen kann. Deshalb muss der Stiel eine Fläche sein und keine Linie —
     eine Linie in einer gefüllten Gruppe hat keine Breite und ist unsichtbar. */
  const stiel = (sx: number, von: number, bis_: number) =>
    rechteck(sx - 1, Math.min(von, bis_), 2, Math.abs(bis_ - von));

  for (const t of imJahr) {
    const tx = x(t.datum);
    const vergangen = t.datum < heute;
    // Vergangenes hängt unter der Linie, Kommendes steht darüber. Man sieht
    // die Richtung der Zeit, ohne dass es jemand beschriftet.
    const spitze = vergangen ? GRUND + 34 : GRUND - 46;
    gruppen.push({
      name: `marke-${t.iso}`,
      pfade: [stiel(tx, GRUND, spitze), knoten(tx, spitze, vergangen ? 4 : 6)],
      deckung: vergangen ? 0.4 : 1,
    });
  }

  /* --- Heute ------------------------------------------------------------ */
  const hx = x(heute);
  gruppen.push({
    name: 'heute',
    pfade: [stiel(hx, GRUND - 62, GRUND + 44), knoten(hx, GRUND - 62, 5)],
    akzent: true,
  });

  return {
    box: `0 -8 ${BREITE} ${HOEHE}`,
    gruppen: gruppen.map((g) => ({
      ...g,
      // Die Marken bleiben exakt: sie zeigen ein Datum. Nur das Lineal darf
      // von Hand gezogen aussehen.
      pfade: (g.pfade ?? []).map((d) =>
        g.name === 'grund' || g.name === 'wochen' || g.name === 'monate'
          ? geplottet(d, WACKELN)
          : d),
    })),
  };
}

/** Die zwölf Monatskürzel des Schuljahres — für die Beschriftung in HTML. */
export function monatsnamen(heute = new Date()): string[] {
  const [von] = schuljahr(heute);
  return Array.from({ length: 12 }, (_, i) =>
    new Date(von.getFullYear(), von.getMonth() + i, 1)
      .toLocaleDateString('de-DE', { month: 'short' })
      .replace('.', ''));
}
