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
import type { AuftrittArt } from './arten';
import { lenis, sanft } from './scroll';

gsap.registerPlugin(ScrollTrigger);

export type Art = AuftrittArt;

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

/**
 * Liest die Achsen der Variable-Schrift, wie sie am Ende stehen sollen.
 * Ohne Angabe gilt der Normalschnitt.
 */
function achsenVon(el: HTMLElement): { wght: number; wdth: number } {
  const roh = getComputedStyle(el).fontVariationSettings;
  const lies = (achse: string, ersatz: number) => {
    const treffer = new RegExp(`['"]${achse}['"]\\s*(-?[\\d.]+)`).exec(roh);
    return treffer ? parseFloat(treffer[1]) : ersatz;
  };
  return { wght: lies('wght', 400), wdth: lies('wdth', 100) };
}

/**
 * Feste Richtungen für den Zerfall — x, y, Drehung. Wird durchgezählt, nicht
 * gewürfelt: dieselbe Überschrift setzt sich immer gleich zusammen.
 */
const richtungen = [
  [-52, -34, -9],
  [38, -58, 7],
  [-24, 46, -5],
  [58, 28, 11],
  [4, -72, -3],
  [-64, 12, 6],
  [26, 60, -8],
  [-14, -46, 4],
];

/**
 * Alle vier Werte tragen ein Prozentzeichen, auch die Nullen. Ohne Einheit
 * findet GSAP keinen Weg von `100%` nach `0` und lässt das Element verdeckt
 * stehen — der Inhalt wäre schlicht weg.
 */
const kanten: Record<string, string> = {
  oben:   'inset(0% 0% 100% 0%)',
  unten:  'inset(100% 0% 0% 0%)',
  rechts: 'inset(0% 0% 0% 100%)',
  links:  'inset(0% 100% 0% 0%)',
};

const offen = 'inset(0% 0% 0% 0%)';

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
      { clipPath: kanten.links, opacity: 1 },
      { clipPath: offen, duration: 1.15, ease: 'power4.inOut', delay, scrollTrigger });
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

  /* ---- Die Schrift wird schwer -------------------------------------------
     Der einzige Auftritt, den nur eine Variable-Schrift kann: die Achsen
     wandern mit. Ziel ist, was die Klasse ohnehin vorschreibt — der Auftritt
     kommt nur von weiter unten. */
  if (art === 'gewicht') {
    const zeilen = inZeilen(el);
    const ziel = achsenVon(el);
    gsap.set(el, { opacity: 1 });
    el.style.fontVariationSettings = `'wght' var(--wg), 'wdth' var(--wd)`;

    const zeit = gsap.timeline({ delay, scrollTrigger });
    zeit.fromTo(el,
      { '--wg': 200, '--wd': 76 },
      { '--wg': ziel.wght, '--wd': ziel.wdth, duration: 1.4, ease: 'power2.out' }, 0);
    if (zeilen?.length) {
      zeit.fromTo(zeilen, { yPercent: 108 },
        { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'power4.out' }, 0);
    }
    return;
  }

  /* ---- Wörter finden zusammen -------------------------------------------- */
  if (art === 'zerfall') {
    const woerter = inWoerter(el);
    if (woerter?.length) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(woerter,
        {
          x: (i: number) => richtungen[i % richtungen.length][0],
          y: (i: number) => richtungen[i % richtungen.length][1],
          rotate: (i: number) => richtungen[i % richtungen.length][2],
          opacity: 0,
        },
        {
          x: 0, y: 0, rotate: 0, opacity: 1,
          duration: 1.15, ease: 'power3.out', stagger: 0.035, delay, scrollTrigger,
        });
      return;
    }
  }

  /* ---- Vorhang von einer wählbaren Kante --------------------------------- */
  if (art === 'blende') {
    const kante = kanten[el.dataset.auftrittKante ?? 'unten'] ?? kanten.unten;
    gsap.fromTo(el,
      { clipPath: kante, opacity: 1 },
      { clipPath: offen, duration: 1.2, ease: 'power4.inOut', delay, scrollTrigger });
    return;
  }

  /* ---- Geschert herein und wieder gerade --------------------------------- */
  if (art === 'schere') {
    gsap.fromTo(el,
      { skewY: 5, y: 48, opacity: 0, transformOrigin: 'left top' },
      { skewY: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay, scrollTrigger });
    return;
  }

  /* ---- Erst die Linie, dann der Text ------------------------------------- */
  if (art === 'strich') {
    // Erst zerlegen, dann die Linie einhängen: `inWoerter` leert den Inhalt
    // und rührt Elemente mit Kindern gar nicht erst an.
    const zeilen = inZeilen(el);
    const linie = document.createElement('span');
    linie.className = 'a-strich';
    linie.setAttribute('aria-hidden', 'true');
    el.prepend(linie);
    gsap.set(el, { opacity: 1 });

    const zeit = gsap.timeline({ delay, scrollTrigger });
    zeit.fromTo(linie, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 0);
    if (zeilen?.length) {
      zeit.fromTo(zeilen, { yPercent: 110 },
        { yPercent: 0, duration: 1, stagger: 0.07, ease: 'power4.out' }, 0.25);
    } else {
      zeit.fromTo(el, { y: 26 }, { y: 0, duration: 0.9, ease: 'power3.out' }, 0.25);
    }
    return;
  }

  /* ---- Mit Unschärfe, die nachzieht -------------------------------------- */
  if (art === 'spur') {
    const zeilen = inZeilen(el);
    if (zeilen?.length) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(zeilen,
        { yPercent: 104, filter: 'blur(6px)' },
        {
          yPercent: 0, filter: 'blur(0px)',
          duration: 1.1, ease: 'power3.out', stagger: 0.09, delay, scrollTrigger,
          // Die Unschärfe kostet Füllrate — die Ebene danach wieder freigeben.
          onComplete: () => gsap.set(zeilen, { clearProps: 'filter' }),
        });
      return;
    }
  }

  /* ---- Zeilen kippen um ihre Grundlinie auf ------------------------------ */
  if (art === 'kippen') {
    const zeilen = inZeilen(el);
    if (zeilen?.length) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(zeilen,
        { rotateX: -78, opacity: 0, transformOrigin: '50% 100%' },
        {
          rotateX: 0, opacity: 1,
          duration: 1.1, ease: 'power3.out', stagger: 0.1, delay, scrollTrigger,
        });
      return;
    }
  }

  /* ---- Ziffern zählen hoch ------------------------------------------------
     Der Rest des Textes bleibt stehen und blendet nur auf — sonst zappelt
     eine Adresse, in der zufällig eine Zahl steckt. */
  if (art === 'zaehler') {
    const text = (el.textContent ?? '').trim();
    if (el.children.length === 0 && /\d/.test(text)) {
      const stellen = text.replace(/\D/g, '').length;
      const ziel = parseInt(text.replace(/\D/g, ''), 10);
      const vorlage = { wert: 0 };
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(el, { y: 24 },
        { y: 0, duration: 0.9, ease: 'power3.out', delay, scrollTrigger });
      gsap.to(vorlage, {
        wert: ziel,
        duration: 1.3,
        ease: 'power2.out',
        delay,
        scrollTrigger,
        snap: { wert: 1 },
        onUpdate: () => {
          el.textContent = String(Math.round(vorlage.wert)).padStart(stellen, '0');
        },
      });
      return;
    }
  }

  /* ---- Zeilen abwechselnd von links und rechts --------------------------- */
  if (art === 'versatz') {
    const zeilen = inZeilen(el);
    if (zeilen?.length) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(zeilen,
        { xPercent: (i: number) => (i % 2 ? 34 : -34), opacity: 0 },
        {
          xPercent: 0, opacity: 1,
          duration: 1.25, ease: 'power4.out', stagger: 0.08, delay, scrollTrigger,
        });
      return;
    }
  }

  gsap.fromTo(el, { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay, scrollTrigger });
}

/**
 * Baut alle Auftritte der Seite. Das Versprechen löst sich ein, wenn die
 * Zerlegung steht — erst danach dürfen die Szenen messen, sonst rechnen sie
 * mit Zeilenhöhen, die es gleich nicht mehr gibt.
 */
export function auftritteStarten(): Promise<void> {
  taktKoppeln();

  const alle = Array.from(document.querySelectorAll<HTMLElement>('[data-auftritt]'));
  if (!alle.length) return Promise.resolve();

  if (sanft) {
    gsap.set(alle, { opacity: 1 });
    return Promise.resolve();
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
  return Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 700)),
  ]).then(los);
}
