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

  /* Getaktet wird an der Bühne, nicht am Abschnitt. Der Abschnitt reicht bis
     unter die drei Karten — wer ihn als Strecke nimmt, lässt die Beeren erst
     dann ankommen, wenn die Rebe längst oben aus dem Bild gescrollt ist. */
  const buehne = wurzel.querySelector<HTMLElement>('.kreis__buehne') ?? wurzel;

  strecke(buehne, 'top 88%', 'bottom 62%')
    // Die Rebe zieht sich über die erste Hälfte der Strecke …
    .to(ranke, { strokeDashoffset: 0, duration: 0.5, ease: 'none' }, 0)
    .to(ranke, { fillOpacity: 1, duration: 0.16 }, 0.44)
    // … und die Beeren sitzen bei knapp vier Fünfteln. Der Rest der Strecke
    // ist Luft, damit das fertige Bild einen Moment lang steht.
    .to(trauben, {
      opacity: 1,
      scale: 1,
      duration: 0.28,
      ease: 'back.out(2)',
      stagger: { each: 0.011, from: 'start' },
    }, 0.3);
});
