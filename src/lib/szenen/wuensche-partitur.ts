/**
 * Die acht Wünsche als Partitur.
 *
 * Hinter der Liste steht ein Balkenpaar je Wunsch. Sie wachsen von unten,
 * während man die Liste durchscrollt — am Ende der Liste steht die Partitur.
 * Und wer eine Zeile anfasst, sieht, welcher Balken zu ihr gehört.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke } from '../szene';

szeneAnmelden('wuensche-partitur', (wurzel) => {
  const takte = Array.from(wurzel.querySelectorAll<SVGGElement>('[data-teil^="takt-"]'));
  if (!takte.length) return;

  gsap.set(takte, { transformOrigin: '50% 100%' });

  strecke(wurzel, 'top 75%', 'bottom bottom').fromTo(takte,
    { scaleY: 0, opacity: 0 },
    { scaleY: 1, opacity: 1, ease: 'power2.out', stagger: 0.06 });

  // Die Zeile und ihr Balken gehören zusammen — hier wird das sichtbar.
  const zeilen = Array.from(wurzel.querySelectorAll<HTMLElement>('.wunsch'));
  zeilen.forEach((zeile, i) => {
    const takt = takte[i];
    if (!takt) return;
    const an = () => takt.classList.add('ist-an');
    const aus = () => takt.classList.remove('ist-an');
    zeile.addEventListener('pointerenter', an);
    zeile.addEventListener('pointerleave', aus);
    // Auch für die Tastatur: der Fokus wandert genauso durch die Liste.
    zeile.addEventListener('focusin', an);
    zeile.addEventListener('focusout', aus);
  });
});
