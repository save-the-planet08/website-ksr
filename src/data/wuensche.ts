/**
 * Die acht Wünsche des Kreisschülerrats.
 * Inhaltlich übernommen aus dem Bestand des KSR — Formulierungen überarbeitet.
 * Änderungen laufen über diese Datei, nicht über die Seiten.
 */

export interface Wunsch {
  nr: string;
  titel: string;
  kurz: string;
  text: string;
  /** Ein Wort, das den Wunsch trägt — wird groß in den Hintergrund gesetzt. */
  wort: string;
}

export const wuensche: Wunsch[] = [
  {
    nr: '01',
    titel: 'Ein Ganztag, der Bildung ist',
    kurz: 'Ganztag muss Bildungszeit sein, nicht Aufbewahrung.',
    text: 'Wer bis nachmittags in der Schule sitzt, hat ein Recht darauf, dass diese Zeit etwas wert ist. Rhythmus statt Restunterricht, echte Pausen statt Wartezeit, Förderung statt Beaufsichtigung. Ganztag ist ein Bildungskonzept — oder er ist gescheitert.',
    wort: 'Zeit',
  },
  {
    nr: '02',
    titel: 'Schule und Eltern als Partner',
    kurz: 'Zusammenarbeit statt Gegenüberstellung.',
    text: 'Zwischen Elternhaus und Schule steht zu oft ein Elternabend und sonst nichts. Wir wünschen uns Formate, in denen wirklich gearbeitet wird — gemeinsam, auf Augenhöhe, mit uns Schülerinnen und Schülern mit am Tisch statt als Tagesordnungspunkt.',
    wort: 'Partner',
  },
  {
    nr: '03',
    titel: 'Ein Kollegium, das zusammenspielt',
    kurz: 'Fächer, Lehrkräfte, Schüler — ein System.',
    text: 'Schule funktioniert nur im Zusammenspiel. Wenn jedes Fach für sich plant, tragen wir die Last: fünf Klausuren in einer Woche, dieselbe Epoche in drei Fächern, nie abgestimmt. Mehr Absprache im Kollegium kostet nichts und verändert alles.',
    wort: 'Zusammen',
  },
  {
    nr: '04',
    titel: 'Schulsozialarbeit an jeder Schule',
    kurz: 'Eine feste Stelle, kein Notnagel.',
    text: 'Konflikte, Überforderung, Krisen zu Hause — das passiert an jeder Schule, jeden Tag. Es braucht Menschen, die dafür ausgebildet und dafür bezahlt sind. Nicht eine halbe Stelle für drei Standorte. Eine Person, ansprechbar, vor Ort.',
    wort: 'Halt',
  },
  {
    nr: '05',
    titel: 'Mut zu neuen Wegen',
    kurz: 'Lernen, das zur Gegenwart passt.',
    text: 'Projektunterricht, echte Digitalisierung, fächerübergreifende Arbeit — vieles davon ist erprobt und funktioniert. Es scheitert nicht an der Idee, sondern an der Trägheit. Wir wollen Schulen, die etwas ausprobieren dürfen, ohne dafür bestraft zu werden.',
    wort: 'Neu',
  },
  {
    nr: '06',
    titel: 'Vorgaben, die umsetzbar sind',
    kurz: 'Bildungspläne müssen zur Wirklichkeit passen.',
    text: 'Zentrale Prüfungen bei ungleichen Voraussetzungen. Lehrpläne, die in der zur Verfügung stehenden Zeit nicht zu schaffen sind. Wer Standards setzt, muss auch die Bedingungen dafür schaffen — sonst verwaltet er nur den Rückstand.',
    wort: 'Maß',
  },
  {
    nr: '07',
    titel: 'Kleinere Klassen',
    kurz: 'Individuelle Förderung braucht Platz.',
    text: 'In einer Klasse mit über dreißig Köpfen ist individuelle Förderung eine Behauptung. Kleinere Gruppen sind die einzige Maßnahme, die auf jeden anderen Wunsch auf dieser Liste einzahlt. Sie ist teuer. Sie ist trotzdem richtig.',
    wort: 'Raum',
  },
  {
    nr: '08',
    titel: 'Eine Schule, an die man gerne geht',
    kurz: 'Der Wunsch hinter allen anderen.',
    text: 'Am Ende geht es um etwas Einfaches: ein Ort, an dem man lernen will. Wo Schülerinnen und Schüler morgens nicht mit Bauchschmerzen aufstehen und Lehrkräfte gerne unterrichten. Alles andere auf dieser Liste ist nur der Weg dorthin.',
    wort: 'Gerne',
  },
];
