/**
 * Auftritte — das Bewegungsrepertoire der Seite.
 *
 * Ein Element bekommt `data-auftritt="<art>"`, den Rest macht dieses Modul.
 * Es gibt bewusst mehrere Arten: eine Seite, auf der alles gleich von unten
 * einschwebt, wirkt nach drei Sektionen wie eine Vorlage.
 *
 * Der Startzustand (`opacity: 0`) steht im Stylesheet hinter `html.js` —
 * ohne Skript ist der Inhalt schlicht da.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenis, sanft } from './scroll';

gsap.registerPlugin(ScrollTrigger);

export type Art =
  | 'hoch'     // ganzer Block von unten — der ruhige Standard
  | 'zeile'    // Zeile für Zeile aus der Maske
  | 'wort'     // Wort für Wort, leicht gekippt
  | 'seit'     // von der Seite herein
  | 'maske'    // Vorhang von links
  | 'zahl'     // wächst mit leichtem Überschwung
  | 'staffel'; // Kinder nacheinander

let gekoppelt = false;

/** Lenis und ScrollTrigger auf denselben Takt bringen. Nur einmal. */
export function taktKoppeln() {
  if (gekoppelt || !lenis) return;
  gekoppelt = true;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
}

/* --------------------------------------------------------------------------
   Text zerlegen
   -------------------------------------------------------------------------- */

/**
 * Zerlegt reinen Text in Wörter. Elemente mit Kindern werden nicht angefasst
 * — dort fällt der Auftritt auf den ganzen Block zurück.
 * Für Vorlesesoftware bleibt der Originaltext als aria-label erhalten.
 */
function inWoerter(el: HTMLElement): HTMLElement[] | null {
  if (el.children.length > 0) return null;
  const text = el.textContent ?? '';
  if (!text.trim()) return null;

  el.setAttribute('aria-label', text.trim());
  el.textContent = '';

  const kerne: HTMLElement[] = [];
  for (const stueck of text.split(/(\s+)/)) {
    if (!stueck) continue;
    if (/^\s+$/.test(stueck)) {
      el.appendChild(document.createTextNode(' '));
      continue;
    }
    const huelle = document.createElement('span');
    huelle.className = 'a-wort';
    huelle.setAttribute('aria-hidden', 'true');
    const kern = document.createElement('span');
    kern.className = 'a-wort__kern';
    kern.textContent = stueck;
    huelle.appendChild(kern);
    el.appendChild(huelle);
    kerne.push(kern);
  }
  return kerne;
}

/**
 * Gruppiert die Wörter nach ihrer tatsächlichen Zeile und hängt jede Zeile
 * in eine eigene Maske. Muss nach dem Schriftladen laufen, sonst stimmt der
 * Umbruch nicht.
 */
function inZeilen(el: HTMLElement): HTMLElement[] | null {
  const woerter = inWoerter(el);
  if (!woerter) return null;

  const gruppen: HTMLElement[][] = [];
  // Bewusst null und nicht NaN: `Math.abs(x - NaN) > 4` ist immer falsch,
  // damit käme die erste Gruppe nie zustande.
  let letzteHoehe: number | null = null;
  for (const w of woerter) {
    const oben = Math.round(w.getBoundingClientRect().top);
    if (letzteHoehe === null || Math.abs(oben - letzteHoehe) > 4) {
      gruppen.push([]);
      letzteHoehe = oben;
    }
    gruppen[gruppen.length - 1].push(w);
  }

  const zeilen: HTMLElement[] = [];
  for (const gruppe of gruppen) {
    const maske = document.createElement('span');
    maske.className = 'a-zeile';
    maske.setAttribute('aria-hidden', 'true');
    const kern = document.createElement('span');
    kern.className = 'a-zeile__kern';

    el.insertBefore(maske, gruppe[0].parentElement!);
    maske.appendChild(kern);
    gruppe.forEach((w, i) => {
      // Echte Leerzeichen mitnehmen — die alten Textknoten fallen unten weg,
      // sonst klebten die Wörter aneinander.
      if (i > 0) kern.appendChild(document.createTextNode(' '));
      kern.appendChild(w.parentElement!);
    });
    zeilen.push(kern);
  }
  for (const knoten of Array.from(el.childNodes)) {
    if (knoten.nodeType === Node.TEXT_NODE) el.removeChild(knoten);
  }
  return zeilen;
}

/* --------------------------------------------------------------------------
   Die Auftritte
   -------------------------------------------------------------------------- */

function verzugVon(el: HTMLElement): number {
  const roh = getComputedStyle(el).getPropertyValue('--verzug').trim();
  const zahl = parseFloat(roh);
  if (!Number.isFinite(zahl)) return 0;
  return roh.endsWith('ms') ? zahl / 1000 : zahl;
}

function baue(el: HTMLElement) {
  const art = (el.dataset.auftritt || 'hoch') as Art;
  const delay = verzugVon(el);
  const scrollTrigger = { trigger: el, start: 'top 88%', once: true };

  if (art === 'zeile' || art === 'wort') {
    const teile = art === 'zeile' ? inZeilen(el) : inWoerter(el);
    if (teile?.length) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        teile,
        {
          yPercent: art === 'zeile' ? 115 : 90,
          rotateX: art === 'wort' ? -60 : 0,
          opacity: art === 'wort' ? 0 : 1,
        },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: art === 'zeile' ? 1.05 : 0.8,
          ease: 'power4.out',
          stagger: art === 'zeile' ? 0.085 : 0.03,
          delay,
          scrollTrigger,
        },
      );
      return;
    }
    // Kein reiner Text — auf den ruhigen Standard zurückfallen.
  }

  if (art === 'seit') {
    const x = el.dataset.auftrittSeite === 'rechts' ? 70 : -70;
    gsap.fromTo(el, { x, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay, scrollTrigger });
    return;
  }

  if (art === 'maske') {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.15, ease: 'power4.inOut', delay, scrollTrigger });
    return;
  }

  if (art === 'zahl') {
    gsap.fromTo(el,
      { scale: 0.55, opacity: 0, transformOrigin: 'left bottom' },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.8)', delay, scrollTrigger });
    return;
  }

  if (art === 'staffel') {
    const kinder = Array.from(el.children) as HTMLElement[];
    gsap.set(el, { opacity: 1 });
    gsap.fromTo(kinder, { y: 46, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', stagger: 0.09, delay, scrollTrigger });
    return;
  }

  gsap.fromTo(el, { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay, scrollTrigger });
}

export function auftritteStarten() {
  taktKoppeln();

  const alle = Array.from(document.querySelectorAll<HTMLElement>('[data-auftritt]'));
  if (!alle.length) return;

  if (sanft) {
    gsap.set(alle, { opacity: 1 });
    return;
  }

  const los = () => {
    for (const el of alle) {
      // Jedes Element einzeln absichern: ein Fehler in einer Überschrift
      // darf nicht den Rest der Seite unsichtbar lassen.
      try {
        baue(el);
      } catch (fehler) {
        console.error('Auftritt fehlgeschlagen', el, fehler);
        gsap.set(el, { opacity: 1, clearProps: 'transform,clipPath' });
      }
    }
    ScrollTrigger.refresh();
  };

  // Zeilenumbrüche stimmen erst mit der richtigen Schrift. Aber niemals
  // ewig warten — sonst bliebe die Seite unsichtbar.
  Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 700)),
  ]).then(los);
}
