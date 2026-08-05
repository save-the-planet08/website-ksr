/**
 * Mitmachen — die Marke schreibt sich.
 *
 * Drei Buchstaben, drei Züge, einer nach dem anderen. Am Ende der Seite, die
 * erklärt was der Rat ist, steht sein Name da — von Hand gezogen statt
 * hingestellt.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke } from '../szene';

szeneAnmelden('mitmachen-kontur', (wurzel) => {
  const zuege = Array.from(wurzel.querySelectorAll<SVGPathElement>('[data-teil^="zug-"] path'));
  if (!zuege.length) return;

  // Buchstabe für Buchstabe, nicht alle gleichzeitig: die Wortmarke steht im
  // Logo in dieser Reihenfolge, also wird sie auch so geschrieben.
  for (const p of zuege) {
    const laenge = p.getTotalLength();
    gsap.set(p, { strokeDasharray: laenge, strokeDashoffset: laenge });
  }

  strecke(wurzel, 'top 80%', 'bottom 60%')
    .to(zuege, { strokeDashoffset: 0, ease: 'none', stagger: 0.4 });
});
