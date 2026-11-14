/**
 * Der Kompass im Browser.
 *
 * Ohne Skript ist der Fragebogen ein langes, normales Formular. Mit Skript
 * wird er zu Schritten: ein Teil je Bildschirm, die Nadel dreht mit, jede
 * Eingabe landet sofort im Gerät — wer zwischendurch weg muss, macht später
 * dort weiter, wo er war. Die Zurück-Taste des Handys geht einen Teil zurück,
 * nicht aus der Umfrage hinaus.
 */
import { gsap } from 'gsap';
import { bogen } from './zeichen/baukasten';
import { R_SPUR } from './zeichen/kompass';
import { lenis, sanft } from './scroll';

const SPEICHER = 'kompass:stand';
const FERTIG = 'kompass:fertig';
/** Ein angefangener Bogen hält drei Tage — auf Schulrechnern nicht länger. */
const HALTBAR = 3 * 864e5;
const STATIONEN = 9;
const NORDEN = -Math.PI / 2;

interface Stand {
  code: string;
  id: string;
  schritt: number;
  felder: [string, string][];
  /** Nach dem Absenden der Pflicht: wohin „Fertig" führt. */
  ziel?: string;
  zeit: number;
}

/* Gerätespeicher kann fehlen (privates Fenster, gesperrte Daten) — dann
   funktioniert alles, nur ohne Weitermachen. */
function lies<T>(k: string): T | null {
  try {
    const roh = localStorage.getItem(k);
    return roh ? (JSON.parse(roh) as T) : null;
  } catch {
    return null;
  }
}
function schreib(k: string, wert: unknown) {
  try {
    if (wert === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(wert));
  } catch { /* ohne Speicher weiter */ }
}

function neueId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '';
}

/* --------------------------------------------------------------------------
   Die Nadel
   -------------------------------------------------------------------------- */

function nadelTeile(kompass: Element) {
  return kompass.querySelectorAll<SVGGElement>('[data-teil="nadel"], [data-teil="nadel-sued"]');
}

/** Wie eine gedämpfte Kompassnadel: ein Überschwung, dann steht sie. */
function nadelAuf(kompass: Element, station: number, sofort = false) {
  const grad = station * (360 / STATIONEN);
  const teile = nadelTeile(kompass);
  if (sanft || sofort) gsap.set(teile, { rotation: grad, svgOrigin: '200 200' });
  else gsap.to(teile, { rotation: grad, svgOrigin: '200 200', duration: 1.1, ease: 'elastic.out(0.8, 0.6)', overwrite: true });
}

/* --------------------------------------------------------------------------
   Eingang
   -------------------------------------------------------------------------- */

export function eingangStarten() {
  const kompass = document.querySelector('[data-kompass]');
  const feld = document.querySelector<HTMLInputElement>('#code');

  if (kompass) {
    const teile = nadelTeile(kompass);
    gsap.set(teile, { svgOrigin: '200 200' });
    const fortschritt = kompass.querySelector('[data-teil="fortschritt"]');
    if (fortschritt) gsap.set(fortschritt, { opacity: 0 });

    if (!sanft) {
      // Die Nadel sucht: kommt verdreht an, findet Norden, bleibt unruhig.
      gsap.timeline({ delay: 0.25 })
        .fromTo(teile, { rotation: 150 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(0.8, 0.55)' })
        .to(teile, { rotation: 2.5, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
  }

  if (feld && !feld.value) {
    // Nur auf großen Bildschirmen: auf dem Handy würde die Tastatur sofort
    // aufspringen und den Kompass verdecken.
    if (window.matchMedia('(min-width: 62rem)').matches) feld.focus({ preventScroll: true });
  }
  feld?.addEventListener('input', () => {
    const pos = feld.selectionStart;
    feld.value = feld.value.toUpperCase();
    feld.setSelectionRange(pos, pos);
  });
}

/* --------------------------------------------------------------------------
   Der Bogen
   -------------------------------------------------------------------------- */

export function bogenStarten(form: HTMLFormElement) {
  const code = form.dataset.code!;
  const schritte = [...form.querySelectorAll<HTMLElement>('[data-schritt]')];
  const kompass = form.querySelector('.bogen__kompass [data-kompass]')!;
  const fortschritt = kompass.querySelector<SVGPathElement>('[data-teil="fortschritt"] path');
  const marken = [...kompass.querySelectorAll<SVGGElement>('[data-teil^="marke-"]')];
  const orte = [...kompass.querySelectorAll<HTMLElement>('[data-station]')];
  const idFeld = form.querySelector<HTMLInputElement>('[data-abgabe-id]')!;
  const fehler = form.querySelector<HTMLElement>('[data-fehler]')!;
  const gesichert = form.querySelector<HTMLElement>('[data-gesichert]')!;
  const fertigLink = form.querySelector<HTMLAnchorElement>('[data-fertig]');
  const anzeigeMarke = form.querySelector<HTMLElement>('[data-anzeige-marke]')!;
  const anzeigeTitel = form.querySelector<HTMLElement>('[data-anzeige-titel]')!;

  let aktuell = 0;
  let sendet = false;
  let station = 0;

  /* --- Stand laden ------------------------------------------------------- */

  const alt = lies<Stand>(SPEICHER);
  const frisch = alt && alt.code === code && Date.now() - alt.zeit < HALTBAR;
  const stand: Stand = frisch
    ? alt
    : { code, id: neueId(), schritt: 0, felder: [], zeit: Date.now() };
  idFeld.value = stand.id;
  if (stand.ziel && fertigLink) fertigLink.href = stand.ziel;

  if (frisch) {
    for (const [name, wert] of stand.felder) {
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${CSS.escape(name)}"]`).forEach((el) => {
        if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) {
          if (el.value === wert) el.checked = true;
        } else {
          el.value = wert;
        }
      });
    }
    if (stand.felder.length) form.querySelector<HTMLElement>('[data-wiederda]')!.hidden = false;
  } else {
    const schon = lies<number>(`${FERTIG}:${code}`);
    if (schon && Date.now() - schon < 60 * 864e5) form.querySelector<HTMLElement>('[data-schon]')!.hidden = false;
  }

  form.querySelector('[data-neu]')?.addEventListener('click', () => {
    schreib(SPEICHER, null);
    location.replace(`${location.pathname}?code=${encodeURIComponent(code)}`);
  });

  let blinkZeit = 0;
  function speichern() {
    stand.felder = [...new FormData(form)]
      .filter(([n, w]) => n !== 'code' && n !== 'id' && String(w) !== '')
      .map(([n, w]) => [n, String(w)]);
    stand.schritt = aktuell;
    stand.zeit = Date.now();
    schreib(SPEICHER, stand);

    // Ein kurzes „gespeichert" — damit man weiß, dass man gehen darf.
    gesichert.classList.add('ist-an');
    clearTimeout(blinkZeit);
    blinkZeit = window.setTimeout(() => gesichert.classList.remove('ist-an'), 1400);
  }

  /* --- Logik der Fragen -------------------------------------------------- */

  const gewaehlt = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${CSS.escape(name)}"]:checked:not(:disabled)`)?.value;

  function logik() {
    // In Dokumentreihenfolge: Frage 14 hängt an 13, die an der Mensa-Frage.
    // Ist 13 ausgeblendet, ist ihr Feld deaktiviert und zählt nicht mehr.
    form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-wenn]').forEach((fs) => {
      const b = JSON.parse(fs.dataset.wenn!) as { frage: string; ist: string[] };
      const an = b.ist.includes(gewaehlt(b.frage) ?? '');
      fs.hidden = !an;
      fs.disabled = !an;
    });

    form.querySelectorAll<HTMLElement>('[data-unterfeld]').forEach((feld) => {
      const fs = feld.closest('fieldset')!;
      const an = feld.dataset.unterfeld!.split(' ').includes(gewaehlt(fs.dataset.frage!) ?? '');
      feld.hidden = !an;
      feld.querySelector('input')!.disabled = !an;
    });

    form.querySelectorAll<HTMLElement>('[data-sonstiges]').forEach((feld) => {
      const fs = feld.closest('fieldset')!;
      const an = !!fs.querySelector<HTMLInputElement>('input[value="sonstiges"]:checked');
      feld.hidden = !an;
      feld.querySelector('input')!.disabled = !an;
    });

    form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-max]').forEach((fs) => {
      const max = Number(fs.dataset.max);
      const boxen = [...fs.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
      const zahl = boxen.filter((b) => b.checked).length;
      boxen.forEach((b) => (b.disabled = !b.checked && zahl >= max));
      const zaehler = fs.querySelector('[data-zaehler]');
      if (zaehler) zaehler.textContent = zahl ? ` ${zahl} von ${max} gewählt.` : '';
    });

    for (const s of schritte) {
      const knopf = s.querySelector<HTMLButtonElement>('[data-weiter]');
      if (!knopf || s.hasAttribute('data-pause')) continue;
      // Extras ohne Antwort: ehrlich „Überspringen" statt „Weiter".
      if (s.hasAttribute('data-modul')) knopf.textContent = beantwortet(s) ? 'Weiter' : 'Überspringen';
    }
  }

  const beantwortet = (s: HTMLElement) =>
    [...s.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not(:disabled), textarea:not(:disabled)')]
      .some((el) => (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox') ? el.checked : el.value.trim()));

  /** „Nichts davon" schließt alles andere aus — und umgekehrt. */
  function allein(el: HTMLInputElement) {
    const fs = el.closest<HTMLFieldSetElement>('fieldset[data-allein]');
    if (!fs || el.type !== 'checkbox' || !el.checked) return;
    const ausschliesslich = fs.dataset.allein!;
    fs.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((b) => {
      if (b === el) return;
      if (el.value === ausschliesslich || b.value === ausschliesslich) b.checked = false;
    });
  }

  /**
   * Nach einer Einzelwahl die nächste offene Zeile oder Frage ins Bild holen,
   * falls sie unter dem Daumen verschwunden ist. Kein Springen, wenn sie schon
   * zu sehen ist.
   */
  function weiterRuecken(el: HTMLInputElement) {
    if (sanft || el.type !== 'radio') return;
    const s = schritte[aktuell];
    const einheiten = [...s.querySelectorAll<HTMLElement>('.zeile, fieldset:not(.frage--matrix)')]
      .filter((e) => !e.closest('[hidden]') && !e.matches(':disabled'));
    const hier = el.closest('.zeile') ?? el.closest('fieldset');
    const i = einheiten.indexOf(hier as HTMLElement);
    const naechste = einheiten.slice(i + 1).find((e) => !e.querySelector('input:checked'));
    if (!naechste) return;
    const oben = naechste.getBoundingClientRect().top;
    if (oben < window.innerHeight * 0.72) return;
    const ziel = window.scrollY + oben - window.innerHeight * 0.3;
    if (lenis) lenis.scrollTo(ziel, { duration: 0.7 });
    else window.scrollTo({ top: ziel, behavior: 'smooth' });
  }

  form.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    allein(el);
    logik();
    speichern();
    fehler.hidden = true;
    window.setTimeout(() => weiterRuecken(el), 160);
  });

  let tippZeit = 0;
  form.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLTextAreaElement || (e.target as HTMLInputElement).type === 'text')) return;
    clearTimeout(tippZeit);
    tippZeit = window.setTimeout(() => { logik(); speichern(); }, 400);
  });

  // Enter im Textfeld schickt sonst den ganzen Bogen ab.
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).matches('input[type="text"]')) {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  });

  /* --- Schritte ---------------------------------------------------------- */

  function fortschrittAuf(ziel: number, sofort: boolean) {
    if (!fortschritt) return;
    const zeichne = (wert: number) => {
      const bis = (wert / STATIONEN) * Math.PI * 2;
      fortschritt.setAttribute('d', bis > 0.001 ? bogen(200, 200, R_SPUR, NORDEN, NORDEN + bis) : '');
    };
    if (sanft || sofort) {
      zeichne(ziel);
    } else {
      const zustand = { wert: station };
      gsap.to(zustand, { wert: ziel, duration: 0.9, ease: 'power3.inOut', onUpdate: () => zeichne(zustand.wert), overwrite: true });
    }
  }

  function anzeigen(s: HTMLElement, sofort: boolean) {
    const ziel = Number(s.dataset.station);
    nadelAuf(kompass, ziel, sofort);
    fortschrittAuf(ziel, sofort);
    station = ziel;

    marken.forEach((m, i) => {
      m.classList.toggle('ist-erledigt', i < ziel);
      m.classList.toggle('ist-hier', i === ziel);
    });
    orte.forEach((o, i) => o.classList.toggle('ist-hier', i === ziel));

    const z = s.dataset.zeichen!;
    anzeigeMarke.textContent = s.hasAttribute('data-pause')
      ? 'Pflicht erledigt'
      : s.hasAttribute('data-modul') ? `Extra ${z} · freiwillig` : `Teil ${z}`;
    anzeigeTitel.textContent = s.dataset.titel!;
  }

  function zeigen(i: number, { push = true, fokus = true, sofort = false } = {}) {
    const richtung = i >= aktuell ? 1 : -1;
    const neu = schritte[i];
    schritte.forEach((s) => (s.dataset.aktiv = String(s === neu)));
    aktuell = i;
    anzeigen(neu, sofort);
    speichern();

    // Ohne #anker in der Adresse: Chrome springt sonst nach dem Laden selbst
    // dorthin, und die Kopfzeile der Seite verschwindet.
    if (push) history.pushState({ schritt: i }, '');
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    if (fokus) neu.querySelector<HTMLElement>('[tabindex="-1"]')?.focus({ preventScroll: true });

    if (!sanft && !sofort) {
      gsap.fromTo(neu, { opacity: 0, x: 28 * richtung }, { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' });
    }
  }

  form.addEventListener('click', (e) => {
    const knopf = (e.target as HTMLElement).closest<HTMLElement>('[data-weiter], [data-zurueck]');
    if (!knopf) return;
    if (knopf.hasAttribute('data-weiter')) zeigen(Math.min(aktuell + 1, schritte.length - 1));
    else history.back();
  });

  window.addEventListener('popstate', (e) => {
    const i = typeof e.state?.schritt === 'number' ? e.state.schritt : 0;
    zeigen(Math.max(0, Math.min(i, schritte.length - 1)), { push: false });
  });

  /* --- Absenden ---------------------------------------------------------- */

  function zeigeFehler(text: string) {
    fehler.textContent = text;
    fehler.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sendet) return;
    const knopf = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    const art = knopf?.dataset.senden ?? 'extras';
    const beschriftung = knopf?.textContent ?? '';

    sendet = true;
    if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird gesendet …'; }
    logik();

    try {
      const antwort = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const daten = await antwort.json().catch(() => ({}));
      if (antwort.ok && daten.ziel) {
        schreib(`${FERTIG}:${code}`, Date.now());
        if (art === 'pflicht') {
          stand.ziel = daten.ziel;
          if (fertigLink) fertigLink.href = daten.ziel;
          zeigen(aktuell + 1);
        } else {
          schreib(SPEICHER, null);
          location.assign(daten.ziel);
          return;
        }
      } else {
        zeigeFehler(daten.meldung ?? 'Das hat nicht geklappt. Versuch es gleich nochmal.');
      }
    } catch {
      zeigeFehler('Keine Verbindung. Deine Antworten sind auf dem Gerät gespeichert — versuch es gleich nochmal.');
    }

    sendet = false;
    if (knopf) { knopf.disabled = false; knopf.textContent = beschriftung; }
  });

  fertigLink?.addEventListener('click', () => schreib(SPEICHER, null));

  /* --- Los --------------------------------------------------------------- */

  logik();
  // Wer nach dem Absenden der Pflicht zurückkommt, landet nicht vor dem
  // Abschicken-Knopf, sondern beim Zwischenhalt oder in den Extras.
  const start = Math.max(0, Math.min(stand.schritt, schritte.length - 1));
  history.replaceState({ schritt: start }, '');
  form.classList.add('ist-schrittweise');
  zeigen(start, { push: false, fokus: false, sofort: true });
}

/* --------------------------------------------------------------------------
   Danke
   -------------------------------------------------------------------------- */

export function dankeStarten() {
  const strahlen = document.querySelectorAll('[data-danke] [data-teil="strahlen"] path');
  const gewaehlt = document.querySelectorAll('[data-danke] .ist-gewaehlt');
  if (!sanft && strahlen.length) {
    gsap.timeline({ delay: 0.3 })
      .from(strahlen, { scale: 0, svgOrigin: '200 200', duration: 0.9, stagger: 0.18, ease: 'back.out(1.5)' })
      .from(gewaehlt, { opacity: 0, duration: 0.5, stagger: 0.18 }, '-=0.6');
  }

  const knopf = document.querySelector<HTMLButtonElement>('[data-teilen]');
  const status = document.querySelector<HTMLElement>('[data-teilen-status]');
  knopf?.addEventListener('click', async () => {
    const url = knopf.dataset.teilen!;
    const text = 'Was fehlt an unserer Schule? Mach beim Schülerbedarfskompass mit — 4 Minuten, anonym.';
    if (navigator.share) {
      try { await navigator.share({ title: 'Schülerbedarfskompass', text, url }); } catch { /* abgebrochen */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = 'Link kopiert.';
    } catch {
      document.querySelector<HTMLInputElement>('.teilen__link')?.select();
      if (status) status.textContent = 'Link markiert — jetzt kopieren.';
    }
  });
}
