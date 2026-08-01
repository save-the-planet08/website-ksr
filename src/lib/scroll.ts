/**
 * Ein einziger Scroll-Motor für die ganze Seite.
 * Wird von mehreren Skripten importiert — Vite liefert dasselbe Modul aus,
 * die Einrichtung läuft also genau einmal.
 */
import Lenis from 'lenis';

export const sanft = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lenis = sanft
  ? null
  : new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

if (lenis) {
  // Für Werkzeuge und Fehlersuche erreichbar machen.
  (window as unknown as { __lenis?: unknown }).__lenis = lenis;

  const takt = (zeit: number) => {
    lenis.raf(zeit);
    requestAnimationFrame(takt);
  };
  requestAnimationFrame(takt);
}

/** Ankerlinks über den Motor führen, damit sie nicht springen. */
export function ankerVerbinden() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    // getElementById statt querySelector: IDs dürfen mit einer Ziffer
    // beginnen, als CSS-Selektor wäre das ein Syntaxfehler — und der würde
    // hier alles Nachfolgende mitreißen.
    const ziel = document.getElementById(a.getAttribute('href')!.slice(1));
    if (!ziel) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(ziel, { offset: -80 });
      else ziel.scrollIntoView();
    });
  });
}
