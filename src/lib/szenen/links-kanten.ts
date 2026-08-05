/**
 * Links — die Kanten messen die Sammlung aus.
 *
 * Der Doppelbalken liegt hier flach: neun Paare in wechselnder Länge, die von
 * links einfahren. Neben einer Liste von Quellen liest sich das wie ihr Maß.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke } from '../szene';

szeneAnmelden('links-kanten', (wurzel) => {
  const kanten = Array.from(wurzel.querySelectorAll<SVGGElement>('[data-teil^="kante-"]'));
  if (!kanten.length) return;

  gsap.set(kanten, { transformOrigin: '0% 50%' });

  strecke(wurzel, 'top 80%', 'bottom bottom')
    .fromTo(kanten,
      { scaleX: 0 },
      { scaleX: 1, ease: 'power3.out', stagger: 0.05 });
});
