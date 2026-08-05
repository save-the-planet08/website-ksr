/**
 * Szenen — was beim Scrollen in einem Abschnitt passiert.
 *
 * Auftritte sind kurz und lokal: ein Element kommt ins Bild und ist da. Eine
 * Szene läuft über die ganze Strecke, die ein Abschnitt im Fenster steht, und
 * hängt am Scrollrad. Jede Szene gibt es genau einmal — welche wo läuft, steht
 * in `register.ts`.
 *
 * Ein Abschnitt trägt `data-szene="<name>"`, den Rest macht dieses Modul.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SzeneArt } from './arten';
import { sanft } from './scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Eine Szene baut ihre Zeitachse selbst. `sanft` bekommt sie nie zu sehen —
 * dafür sorgt der Aufruf unten. Sie muss also nicht selbst daran denken, aber
 * sie muss einen Endzustand haben, der auch unbewegt steht.
 */
export type Szene = (wurzel: HTMLElement) => void;

const szenen = new Map<SzeneArt, Szene>();

/** Meldet eine Szene an. Zweimal derselbe Name ist ein Fehler im Aufbau. */
export function szeneAnmelden(name: SzeneArt, bau: Szene) {
  if (szenen.has(name)) {
    throw new Error(`Szene "${name}" ist schon angemeldet.`);
  }
  szenen.set(name, bau);
}

/**
 * Hilfsmittel für die Szenen: eine gescrubbte Zeitachse über die Strecke, die
 * der Abschnitt durchs Fenster wandert. Start und Ende sind bewusst
 * großzügig — was am Rand passiert, sieht sonst niemand.
 */
export function strecke(wurzel: HTMLElement, von = 'top bottom', bis = 'bottom top') {
  return gsap.timeline({
    scrollTrigger: { trigger: wurzel, start: von, end: bis, scrub: 0.9 },
  });
}

/**
 * Bereitet Pfade darauf vor, sich selbst zu zeichnen: die Kontur wird zu einer
 * Strichlinie, die genau so lang ist wie der Pfad, und ganz herausgeschoben.
 * Der Rest ist ein Tween auf `strokeDashoffset: 0`.
 */
export function zugVorbereiten(pfade: SVGPathElement[]) {
  for (const p of pfade) {
    const laenge = p.getTotalLength();
    gsap.set(p, { strokeDasharray: laenge, strokeDashoffset: laenge });
  }
}

/** Kurzform für die Pfade einer Zeichen-Gruppe. */
export function teil(wurzel: Element, name: string) {
  return Array.from(wurzel.querySelectorAll<SVGPathElement>(`[data-teil="${name}"] path`));
}

/** Alle Szenen der Seite bauen. Nach den Auftritten aufrufen, nie davor. */
export function szenenStarten() {
  const orte = Array.from(document.querySelectorAll<HTMLElement>('[data-szene]'));
  if (!orte.length) return;

  // Bei reduzierter Bewegung passiert nichts. Die Zeichen sind statisches SVG
  // und stehen ohnehin im Bild — es fehlt nur die Bewegung, nicht der Inhalt.
  if (sanft) return;

  for (const wurzel of orte) {
    const name = wurzel.dataset.szene as SzeneArt;
    const bau = szenen.get(name);
    if (!bau) {
      console.warn(`Szene "${name}" ist nicht angemeldet.`, wurzel);
      continue;
    }
    // Jede Szene einzeln absichern: ein Fehler in einem Abschnitt darf die
    // übrigen nicht mitreißen.
    try {
      bau(wurzel);
    } catch (fehler) {
      console.error(`Szene "${name}" fehlgeschlagen`, wurzel, fehler);
    }
  }

  ScrollTrigger.refresh();
}
