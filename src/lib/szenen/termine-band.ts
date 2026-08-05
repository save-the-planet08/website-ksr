/**
 * Das Jahresband — das Schuljahr zieht sich auf.
 *
 * Erst die Grundlinie von links nach rechts, dann Wochen und Monate, dann
 * setzen sich die Termine in zeitlicher Reihenfolge, zuletzt steht der heutige
 * Tag da. Wer eine Zeile in der Liste anfasst, sieht, wo im Jahr sie liegt.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, teil, zugVorbereiten } from '../szene';

/** Die im Zeichen gesetzte Deckkraft — GSAP soll sie nicht überschreiben. */
function deckung(el: Element) {
  const wert = Number(el.getAttribute('opacity'));
  return Number.isFinite(wert) && el.hasAttribute('opacity') ? wert : 1;
}

szeneAnmelden('termine-band', (wurzel) => {
  const band = wurzel.querySelector<HTMLElement>('[data-band]');
  if (!band) return;

  const hol = (name: string) => band.querySelector<SVGGElement>(`[data-teil="${name}"]`);
  const grund = teil(band, 'grund');
  const lineal = [hol('wochen'), hol('monate')].filter(Boolean) as SVGGElement[];
  const heute = hol('heute');
  // In DOM-Reihenfolge, und die ist die zeitliche — so kommen sie aus dem
  // Zeichen.
  const marken = Array.from(band.querySelectorAll<SVGGElement>('[data-teil^="marke-"]'));

  if (!grund.length) return;
  zugVorbereiten(grund);
  gsap.set(marken, { opacity: 0, scaleY: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
  gsap.set([...lineal, ...(heute ? [heute] : [])], { opacity: 0 });

  const zeit = strecke(band, 'top 88%', 'bottom 45%');

  zeit.to(grund, { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, 0);
  zeit.to(lineal, {
    opacity: (i: number) => deckung(lineal[i]),
    duration: 0.22,
    ease: 'none',
    stagger: 0.08,
  }, 0.22);
  zeit.to(marken, {
    opacity: (i: number) => deckung(marken[i]),
    scaleY: 1,
    duration: 0.22,
    ease: 'back.out(2)',
    stagger: 0.06,
  }, 0.45);
  if (heute) zeit.to(heute, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.82);

  /* Die Zeile und ihre Marke gehören zusammen — hier wird das sichtbar. */
  for (const zeile of Array.from(wurzel.querySelectorAll<HTMLElement>('[data-termin]'))) {
    const marke = band.querySelector<SVGGElement>(`[data-teil="marke-${zeile.dataset.termin}"]`);
    if (!marke) continue;
    const an = () => marke.classList.add('ist-an');
    const aus = () => marke.classList.remove('ist-an');
    zeile.addEventListener('pointerenter', an);
    zeile.addEventListener('pointerleave', aus);
    zeile.addEventListener('focusin', an);
    zeile.addEventListener('focusout', aus);
  }
});
