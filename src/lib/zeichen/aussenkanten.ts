/**
 * Was hinausführt.
 *
 * Verweise zeigen nach draußen — also gehen sie hier auch nach draußen: aus
 * einem Punkt gebündelt, nach rechts aufgefächert, und über den Rand hinaus.
 * Der Abschnitt schneidet sie ab; man sieht, dass sie weitergehen.
 *
 * Eine Kante je Quelle. Kommt eine dazu, kommt eine Kante dazu.
 */
import { geplottet, knoten, pfeilspitze } from './baukasten';
import type { Gruppe, Zeichnung } from './typen';

// Breit und flach: so liegt das Zeichen als Band unter der Sammlung und muss
// nicht gestreckt werden. Gestreckt würden aus den Pfeilspitzen Splitter.
const BREITE = 1200;
const HOEHE = 340;
const BUENDEL: [number, number] = [26, 170];
const WACKELN = 2;

function r(n: number) {
  return Math.round(n * 100) / 100;
}

export function aussenkanten(anzahl = 4): Zeichnung {
  const n = Math.max(1, anzahl);
  const gruppen: Gruppe[] = [];

  for (let i = 0; i < n; i++) {
    // Gleichmäßig über die Höhe verteilt, aber nie ganz an den Rand.
    const t = n === 1 ? 0.5 : i / (n - 1);
    const ziel = 34 + t * (HOEHE - 68);
    const [bx, by] = BUENDEL;

    // Erst flach am Bündel, dann in die Zielhöhe schwenken: die Griffe liegen
    // waagerecht, deshalb verlassen alle Kanten den Punkt in dieselbe Richtung.
    const d = `M${r(bx)} ${r(by)}C${r(bx + 380)} ${r(by)} ${r(BREITE - 420)} ${r(ziel)} ${r(BREITE - 34)} ${r(ziel)}`;

    gruppen.push({
      name: `kante-${i}`,
      pfade: [geplottet(d, WACKELN)],
      strich: true,
      breite: 1.8,
      deckung: 0.45 + t * 0.3,
    });
    gruppen.push({
      name: `spitze-${i}`,
      pfade: [pfeilspitze(BREITE - 6, ziel, 0, 26)],
      strich: true,
      breite: 1.8,
      deckung: 0.45 + t * 0.3,
    });
  }

  gruppen.push({ name: 'buendel', pfade: [knoten(...BUENDEL, 9)], akzent: true });

  return { box: `0 0 ${BREITE} ${HOEHE}`, gruppen };
}
