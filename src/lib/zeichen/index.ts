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
  achsengitter, hoehenlinien, kanten, konstellation, taktraster, wellenfeld,
} from './abgeleitet';
import type { Zeichnung } from './typen';

const bauplan: Record<ZeichenArt, () => Zeichnung> = {
  'loewe-maske': loeweMaske,
  'balken-partitur': balkenPartitur,
  'ranke-wachstum': rankeWachstum,
  'trauben-netz': traubenNetz,
  'wortmarke-kontur': wortmarkeKontur,
  'hoehenlinien': hoehenlinien,
  'taktraster': taktraster,
  'wellenfeld': wellenfeld,
  'konstellation': konstellation,
  'achsengitter': achsengitter,
  'kanten': kanten,
};

export function zeichnen(art: ZeichenArt): Zeichnung {
  return bauplan[art]();
}

export type { Gruppe, Zeichnung } from './typen';
