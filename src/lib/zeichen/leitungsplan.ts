/**
 * Der Weg einer Nachricht.
 *
 * Drei Leitungen laufen aus derselben Ecke los, teilen sich eine Strecke und
 * gehen dann auseinander — je eine zu einem der drei Wege, die die Seite
 * anbietet. Rechte Winkel, gerundete Ecken, Knoten an den Abzweigen: ein
 * Schaltplan, kein Ornament.
 *
 * Jede Leitung ist ein durchgehender Pfad vom Anfang bis zu ihrem Anschluss.
 * Auf dem gemeinsamen Stück liegen sie übereinander — das ist Absicht: beim
 * Scrollen laufen drei Signale zusammen los und trennen sich unterwegs.
 */
import { geplottet, knoten, leitung } from './baukasten';
import { rechteck } from './typen';
import type { Gruppe, Zeichnung } from './typen';

const BREITE = 1000;
const HOEHE = 620;
const WACKELN = 1.6;

const START: [number, number] = [0, 500];
const ECKE: [number, number] = [90, 500];
const STAMM: [number, number] = [90, 300];
const ABZWEIG_OBEN: [number, number] = [250, 300];
const ABZWEIG_UNTEN: [number, number] = [420, 300];
/* Die Leitungen enden in der Lücke vor den drei Karten. Liefen sie darunter
   weiter, läge genau das Interessante — die Ankunft — hinter weißer Fläche. */
const ENDE_X = 620;

const wege: [number, number][][] = [
  [START, ECKE, STAMM, ABZWEIG_OBEN, [250, 110], [ENDE_X, 110]],
  [START, ECKE, STAMM, [ENDE_X, 300]],
  [START, ECKE, STAMM, ABZWEIG_UNTEN, [420, 500], [ENDE_X, 500]],
];

export function leitungsplan(): Zeichnung {
  const gruppen: Gruppe[] = [];

  wege.forEach((punkte, i) => {
    const d = geplottet(leitung(punkte, 26), WACKELN);
    gruppen.push({ name: `leitung-${i}`, pfade: [d], strich: true, breite: 2, deckung: 0.5 });
    // Dieselbe Geometrie noch einmal: darauf läuft das Signal. Ein zweiter
    // Pfad ist billiger als ein Element, das sich am Weg entlangbewegt.
    gruppen.push({ name: `signal-${i}`, pfade: [d], strich: true, breite: 2.6, akzent: true });
  });

  gruppen.push({
    name: 'knoten',
    pfade: [knoten(...ABZWEIG_OBEN, 7), knoten(...ABZWEIG_UNTEN, 7)],
    deckung: 0.7,
  });

  // Der Anschluss: ein Punkt und ein Pfosten. Kein Ring — ein Ring in einer
  // gefüllten Gruppe wird zur Scheibe, und zwei Gruppen ließen sich nicht
  // gemeinsam ansteuern.
  [110, 300, 500].forEach((y, i) => {
    gruppen.push({
      name: `anschluss-${i}`,
      pfade: [knoten(ENDE_X, y, 8), rechteck(ENDE_X + 16, y - 18, 5, 36)],
    });
  });

  return { box: `0 0 ${BREITE} ${HOEHE}`, gruppen };
}
