/**
 * Drei Ebenen — der Hang entsteht Schicht für Schicht.
 *
 * Zwölf Höhenlinien zeichnen sich von außen nach innen, während man die drei
 * Ebenen durchscrollt. Je höher die Schicht, desto weiter rückt sie beim
 * Scrollen nach — daraus wird Tiefe, ohne dass etwas kippt oder skaliert.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, zugVorbereiten } from '../szene';

szeneAnmelden('ebenen-schichten', (wurzel) => {
  const schichten = Array.from(
    wurzel.querySelectorAll<SVGGElement>('[data-teil^="schicht-"]'),
  );
  if (!schichten.length) return;

  const pfade = schichten.map((g) => g.querySelector('path')).filter(Boolean) as SVGPathElement[];
  zugVorbereiten(pfade);

  const zeit = strecke(wurzel, 'top 85%', 'bottom 40%');

  zeit.to(pfade, {
    strokeDashoffset: 0,
    ease: 'none',
    stagger: 0.06,
  }, 0);

  // Die inneren Schichten wandern weiter — der Gipfel schiebt sich heraus.
  schichten.forEach((g, i) => {
    const t = i / (schichten.length - 1);
    zeit.fromTo(g, { y: 0 }, { y: -34 * t, ease: 'none' }, 0);
  });
});
