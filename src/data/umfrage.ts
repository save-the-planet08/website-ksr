/**
 * Der Schülerbedarfskompass — einzige Quelle für alle Fragen.
 *
 * Wortlaut nach Armandos Vorlage (`business/schuelerbedarfskompass.md`).
 * Die IDs sind der Vertrag mit der Datenbank: Ändert sich ein Text, bleibt die
 * ID. Nur so lassen sich die Durchgänge alle zwei Jahre vergleichen. Eine neue
 * Bedeutung bekommt eine neue ID, nie eine alte.
 *
 * Gespeichert wird flach: `f4` → "ja", `f5` → ["geruch", "kalt"],
 * `f3.toiletten` → "2", `f10.wem` → Freitext.
 */

export interface Option { id: string; text: string }

/** Die Frage erscheint nur, wenn die genannte Frage eine dieser Antworten hat. */
export interface Bedingung { frage: string; ist: string[] }

interface Basis {
  id: string;
  nr?: number;
  text: string;
  hinweis?: string;
  wenn?: Bedingung;
}

export type Frage =
  | (Basis & {
      art: 'einzel';
      optionen: Option[];
      /** Ein Textfeld, das bei bestimmten Antworten aufgeht. */
      unterfeld?: { id: string; text: string; bei: string[] };
    })
  | (Basis & {
      art: 'mehr';
      optionen: Option[];
      max?: number;
      /** Diese Antwort schließt alle anderen aus. */
      allein?: string;
      /** Die Option `sonstiges` bekommt ein Textfeld. */
      sonstiges?: boolean;
    })
  | (Basis & {
      art: 'matrix';
      zeilen: Option[];
      skala: Option[];
      /** Schulnoten: kompakte Tastenreihe statt Wörter. */
      noten?: boolean;
    })
  | (Basis & { art: 'text'; max: number });

export interface Teil {
  id: string;
  /** Kurzzeichen auf dem Kompass: A–E, 1–4. */
  zeichen: string;
  titel: string;
  modul: boolean;
  fragen: Frage[];
}

export const UMFRAGE = '2027';
export const FREITEXT_MAX = 500;
export const KEINE_NAMEN = 'Bitte keine Namen von Personen nennen.';

const o = (id: string, text: string): Option => ({ id, text });

const NOTEN: Option[] = [
  o('1', '1'), o('2', '2'), o('3', '3'), o('4', '4'), o('5', '5'), o('6', '6'),
  o('nein', 'nutze ich nicht'),
];

export const teile: Teil[] = [
  {
    id: 'a', zeichen: 'A', titel: 'Zu dir', modul: false,
    fragen: [
      // Frage 1 ist der Schulcode — er wird vor dem Fragebogen abgefragt.
      {
        id: 'f2', nr: 2, art: 'einzel', text: 'In welcher Jahrgangsstufe bist du?',
        optionen: [o('5-7', 'Jahrgang 5–7'), o('8-10', 'Jahrgang 8–10'), o('11-13', 'Jahrgang 11–13')],
      },
    ],
  },
  {
    id: 'b', zeichen: 'B', titel: 'Deine Noten für deine Schule', modul: false,
    fragen: [
      {
        id: 'f3', nr: 3, art: 'matrix', noten: true,
        text: 'Welche Note würdest du diesen Bereichen an deiner Schule geben?',
        zeilen: [
          o('toiletten', 'Toiletten'),
          o('mensa', 'Mensa und Essen'),
          o('klassenraeume', 'Klassenräume (Zustand)'),
          o('schulhof', 'Schulhof und Pausenbereiche'),
          o('parkplaetze', 'Fahrrad- und Autoparkplätze'),
          o('sporthallen', 'Sporthallen'),
        ],
        skala: NOTEN,
      },
    ],
  },
  {
    id: 'c', zeichen: 'C', titel: 'Toiletten', modul: false,
    fragen: [
      {
        id: 'f4', nr: 4, art: 'einzel', text: 'Nutzt du die Schultoiletten?',
        optionen: [
          o('ja', 'Ja, immer wenn ich muss'),
          o('notfall', 'Nur, wenn es nicht anders geht'),
          o('nein', 'Nein, ich gehe nur zu Hause'),
        ],
      },
      {
        id: 'f5', nr: 5, art: 'mehr', allein: 'nichts', sonstiges: true,
        text: 'Was hält dich davon ab, die Schultoiletten zu nutzen?',
        optionen: [
          o('geruch', 'Der Geruch'),
          o('schmutzig', 'Sie sind schmutzig'),
          o('papier-seife', 'Es fehlt Toilettenpapier oder Seife'),
          o('einsehbar', 'Man kann in die Kabinen hineinsehen'),
          o('andere', 'Ich mag es nicht, wenn andere mit im Raum sind'),
          o('schloss', 'Die Kabinentür lässt sich nicht abschließen'),
          o('abgeschlossen', 'Die Toiletten sind abgeschlossen'),
          o('schlangen', 'Es gibt lange Schlangen'),
          o('pause-weg', 'Die Pause ist zu kurz oder der Weg zu weit'),
          o('kalt', 'Es ist zu kalt'),
          o('nichts', 'Nichts, ich nutze sie ohne Probleme'),
          o('sonstiges', 'Sonstiges'),
        ],
      },
      {
        id: 'f6', nr: 6, art: 'matrix',
        text: 'Wie oft ist Folgendes in der Regel in den Toiletten vorhanden?',
        zeilen: [o('papier', 'Toilettenpapier'), o('seife', 'Seife zum Händewaschen')],
        skala: [o('immer', 'immer'), o('oft', 'oft'), o('selten', 'selten'), o('nie', 'nie'), o('weissnicht', 'weiß nicht')],
      },
      {
        id: 'f7', nr: 7, art: 'einzel',
        text: 'Hast du in diesem Schuljahr schon mal weniger getrunken oder gegessen, damit du in der Schule nicht zur Toilette musst?',
        optionen: [o('immer', 'immer'), o('oft', 'oft'), o('selten', 'selten'), o('nie', 'nie')],
      },
      {
        id: 'f8', nr: 8, art: 'mehr', allein: 'nichts',
        text: 'Was ist aktuell an den Toiletten kaputt oder beschädigt?',
        optionen: [
          o('schloss', 'Türschloss oder Riegel'),
          o('kabine', 'Kabinentür oder Kabinenwand'),
          o('spuelung', 'Spülung'),
          o('spender', 'Seifen- oder Papierspender'),
          o('wasserhahn', 'Wasserhahn'),
          o('trockner', 'Händetrockner'),
          o('schmiererei', 'Schmierereien oder Dreck'),
          o('nichts', 'Nichts davon'),
        ],
      },
    ],
  },
  {
    id: 'd', zeichen: 'D', titel: 'Wenn etwas kaputt ist', modul: false,
    fragen: [
      {
        id: 'f9', nr: 9, art: 'einzel',
        text: 'Weißt du, an wen du dich wenden kannst, wenn etwas kaputt ist oder fehlt?',
        optionen: [o('ja', 'Ja'), o('nein', 'Nein')],
      },
      {
        id: 'f10', nr: 10, art: 'einzel', text: 'Hast du schon mal etwas gemeldet? Was ist danach passiert?',
        optionen: [
          o('nie', 'Ich habe noch nie etwas gemeldet'),
          o('repariert', 'Gemeldet, und es wurde bald repariert'),
          o('lange', 'Gemeldet, aber es hat lange gedauert'),
          o('nichts', 'Gemeldet, aber es ist nichts passiert'),
          o('unklar', 'Gemeldet, ich weiß nicht, was daraus wurde'),
        ],
        unterfeld: { id: 'wem', text: 'Wem hast du es gemeldet?', bei: ['repariert', 'lange', 'nichts', 'unklar'] },
      },
    ],
  },
  {
    id: 'e', zeichen: 'E', titel: 'Was soll besser werden?', modul: false,
    fragen: [
      {
        id: 'f11', nr: 11, art: 'mehr', max: 3, sonstiges: true,
        text: 'Was sollte an deiner Schule als Erstes besser werden?',
        hinweis: 'Höchstens drei.',
        optionen: [
          o('toiletten', 'Toiletten'),
          o('mensa', 'Mensa und Essen'),
          o('klassenraeume', 'Klassenräume'),
          o('raumklima', 'Raumklima (zu heiß, zu kalt, schlechte Luft)'),
          o('schulhof', 'Schulhof und Pausenbereiche'),
          o('parkplaetze', 'Fahrrad- und Autoparkplätze'),
          o('sporthallen', 'Sporthallen'),
          o('schulweg', 'Schulweg und Bus'),
          o('sonstiges', 'Sonstiges'),
        ],
      },
      {
        id: 'f12', nr: 12, art: 'text', max: FREITEXT_MAX,
        text: 'Was würdest du an deiner Schule als Erstes ändern? Beschreibe es in ein bis zwei Sätzen.',
        hinweis: KEINE_NAMEN,
      },
    ],
  },
  {
    id: 'm1', zeichen: '1', titel: 'Mensa', modul: true,
    fragen: [
      {
        id: 'mensa', art: 'einzel', text: 'Gibt es an deiner Schule eine Mensa?',
        optionen: [o('ja', 'Ja'), o('nein', 'Nein')],
      },
      {
        id: 'f13', nr: 13, art: 'einzel', text: 'Wie oft isst du pro Woche in der Mensa?',
        wenn: { frage: 'mensa', ist: ['ja'] },
        optionen: [o('nie', 'nie'), o('1-2', '1–2 Mal'), o('3-5', '3–5 Mal')],
      },
      {
        id: 'f14', nr: 14, art: 'mehr', sonstiges: true,
        text: 'Warum isst du selten oder nie dort?',
        wenn: { frage: 'f13', ist: ['nie', '1-2'] },
        optionen: [
          o('teuer', 'Es ist zu teuer'),
          o('wartezeit', 'Die Wartezeit ist zu lang'),
          o('angebot', 'Das Angebot gefällt mir nicht'),
          o('laut', 'Es ist zu laut'),
          o('sitzplaetze', 'Es gibt zu wenige Sitzplätze'),
          o('atmosphaere', 'Die Atmosphäre gefällt mir nicht'),
          o('mitgebracht', 'Ich bringe mein Essen mit'),
          o('sonstiges', 'Sonstiges'),
        ],
      },
      {
        id: 'f15', nr: 15, art: 'matrix', text: 'Wie sehr stimmst du zu?',
        wenn: { frage: 'mensa', ist: ['ja'] },
        zeilen: [
          o('wartezeit', 'Die Wartezeit ist okay'),
          o('lautstaerke', 'Die Lautstärke ist okay'),
          o('sitzplaetze', 'Es gibt genug Sitzplätze'),
          o('preis', 'Das Essen ist sein Geld wert'),
        ],
        skala: [o('stimmt', 'stimmt'), o('teils', 'teils teils'), o('nicht', 'stimmt nicht')],
      },
    ],
  },
  {
    id: 'm2', zeichen: '2', titel: 'Räume und Schulhof', modul: true,
    fragen: [
      {
        id: 'f16', nr: 16, art: 'matrix', text: 'Wie oft ist es in den Klassenräumen zu heiß oder zu kalt?',
        zeilen: [o('heiss', 'Zu heiß im Sommer'), o('kalt', 'Zu kalt im Winter')],
        skala: [o('nie', 'nie'), o('selten', 'selten'), o('oft', 'oft'), o('fastimmer', 'fast immer')],
      },
      {
        id: 'f17', nr: 17, art: 'matrix', text: 'Wie ist es auf dem Schulhof und in den Pausenbereichen?',
        zeilen: [o('sitzplaetze', 'Es gibt genug Sitzplätze'), o('entspannen', 'Es gibt einen Ort zum Entspannen')],
        skala: [o('ja', 'Ja'), o('nein', 'Nein')],
      },
      {
        id: 'f18', nr: 18, art: 'text', max: FREITEXT_MAX,
        text: 'Welche Räume würdest du in Freistunden gern nutzen, darfst oder kannst es aber nicht?',
        hinweis: KEINE_NAMEN,
      },
    ],
  },
  {
    id: 'm3', zeichen: '3', titel: 'Schulweg', modul: true,
    fragen: [
      {
        id: 'f19', nr: 19, art: 'mehr', text: 'Wie kommst du meistens zur Schule?',
        optionen: [
          o('bus', 'Bus'), o('bahn', 'Bahn'), o('fahrrad', 'Fahrrad'), o('fuss', 'zu Fuß'),
          o('auto', 'Auto bzw. Mitfahrt'), o('roller', 'Roller bzw. E-Scooter'),
        ],
      },
      {
        id: 'f20', nr: 20, art: 'einzel', text: 'Wie lange brauchst du zur Schule?',
        optionen: [
          o('u15', 'unter 15 Min.'), o('15-30', '15–30 Min.'), o('30-45', '30–45 Min.'),
          o('45-60', '45–60 Min.'), o('ue60', 'über 1 Stunde'),
        ],
      },
      {
        id: 'f21', nr: 21, art: 'einzel', text: 'Gibt es an deiner Schule genug Fahrradständer?',
        optionen: [o('ja', 'Ja'), o('teilweise', 'Teilweise'), o('nein', 'Nein'), o('weissnicht', 'Weiß nicht')],
      },
      {
        id: 'f22', nr: 22, art: 'matrix', noten: true,
        text: 'Welche Note gibst du der Busverbindung zu deiner Schule?',
        zeilen: [o('bus', 'Busverbindung')],
        skala: NOTEN,
      },
    ],
  },
  {
    id: 'm4', zeichen: '4', titel: 'Privatsphäre', modul: true,
    fragen: [
      {
        id: 'f23', nr: 23, art: 'einzel',
        text: 'Hast du in den Schultoiletten genug Privatsphäre, um Hygieneartikel (z. B. Tampons oder Binden) in Ruhe zu wechseln?',
        optionen: [
          o('ja', 'Ja'), o('teilweise', 'Teilweise'), o('nein', 'Nein'),
          o('betrifft-nicht', 'Betrifft mich nicht'), o('keine-angabe', 'Keine Angabe'),
        ],
      },
    ],
  },
];

export const pflicht = teile.filter((t) => !t.modul);
export const module = teile.filter((t) => t.modul);

/**
 * Die neun Optionen von Frage 11 liegen auf den neun Plätzen des Kompasses —
 * am Ende zeigt er auf die, die jemand gewählt hat. Kurzform für die
 * Beschriftung am Ring.
 */
export const prioritaeten: { id: string; kurz: string }[] = [
  { id: 'toiletten', kurz: 'Toiletten' },
  { id: 'mensa', kurz: 'Mensa' },
  { id: 'klassenraeume', kurz: 'Räume' },
  { id: 'raumklima', kurz: 'Raumklima' },
  { id: 'schulhof', kurz: 'Schulhof' },
  { id: 'parkplaetze', kurz: 'Parkplätze' },
  { id: 'sporthallen', kurz: 'Sporthallen' },
  { id: 'schulweg', kurz: 'Schulweg' },
  { id: 'sonstiges', kurz: 'Sonstiges' },
];
