/**
 * Die acht Wünsche — acht Behandlungen derselben Zahl.
 *
 * Acht Abschnitte hintereinander sind der Härtefall dieser Seite: gäbe man
 * jedem ein eigenes Zeichen, zerfiele die Liste in acht Plakate. Also trägt
 * hier überall dasselbe Bild — die Riesenzahl — und wird achtmal anders
 * gebaut. Ein Thema, acht Variationen: das ist Ordnung und trotzdem keine
 * Wiederholung.
 *
 * Die Reihenfolge ist gesetzt und ändert sich nie. Wunsch 03 wird immer
 * geflutet, Wunsch 06 immer gespiegelt.
 */
import { gsap } from 'gsap';
import { szeneAnmelden } from '../szene';

type Griff = (el: HTMLElement, zeit: gsap.core.Timeline) => void;

/** Zerlegt „08" in zwei Ziffern, damit sie einzeln laufen können. */
function ziffern(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? '').trim();
  el.textContent = '';
  return [...text].map((z) => {
    const span = document.createElement('span');
    span.className = 'zahl-ziffer';
    span.textContent = z;
    el.appendChild(span);
    return span;
  });
}

const griffe: Griff[] = [
  // 01 — zählt sich selbst hoch
  (el, zeit) => {
    const ziel = parseInt((el.textContent ?? '0').replace(/\D/g, ''), 10) || 0;
    const stellen = (el.textContent ?? '').replace(/\D/g, '').length;
    const stand = { wert: 0 };
    zeit.to(stand, {
      wert: ziel,
      ease: 'power2.out',
      snap: { wert: 1 },
      onUpdate: () => {
        el.textContent = String(Math.round(stand.wert)).padStart(stellen, '0');
      },
    });
  },

  // 02 — steht erst als Umriss da und läuft dann voll
  (el, zeit) => {
    el.style.webkitTextStroke = '2px currentColor';
    zeit.fromTo(el,
      { color: 'rgba(0,0,0,0)' },
      { color: 'inherit', ease: 'power2.inOut' });
  },

  // 03 — wird von unten geflutet
  (el, zeit) => {
    zeit.fromTo(el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power3.out' });
  },

  // 04 — wächst in der Breite, nicht in der Größe
  (el, zeit) => {
    el.style.fontVariationSettings = `'wght' var(--wg), 'wdth' var(--wd)`;
    zeit.fromTo(el,
      { '--wg': 300, '--wd': 62 },
      { '--wg': 800, '--wd': 125, ease: 'power2.out' });
  },

  // 05 — kippt um die Grundlinie auf
  (el, zeit) => {
    el.style.perspective = '600px';
    zeit.fromTo(el,
      { rotateX: -88, opacity: 0, transformOrigin: '50% 100%' },
      { rotateX: 0, opacity: 1, ease: 'power3.out' });
  },

  // 06 — klappt aus der Spiegelung zurück
  (el, zeit) => {
    zeit.fromTo(el,
      { scaleX: -1, opacity: 0.2, transformOrigin: '50% 50%' },
      { scaleX: 1, opacity: 1, ease: 'power2.inOut' });
  },

  // 07 — die Ziffern kommen von beiden Seiten zusammen
  (el, zeit) => {
    const z = ziffern(el);
    zeit.fromTo(z,
      { x: (i: number) => (i === 0 ? -90 : 90), opacity: 0 },
      { x: 0, opacity: 1, ease: 'power4.out', stagger: 0.05 });
  },

  // 08 — der letzte dreht sich ins Bild
  (el, zeit) => {
    zeit.fromTo(el,
      { rotate: -26, scale: 0.55, opacity: 0, transformOrigin: '0% 100%' },
      { rotate: 0, scale: 1, opacity: 1, ease: 'power3.out' });
  },
];

szeneAnmelden('wuensche-zahlen', (wurzel) => {
  const zahlen = Array.from(wurzel.querySelectorAll<HTMLElement>('[data-zahl]'));

  // Zuerst alle sichtbar machen, dann erst bauen: scheitert eine Behandlung,
  // fehlt eine Bewegung — aber keine Zahl.
  gsap.set(zahlen, { opacity: 1 });

  zahlen.forEach((el, i) => {
    const zeit = gsap.timeline({
      scrollTrigger: {
        trigger: el.closest('section') ?? el,
        start: 'top 78%',
        end: 'top 32%',
        scrub: 0.7,
      },
    });

    griffe[i % griffe.length](el, zeit);
  });
});
