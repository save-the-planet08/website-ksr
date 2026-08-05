/**
 * Das Vokabular der Seite: was es überhaupt an Bewegungen, Zeichen und Szenen
 * gibt. Steht bewusst allein, damit `register.ts` und die Module, die es
 * benutzen, sich nicht im Kreis importieren.
 */

/** Wie ein Element auftritt, wenn es ins Bild scrollt. */
export const auftrittArten = [
  'hoch',     // ganzer Block von unten — der ruhige Standard
  'zeile',    // Zeile für Zeile aus der Maske
  'wort',     // Wort für Wort, leicht gekippt
  'seit',     // von der Seite herein
  'maske',    // Vorhang von links
  'zahl',     // wächst mit leichtem Überschwung
  'staffel',  // Kinder nacheinander
  'gewicht',  // die Schrift wird schwerer und breiter, während sie steigt
  'zerfall',  // Wörter finden aus festgelegten Richtungen zusammen
  'blende',   // clip-path von einer Kante her
  'schere',   // geschert herein und wieder gerade
  'strich',   // eine Linie zieht sich, darüber steigt der Text
  'spur',     // mit Bewegungsunschärfe, die nachzieht
  'kippen',   // Zeilen kippen um ihre Grundlinie auf
  'zaehler',  // Ziffern zählen hoch
  'versatz',  // Zeilen abwechselnd von links und rechts
] as const;

export type AuftrittArt = (typeof auftrittArten)[number];

/**
 * Die Bildwelt. Die ersten fünf kommen unmittelbar aus dem Logo, die übrigen
 * sind daraus abgeleitet — gleiche Handschrift, neue Form.
 */
export const zeichenArten = [
  // aus dem Zeichen
  'loewe-maske',
  'balken-partitur',
  'ranke-wachstum',
  'trauben-netz',
  'wortmarke-kontur',
  // abgeleitet
  'hoehenlinien',   // Löwensilhouette, geschichtet
  'taktraster',     // der Rhythmus des Doppelbalkens als Feld
  'wellenfeld',     // die Kurve der Ranke, gestapelt
  'konstellation',  // die Streuung der Trauben, über die Fläche gezogen
  'achsengitter',   // die Achsen der Wortmarke als Linienmaß
  'kanten',         // der Doppelbalken flach gelegt, in wechselnder Länge
] as const;

export type ZeichenArt = (typeof zeichenArten)[number];

/** Was beim Scrollen in einem Abschnitt passiert. Genau eine Szene je Ort. */
export const szeneArten = [
  'haltung-maske',
  'wuensche-partitur',
  'kreis-wachstum',
  'aufruf-konstellation',
  'ebenen-schichten',
  'alltag-wellen',
  'mitmachen-kontur',
  'wuensche-zahlen',
  'termine-takt',
  'rueckblick-netz',
  'kontakt-achsen',
  'kontakt-parallaxe',
  'links-kanten',
] as const;

export type SzeneArt = (typeof szeneArten)[number];
