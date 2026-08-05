/**
 * Wer bekommt was.
 *
 * Die Seite soll überall verschieden sein, ohne beliebig zu werden. Diese
 * Tabelle ist die eine Stelle, an der das entschieden wird: jeder Abschnitt
 * bekommt sein Zeichen, seine Szene und den Auftritt seiner Überschrift.
 *
 * Die Prüfung unten läuft beim Bauen. Wird ein Zeichen oder eine Szene zweimal
 * vergeben, bricht der Build. Das ist der ganze Trick — die Vielfalt hängt
 * nicht an Disziplin, sondern an einer Regel, die schreit.
 */
import type { AuftrittArt, SzeneArt, ZeichenArt } from './arten';

export interface Vergabe {
  /** Das Bildzeichen des Abschnitts. Fehlt, wo der Abschnitt bewusst leer ist. */
  zeichen?: ZeichenArt;
  /** Was beim Scrollen passiert. */
  szene?: SzeneArt;
  /** Der Auftritt der Überschrift. Alles Weitere steht am Element selbst. */
  auftritt: AuftrittArt;
}

export const register = {
  // --- Startseite -----------------------------------------------------------
  // Akt I (die Bühne) steht außerhalb: sie hat ihre eigene Choreografie und
  // teilt sie mit niemandem.
  'start/haltung':      { zeichen: 'loewe-maske',      szene: 'haltung-maske',        auftritt: 'gewicht' },
  'start/wuensche':     { zeichen: 'balken-partitur',  szene: 'wuensche-partitur',    auftritt: 'versatz' },
  'start/kreis':        { zeichen: 'ranke-wachstum',   szene: 'kreis-wachstum',       auftritt: 'wort'    },
  'start/aufruf':       { zeichen: 'konstellation',    szene: 'aufruf-konstellation', auftritt: 'zerfall' },

  // --- Der Rat --------------------------------------------------------------
  'rat/kopf':           {                                                             auftritt: 'zerfall' },
  'rat/ebenen':         { zeichen: 'hoehenlinien',     szene: 'ebenen-schichten',     auftritt: 'strich'  },
  'rat/alltag':         { zeichen: 'wellenfeld',       szene: 'alltag-wellen',        auftritt: 'schere'  },
  'rat/mitmachen':      { zeichen: 'wortmarke-kontur', szene: 'mitmachen-kontur',     auftritt: 'kippen'  },

  // --- Die acht Wünsche -----------------------------------------------------
  // Kein eigenes Zeichen: hier trägt die Riesenzahl das Bild, achtmal anders
  // gebaut. Siehe `szenen/wuensche-zahlen.ts`.
  'wuensche/kopf':      {                                                             auftritt: 'versatz' },
  'wuensche/liste':     {                              szene: 'wuensche-zahlen',      auftritt: 'blende'  },
  'wuensche/schluss':   {                                                             auftritt: 'zahl'    },

  // --- Termine --------------------------------------------------------------
  'termine/kopf':       {                                                             auftritt: 'zeile'   },
  'termine/kommend':    { zeichen: 'taktraster',       szene: 'termine-takt',         auftritt: 'gewicht' },
  'termine/rueckblick': { zeichen: 'trauben-netz',     szene: 'rueckblick-netz',      auftritt: 'blende'  },

  // --- Kontakt --------------------------------------------------------------
  'kontakt/kopf':       {                                                             auftritt: 'kippen'  },
  'kontakt/direkt':     { zeichen: 'achsengitter',     szene: 'kontakt-achsen',       auftritt: 'spur'    },
  // Ohne eigenes Zeichen: hier schieben sich die beiden Spalten gegeneinander.
  'kontakt/wo':         {                              szene: 'kontakt-parallaxe',    auftritt: 'maske'   },

  // --- Links ----------------------------------------------------------------
  'links/kopf':         {                                                             auftritt: 'schere'  },
  'links/gruppen':      { zeichen: 'kanten',           szene: 'links-kanten',         auftritt: 'seit'    },
} as const satisfies Record<string, Vergabe>;

export type Ort = keyof typeof register;

/** Die Vergabe für einen Ort. Tippfehler fängt TypeScript ab. */
export function ort<T extends Ort>(name: T): (typeof register)[T] {
  return register[name];
}

/* --------------------------------------------------------------------------
   Der Wächter. Läuft beim Import, also beim Bauen jeder Seite.
   -------------------------------------------------------------------------- */

function seiteVon(ort: string) {
  return ort.split('/')[0];
}

function pruefen() {
  const eintraege = Object.entries(register) as [Ort, Vergabe][];
  const fehler: string[] = [];

  for (const feld of ['zeichen', 'szene'] as const) {
    const gesehen = new Map<string, Ort>();
    for (const [ort, vergabe] of eintraege) {
      const wert = vergabe[feld];
      if (!wert) continue;
      const schon = gesehen.get(wert);
      if (schon) {
        fehler.push(`${feld} "${wert}" ist zweimal vergeben: ${schon} und ${ort}`);
      } else {
        gesehen.set(wert, ort);
      }
    }
  }

  // Auftritte dürfen sich über die Seite hinweg wiederholen — innerhalb einer
  // Seite nicht. Zwei Überschriften untereinander, die gleich auftreten, sind
  // genau das, was diese Arbeit abstellen soll.
  const jeSeite = new Map<string, Map<string, Ort>>();
  for (const [ort, vergabe] of eintraege) {
    const seite = seiteVon(ort);
    if (!jeSeite.has(seite)) jeSeite.set(seite, new Map());
    const gesehen = jeSeite.get(seite)!;
    const schon = gesehen.get(vergabe.auftritt);
    if (schon) {
      fehler.push(`Auftritt "${vergabe.auftritt}" kommt auf ${seite} zweimal vor: ${schon} und ${ort}`);
    } else {
      gesehen.set(vergabe.auftritt, ort);
    }
  }

  if (fehler.length) {
    throw new Error(`Register: Doppelvergabe.\n  ${fehler.join('\n  ')}`);
  }
}

pruefen();
