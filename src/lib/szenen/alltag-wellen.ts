/**
 * Der Alltag — zwölf Zeilen, die nicht im Gleichschritt laufen.
 *
 * Jede Welle zieht in ihrem eigenen Tempo quer. Nah heißt schnell, fern heißt
 * langsam; abwechselnd nach links und nach rechts. Das Feld steht nie still
 * und wiederholt sich trotzdem nie — es ist nur Scrollen, keine Schleife.
 */
import { szeneAnmelden, strecke } from '../szene';

szeneAnmelden('alltag-wellen', (wurzel) => {
  const zeilen = Array.from(wurzel.querySelectorAll<SVGGElement>('[data-teil^="zeile-"]'));
  if (!zeilen.length) return;

  const zeit = strecke(wurzel);

  zeilen.forEach((g, i) => {
    const nah = i / (zeilen.length - 1);
    const weg = 40 + nah * 300;
    const richtung = i % 2 ? 1 : -1;
    zeit.fromTo(g,
      { x: -weg * richtung },
      { x: weg * richtung, ease: 'none' }, 0);
  });
});
