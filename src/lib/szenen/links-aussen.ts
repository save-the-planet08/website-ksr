/**
 * Links — die Kanten laufen hinaus.
 *
 * Aus dem Bündel zieht sich eine Kante nach der anderen nach rechts und
 * verlässt das Bild. Die Reihenfolge ist die der Liste daneben.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, zugVorbereiten } from '../szene';

szeneAnmelden('links-aussen', (wurzel) => {
  const feld = wurzel.querySelector<HTMLElement>('[data-aussen]');
  if (!feld) return;

  const kanten = Array.from(feld.querySelectorAll<SVGPathElement>('[data-teil^="kante-"] path'));
  const spitzen = Array.from(feld.querySelectorAll<SVGGElement>('[data-teil^="spitze-"]'));
  const buendel = feld.querySelector<SVGGElement>('[data-teil="buendel"]');
  if (!kanten.length) return;

  zugVorbereiten(kanten);
  gsap.set(spitzen, { opacity: 0, x: -14 });
  if (buendel) gsap.set(buendel, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });

  const zeit = strecke(feld, 'top 84%', 'bottom 50%');

  if (buendel) zeit.to(buendel, { scale: 1, duration: 0.14, ease: 'back.out(2.4)' }, 0);

  kanten.forEach((p, i) => {
    zeit.to(p, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.out' }, 0.1 + i * 0.13);
    const spitze = spitzen[i];
    if (!spitze) return;
    // Die Deckkraft steht im Zeichen und nimmt nach unten zu — nicht
    // überschreiben, sondern dorthin animieren.
    const ziel = Number(spitze.getAttribute('opacity') ?? 1);
    zeit.to(spitze, { opacity: ziel, x: 0, duration: 0.18, ease: 'power2.out' }, 0.42 + i * 0.13);
  });
});
