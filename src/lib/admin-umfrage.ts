/**
 * Der Umfrage-Bereich in `/admin`: Zeitraum, Schulen mit Codes, Auswertung.
 *
 * Einzelne Antworten sieht hier niemand — die Datenbank gibt nur Summen
 * heraus, und je Schule nur Fragen, die mindestens zehn Personen beantwortet
 * haben. Alles, was aus der Datenbank kommt, landet als Text im DOM, nie als
 * HTML: Schulnamen und Freitexte könnten sonst Markup einschleusen.
 */
import { supabase } from './supabase';
import { teile, UMFRAGE, type Frage } from '../data/umfrage';

type Melde = (text: string, fehler?: boolean) => void;
type Kind = Node | string | null | undefined | false;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, attr: Record<string, string> = {}, ...kinder: Kind[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v);
  for (const k of kinder) if (k) e.append(k);
  return e;
}

interface Schule { id: string; name: string; code: string; schueler: number | null }
interface Summe { schule: string | null; frage: string; wert: string; anzahl: number }

export async function umfrageZeigen(bereich: HTMLElement, melde: Melde) {
  bereich.replaceChildren(el('p', { class: 'klein' }, 'Lädt …'));

  const [runde, schulen, uebersicht] = await Promise.all([
    supabase.from('umfragen').select('start, ende').eq('id', UMFRAGE).single(),
    supabase.from('schulen').select('id, name, code, schueler').order('name'),
    supabase.rpc('umfrage_uebersicht', { p_umfrage: UMFRAGE }),
  ]);
  const fehler = runde.error ?? schulen.error ?? uebersicht.error;
  if (fehler) {
    bereich.replaceChildren();
    return melde(`Laden fehlgeschlagen: ${fehler.message}`, true);
  }

  const anzahl = new Map<string, number>(
    (uebersicht.data as { schule_id: string; anzahl: number }[]).map((z) => [z.schule_id, Number(z.anzahl)]),
  );

  bereich.replaceChildren(
    zeitraum(runde.data as { start: string | null; ende: string | null }, bereich, melde),
    schulListe(schulen.data as Schule[], anzahl, bereich, melde),
    auswertung(schulen.data as Schule[], melde),
  );
}

/* --------------------------------------------------------------------------
   Zeitraum
   -------------------------------------------------------------------------- */

function zeitraum(r: { start: string | null; ende: string | null }, bereich: HTMLElement, melde: Melde) {
  const heute = new Date().toISOString().slice(0, 10);
  const laeuft = !!(r.start && r.ende && r.start <= heute && heute <= r.ende);

  const start = el('input', { type: 'date', name: 'start', value: r.start ?? '' });
  const ende = el('input', { type: 'date', name: 'ende', value: r.ende ?? '' });
  const form = el('form', { class: 'formular' },
    el('p', { class: 'klein' },
      laeuft
        ? `Die Umfrage läuft bis ${new Date(r.ende!).toLocaleDateString('de-DE')}.`
        : 'Die Umfrage ist zu. Ohne Start und Ende nimmt sie nichts an.'),
    el('label', {}, 'Start ', start),
    el('label', {}, 'Ende (letzter Tag) ', ende),
    el('div', { class: 'formular__knoepfe' },
      el('button', { type: 'submit', class: 'knopf' }, 'Zeitraum speichern')),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('umfragen')
      .update({ start: start.value || null, ende: ende.value || null }).eq('id', UMFRAGE);
    if (error) return melde(`Speichern fehlgeschlagen: ${error.message}`, true);
    melde('Zeitraum gespeichert.');
    await umfrageZeigen(bereich, melde);
  });

  return el('section', { class: 'umfrage-block' }, el('h2', { class: 'umfrage-block__titel' }, `Umfrage ${UMFRAGE}`), form);
}

/* --------------------------------------------------------------------------
   Schulen und Codes
   -------------------------------------------------------------------------- */

function schulListe(schulen: Schule[], anzahl: Map<string, number>, bereich: HTMLElement, melde: Melde) {
  const liste = el('ul', { class: 'eintraege' });

  for (const s of schulen) {
    const n = anzahl.get(s.id) ?? 0;
    const auffaellig = s.schueler !== null && n > s.schueler;
    const link = `${location.origin}/umfrage?code=${s.code}`;

    const kopieren = el('button', { type: 'button' }, 'Link kopieren');
    kopieren.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(link);
        melde(`Link für ${s.name} kopiert.`);
      } catch {
        melde(link);
      }
    });

    const loeschen = el('button', { type: 'button' }, 'Löschen');
    loeschen.addEventListener('click', async () => {
      if (loeschen.dataset.sicher !== 'ja') {
        loeschen.dataset.sicher = 'ja';
        loeschen.textContent = n ? `Mit ${n} Antworten löschen?` : 'Wirklich löschen?';
        return;
      }
      const { error } = await supabase.from('schulen').delete().eq('id', s.id);
      if (error) return melde(`Löschen fehlgeschlagen: ${error.message}`, true);
      melde('Schule gelöscht.');
      await umfrageZeigen(bereich, melde);
    });

    liste.append(el('li', { class: 'eintrag' },
      el('div', {},
        el('strong', {}, s.name),
        el('span', { class: 'klein' },
          `${s.code} · ${n} ${n === 1 ? 'Antwort' : 'Antworten'}`,
          s.schueler ? ` von ${s.schueler} Schülern` : '',
          auffaellig ? ' · mehr Antworten als Schüler — prüfen' : ''),
      ),
      kopieren,
      loeschen,
    ));
  }

  if (!schulen.length) liste.append(el('li', { class: 'klein' }, 'Noch keine Schulen. Lege unten die erste an.'));

  const name = el('input', { type: 'text', name: 'name', required: '', maxlength: '200' });
  const schueler = el('input', { type: 'number', name: 'schueler', min: '1', inputmode: 'numeric' });
  const neu = el('form', { class: 'formular' },
    el('label', {}, 'Name der Schule ', name),
    el('label', {}, 'Schülerzahl (für die Ausreißerprüfung, freiwillig) ', schueler),
    el('div', { class: 'formular__knoepfe' }, el('button', { type: 'submit', class: 'knopf' }, 'Schule anlegen')),
  );
  neu.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('schulen')
      .insert({ name: name.value.trim(), schueler: schueler.value ? Number(schueler.value) : null });
    if (error) return melde(`Anlegen fehlgeschlagen: ${error.message}`, true);
    melde('Schule angelegt — der Code steht in der Liste.');
    await umfrageZeigen(bereich, melde);
  });

  return el('section', { class: 'umfrage-block' },
    el('h2', { class: 'umfrage-block__titel' }, 'Schulen und Codes'),
    el('p', { class: 'klein' },
      'Jede Schule bekommt einen Code. Der Link enthält ihn schon — als QR-Code an die SV geben, dann muss niemand tippen.'),
    liste,
    neu,
  );
}

/* --------------------------------------------------------------------------
   Auswertung
   -------------------------------------------------------------------------- */

function auswertung(schulen: Schule[], melde: Melde) {
  const wahl = el('select', { name: 'schule' }, el('option', { value: '' }, 'Alle Schulen'));
  for (const s of schulen) wahl.append(el('option', { value: s.name }, s.name));
  const laden = el('button', { type: 'button', class: 'knopf' }, 'Auswertung laden');
  const ausgabe = el('div', { class: 'auswertung' });

  let summen: Summe[] | null = null;
  const zeigen = () => summen && ausgabe.replaceChildren(...darstellen(summen.filter((z) => (z.schule ?? '') === wahl.value)));

  laden.addEventListener('click', async () => {
    laden.textContent = 'Lädt …';
    const { data, error } = await supabase.rpc('umfrage_auswertung', { p_umfrage: UMFRAGE });
    laden.textContent = 'Neu laden';
    if (error) return melde(`Auswertung fehlgeschlagen: ${error.message}`, true);
    summen = (data as Summe[]).map((z) => ({ ...z, anzahl: Number(z.anzahl) }));
    zeigen();
  });
  wahl.addEventListener('change', zeigen);

  return el('section', { class: 'umfrage-block' },
    el('h2', { class: 'umfrage-block__titel' }, 'Auswertung'),
    el('p', { class: 'klein' },
      'Je Schule erscheint eine Frage erst, wenn mindestens zehn Personen sie beantwortet haben. Darunter bleibt sie leer — das schützt die Anonymität.'),
    el('div', { class: 'formular__knoepfe' }, wahl, laden),
    ausgabe,
  );
}

function darstellen(summen: Summe[]): Node[] {
  if (!summen.length) return [el('p', { class: 'klein' }, 'Noch nichts auszuwerten — zu wenige Antworten.')];

  const je = new Map<string, Summe[]>();
  for (const z of summen) {
    if (!je.has(z.frage)) je.set(z.frage, []);
    je.get(z.frage)!.push(z);
  }

  const knoten: Node[] = [];
  for (const t of teile) {
    knoten.push(el('h3', { class: 'auswertung__teil' }, `${t.zeichen} · ${t.titel}`));
    for (const f of t.fragen) knoten.push(...frageDarstellen(f, je));
  }
  return knoten;
}

function frageDarstellen(f: Frage, je: Map<string, Summe[]>): Node[] {
  const kopf = el('p', { class: 'auswertung__frage' }, f.nr ? `${f.nr}. ${f.text}` : f.text);
  const leer = el('p', { class: 'klein' }, 'Zu wenige Antworten.');

  if (f.art === 'text') return [kopf, freitexte(je.get(f.id)) ?? leer];

  if (f.art === 'matrix') {
    const zeilen = f.zeilen.map((z) => {
      const daten = je.get(`${f.id}.${z.id}`);
      return el('div', { class: 'auswertung__zeile' },
        el('p', { class: 'klein' }, z.text),
        daten ? balken(f.skala, daten) : leer.cloneNode(true));
    });
    return [kopf, ...zeilen];
  }

  const daten = je.get(f.id);
  // Bei Mehrfachwahl addieren sich Nennungen nicht zu Personen — dort nur Zahlen.
  const teil: Node[] = [kopf, daten ? balken(f.optionen, daten, f.art === 'einzel') : leer];
  const zusatz = f.art === 'einzel' ? f.unterfeld && `${f.id}.${f.unterfeld.id}` : f.sonstiges && `${f.id}.sonstiges`;
  const texte = zusatz ? freitexte(je.get(zusatz)) : null;
  if (texte) teil.push(texte);
  return teil;
}

function balken(optionen: { id: string; text: string }[], daten: Summe[], prozent = true) {
  const summe = daten.reduce((a, z) => a + z.anzahl, 0);
  const groesste = Math.max(...daten.map((z) => z.anzahl));
  return el('ul', { class: 'balken' }, ...optionen.map((o) => {
    const n = daten.find((z) => z.wert === o.id)?.anzahl ?? 0;
    const anteil = summe ? Math.round((n / summe) * 100) : 0;
    return el('li', { style: `--anteil:${groesste ? n / groesste : 0}` },
      el('span', { class: 'balken__text' }, o.text),
      el('span', { class: 'balken__zahl' }, prozent ? `${n} · ${anteil} %` : String(n)));
  }));
}

function freitexte(daten: Summe[] | undefined) {
  if (!daten?.length) return null;
  return el('details', { class: 'freitexte' },
    el('summary', {}, `${daten.length} Freitexte`),
    el('ul', {}, ...daten.map((z) => el('li', {}, z.wert, z.anzahl > 1 ? ` (${z.anzahl}×)` : ''))));
}
