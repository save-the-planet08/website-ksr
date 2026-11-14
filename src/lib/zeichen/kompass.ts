/**
 * Der Kompass des Schülerbedarfskompasses.
 *
 * Neun Stationen auf dem Ring, je 40 Grad, die erste im Norden. Im Fragebogen
 * sind das die Teile A–E und die Module 1–4: die Nadel zeigt, wo man gerade
 * ist, der Bogen innen, wie weit man schon kam. Am Ende sind dieselben neun
 * Plätze die Antworten auf Frage 11 — dann stehen statt der Nadel Strahlen
 * da, einer je gewählter Priorität.
 *
 * Gezeichnet wird alles beim Rendern auf dem Server; der Browser dreht nur
 * die Nadel und kürzt den Bogen.
 */
import { achse, geplottet, kerben, knoten, pfeilspitze, ring } from './baukasten';
import type { Gruppe, Zeichnung } from './typen';

const M = 200;
const WACKELN = 0.9;
const STATIONEN = 9;
const SCHRITT = (Math.PI * 2) / STATIONEN;
const NORDEN = -Math.PI / 2;

export const R_SPUR = 150;

const winkel = (i: number) => NORDEN + i * SCHRITT;

/**
 * Ein geplotteter Ring, der wirklich zu ist. `geplottet()` verschiebt Anfang
 * und Ende unterschiedlich — beim Ring bliebe dort eine sichtbare Kerbe.
 */
function geschlossen(d: string) {
  const zitter = geplottet(d, WACKELN);
  const anfang = /^M(-?[\d.]+) (-?[\d.]+)/.exec(zitter)!;
  return zitter.replace(/-?[\d.]+ -?[\d.]+Z$/, `${anfang[1]} ${anfang[2]}Z`);
}

export interface KompassDaten {
  /** Statt der Nadel: Strahlen zu diesen Stationen, in Reihenfolge. */
  strahlen?: number[];
}

export function kompass(daten?: KompassDaten): Zeichnung {
  const g: Gruppe[] = [];

  // Die Lünette: 72 feine Striche, an den Stationen ausgespart — dort stehen
  // die langen Marken.
  const fein = kerben(M, M, 170, 177, 72).filter((_, i) => i % 8 !== 0);
  g.push({ name: 'luenette', pfade: fein.map((d) => geplottet(d, WACKELN * 0.4)), strich: true, deckung: 0.4 });

  g.push({ name: 'ring-aussen', pfade: [geschlossen(ring(M, M, 182))], strich: true, deckung: 0.55 });
  g.push({ name: 'ring-innen', pfade: [geschlossen(ring(M, M, 112))], strich: true, deckung: 0.22 });

  // Die Spur und darauf der Fortschritt. Ungeplottet: den Fortschritt zeichnet
  // der Browser als Bogen neu, und beide müssen exakt aufeinanderliegen.
  g.push({ name: 'spur', pfade: [ring(M, M, R_SPUR)], strich: true, deckung: 0.14 });
  if (!daten?.strahlen) {
    g.push({ name: 'fortschritt', pfade: [ring(M, M, R_SPUR)], strich: true, breite: 2.4, deckung: 0.9 });
  }

  for (let i = 0; i < STATIONEN; i++) {
    const w = winkel(i);
    const [c, s] = [Math.cos(w), Math.sin(w)];
    g.push({
      name: `marke-${i}`,
      pfade: [
        geplottet(achse(M + c * 160, M + s * 160, M + c * 182, M + s * 182), WACKELN * 0.5),
        knoten(M + c * R_SPUR, M + s * R_SPUR, 4.5),
      ],
      strich: true,
      breite: 1.6,
    });
  }

  if (daten?.strahlen) {
    // Frage 11 kennt keine Rangfolge — alle Strahlen gleich lang, zusammen
    // eine Gruppe und damit ein Akzent: „deine Wahl".
    g.push({
      name: 'strahlen',
      pfade: daten.strahlen.map((station) => {
        const w = winkel(station);
        const [c, s] = [Math.cos(w), Math.sin(w)];
        return geplottet(achse(M + c * 18, M + s * 18, M + c * 134, M + s * 134), WACKELN * 0.6)
          + pfeilspitze(M + c * 134, M + s * 134, w, 13);
      }),
      strich: true,
      breite: 2.4,
      akzent: true,
    });
  } else {
    // Die Nadel: Norden gefüllt im Akzent, Süden als Kontur, beide auf exakt
    // derselben Grundlinie. Bewusst ungeplottet — sie ist das Messinstrument,
    // und eine schiefe Nadel sieht nicht gezeichnet aus, sondern kaputt.
    g.push({ name: 'nadel-sued', pfade: ['M190 200L200 292L210 200'], strich: true, breite: 1.4 });
    g.push({ name: 'nadel', pfade: ['M200 96L210 200L190 200Z'], akzent: true });
  }

  g.push({ name: 'mitte', pfade: [knoten(M, M, 6)] });

  return { box: '0 0 400 400', gruppen: g };
}

/** Wo eine Station liegt, in Prozent des Zeichens — für die Beschriftung. */
export function stationsOrt(i: number, radius = 204) {
  const w = winkel(i);
  return { x: ((M + Math.cos(w) * radius) / 400) * 100, y: ((M + Math.sin(w) * radius) / 400) * 100 };
}
