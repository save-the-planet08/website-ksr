/**
 * Kommende Termine — das Blatt füllt sich.
 *
 * Das Taktraster ist ein Kalenderblatt: erst die Querlinien, dann Spalte für
 * Spalte die Balkenpaare. Wer die Terminliste durchscrollt, sieht das Blatt
 * dahinter entstehen.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, zugVorbereiten } from '../szene';

szeneAnmelden('termine-takt', (wurzel) => {
  const quer = Array.from(wurzel.querySelectorAll<SVGPathElement>('[data-teil^="quer-"] path'));
  const spalten = Array.from(wurzel.querySelectorAll<SVGGElement>('[data-teil^="takt-"]'));
  if (!quer.length && !spalten.length) return;

  zugVorbereiten(quer);
  gsap.set(spalten, { transformOrigin: '50% 0%' });

  const zeit = strecke(wurzel, 'top 82%', 'bottom 45%');

  zeit.to(quer, { strokeDashoffset: 0, ease: 'none', stagger: 0.05 }, 0);
  zeit.fromTo(spalten,
    { scaleY: 0 },
    { scaleY: 1, ease: 'power2.out', stagger: 0.035 }, 0.1);
});
