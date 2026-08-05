/**
 * Der Kreis — die Rebe wächst, die Beeren setzen sich.
 *
 * Das gab es schon, bevor die Seite ein System dafür hatte. Hier steht es an
 * derselben Stelle wie alle anderen Szenen auch.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, teil, zugVorbereiten } from '../szene';

szeneAnmelden('kreis-wachstum', (wurzel) => {
  const ranke = teil(wurzel, 'ranke');
  const trauben = teil(wurzel, 'trauben');
  if (!ranke.length) return;

  // Die Ranke ist eine Fläche. Zum Wachsen braucht sie erst eine Linie.
  gsap.set(ranke, { fillOpacity: 0, stroke: 'currentColor', strokeWidth: 3 });
  zugVorbereiten(ranke);
  gsap.set(trauben, { opacity: 0, scale: 0.2, transformOrigin: 'center', transformBox: 'fill-box' });

  strecke(wurzel, 'top 78%', 'bottom 55%')
    .to(ranke, { strokeDashoffset: 0, ease: 'none' }, 0)
    .to(ranke, { fillOpacity: 1, duration: 0.25 }, 0.7)
    .to(trauben, {
      opacity: 1,
      scale: 1,
      ease: 'back.out(2)',
      stagger: { each: 0.02, from: 'start' },
    }, 0.35);
});
