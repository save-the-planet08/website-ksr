/**
 * Der Aufruf — die Orte finden zueinander.
 *
 * Erst stehen die Punkte allein, dann ziehen sich die Wege zwischen ihnen. Am
 * Ende der Seite steht ein Netz da, wo vorher nur Streuung war. Das ist genau
 * das, wozu der Abschnitt auffordert.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, teil, zugVorbereiten } from '../szene';

szeneAnmelden('aufruf-konstellation', (wurzel) => {
  const wege = teil(wurzel, 'wege');
  const orte = teil(wurzel, 'orte');
  const feld = wurzel.querySelector<HTMLElement>('[data-karte]');
  if (!wege.length || !orte.length) return;

  zugVorbereiten(wege);
  gsap.set(orte, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });

  const zeit = strecke(wurzel, 'top 85%', 'bottom bottom');

  zeit.to(orte, {
    scale: 1,
    ease: 'back.out(2.4)',
    stagger: { each: 0.008, from: 'random' },
  }, 0);

  zeit.to(wege, {
    strokeDashoffset: 0,
    ease: 'none',
    stagger: 0.012,
  }, 0.15);

  // Die ganze Karte zieht langsam quer — sie ist größer als das Fenster.
  if (feld) zeit.fromTo(feld, { xPercent: -4 }, { xPercent: 4, ease: 'none' }, 0);
});
