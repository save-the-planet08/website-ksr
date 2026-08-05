/**
 * Kontakt — drei Signale laufen los.
 *
 * Die Leitungen zeichnen sich, dann läuft auf jeder ein heller Abschnitt bis
 * zu seinem Anschluss durch, und der Anschluss setzt sich. Wer eine der drei
 * Karten anfasst, sieht, welcher Anschluss zu ihr gehört.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, zugVorbereiten } from '../szene';

szeneAnmelden('kontakt-leitung', (wurzel) => {
  const plan = wurzel.querySelector<HTMLElement>('[data-plan]');
  if (!plan) return;

  const hol = (wahl: string) => Array.from(plan.querySelectorAll<SVGPathElement>(wahl));
  const leitungen = hol('[data-teil^="leitung-"] path');
  const signale = hol('[data-teil^="signal-"] path');
  const anschluesse = Array.from(plan.querySelectorAll<SVGGElement>('[data-teil^="anschluss-"]'));
  const knoten = plan.querySelector<SVGGElement>('[data-teil="knoten"]');
  if (!leitungen.length) return;

  zugVorbereiten(leitungen);
  gsap.set(anschluesse, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
  if (knoten) gsap.set(knoten, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });

  // Das Signal ist ein kurzer Strich, der über den sonst leeren Pfad wandert.
  for (const p of signale) {
    const laenge = p.getTotalLength();
    gsap.set(p, { strokeDasharray: `90 ${laenge}`, strokeDashoffset: laenge + 90 });
  }

  const zeit = strecke(plan, 'top 82%', 'bottom 40%');

  zeit.to(leitungen, { strokeDashoffset: 0, duration: 0.45, ease: 'none' }, 0);
  if (knoten) zeit.to(knoten, { scale: 1, duration: 0.12, ease: 'back.out(2)' }, 0.3);

  signale.forEach((p, i) => {
    zeit.to(p, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.inOut' }, 0.42 + i * 0.09);
    const anschluss = anschluesse[i];
    if (anschluss) {
      zeit.to(anschluss, { scale: 1, duration: 0.14, ease: 'back.out(2.4)' }, 0.8 + i * 0.09);
    }
  });

  /* Die Karte und ihr Anschluss gehören zusammen. */
  Array.from(wurzel.querySelectorAll<HTMLElement>('.weg')).forEach((karte, i) => {
    const anschluss = anschluesse[i];
    if (!anschluss) return;
    const an = () => anschluss.classList.add('ist-an');
    const aus = () => anschluss.classList.remove('ist-an');
    karte.addEventListener('pointerenter', an);
    karte.addEventListener('pointerleave', aus);
    karte.addEventListener('focusin', an);
    karte.addEventListener('focusout', aus);
  });
});
