/**
 * Die Bildwelt der Seite. Elf Zeichen, jedes genau einmal vergeben — welches
 * wohin gehört, steht in `register.ts`.
 *
 * Die Generatoren laufen beim Bauen, nicht im Browser. Das fertige SVG steht
 * im HTML: kein zusätzliches Skript, kein Nachladen, kein Springen.
 */
import type { ZeichenArt } from '../arten';
import {
  balkenPartitur, loeweMaske, rankeWachstum, traubenNetz, wortmarkeKontur,
} from './ausDemZeichen';
import {
  achsengitter, hoehenlinien, konstellation, wellenfeld,
} from './abgeleitet';
import { wappen } from './wappen';
import { jahresband } from './jahresband';
import { leitungsplan } from './leitungsplan';
import { aussenkanten } from './aussenkanten';
import type { Zeichnung } from './typen';

const bauplan: Record<ZeichenArt, (daten?: any) => Zeichnung> = {
  'loewe-maske': loeweMaske,
  'balken-partitur': balkenPartitur,
  'ranke-wachstum': rankeWachstum,
  'trauben-netz': traubenNetz,
  'wortmarke-kontur': wortmarkeKontur,
  'hoehenlinien': hoehenlinien,
  'wellenfeld': wellenfeld,
  'konstellation': konstellation,
  'achsengitter': achsengitter,
  'wappen': wappen,
  'jahresband': jahresband,
  'leitungsplan': leitungsplan,
  'aussenkanten': aussenkanten,
};

/**
 * `daten` reicht durch, was ein Zeichen zum Bauen braucht — die Nummer eines
 * Wunsches, die Termine eines Schuljahres. Die meisten Zeichen brauchen nichts.
 */
export function zeichnen(art: ZeichenArt, daten?: unknown): Zeichnung {
  return bauplan[art](daten);
}

export type { Gruppe, Zeichnung } from './typen';
