/**
 * Rückblick — was war, hängt zusammen.
 *
 * Erst stehen die Beeren einzeln da, dann ziehen sich die Verbindungen. Rück-
 * wärts gelesen: je weiter man in die Vergangenheit scrollt, desto dichter
 * wird das Netz.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, teil, zugVorbereiten } from '../szene';

szeneAnmelden('rueckblick-netz', (wurzel) => {
  const kanten = teil(wurzel, 'kanten');
  const beeren = teil(wurzel, 'beeren');
  if (!beeren.length) return;

  zugVorbereiten(kanten);
  gsap.set(beeren, { scale: 0.3, opacity: 0, transformOrigin: 'center', transformBox: 'fill-box' });

  strecke(wurzel, 'top 80%', 'bottom 50%')
    .to(beeren, {
      scale: 1,
      opacity: 1,
      ease: 'back.out(2)',
      stagger: { each: 0.02, from: 'center' },
    }, 0)
    .to(kanten, { strokeDashoffset: 0, ease: 'none', stagger: 0.015 }, 0.25);
});
