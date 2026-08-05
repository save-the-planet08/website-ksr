/**
 * Die fünf Zeichen, die unmittelbar aus dem Logo kommen. Sie benutzen die
 * Pfaddaten aus `logo.ts` unverändert — verarbeitet wird nur, was mit ihnen
 * geschieht.
 */
import * as L from '../logo';
import { anker, rechteck, strecke, type Zeichnung } from './typen';

/* --------------------------------------------------------------------------
   Löwe als Schnittmaske
   Der Löwe wird zum Fenster: dahinter laufen Streifen, sichtbar nur in seiner
   Silhouette. Das Tier ist damit kein Bild mehr, sondern eine Öffnung.
   -------------------------------------------------------------------------- */
export function loeweMaske(): Zeichnung {
  const [x, y, b, h] = L.loeweBox;
  const anzahl = 26;
  const dicke = h / (anzahl * 1.9);

  const streifen: string[] = [];
  for (let i = 0; i < anzahl; i++) {
    // Doppelt so breit wie das Feld: die Streifen dürfen quer hindurchwandern,
    // ohne dass an den Rändern eine Lücke aufreißt.
    streifen.push(rechteck(x - b, y + (h / anzahl) * i, b * 3, dicke));
  }

  return {
    box: `${x} ${y} ${b} ${h}`,
    maske: 'silhouette',
    gruppen: [
      { name: 'silhouette', pfade: [...L.loewe] },
      { name: 'streifen', pfade: streifen },
    ],
  };
}

/* --------------------------------------------------------------------------
   Doppelbalken als Partitur
   Acht Balkenpaare, acht Wünsche. Die Höhen sind gesetzt, nicht gewürfelt —
   sie bilden eine Linie, die zweimal ansteigt und einmal einbricht.
   -------------------------------------------------------------------------- */
const partiturHoehen = [0.42, 0.68, 0.34, 0.86, 0.55, 0.78, 0.47, 1];

export function balkenPartitur(): Zeichnung {
  // Das Maß des Doppelbalkens im Logo: zwei Striche, dazwischen ein Steg.
  const [, , balkenBreite] = L.balkenBox;
  const strichBreite = 9;
  const steg = balkenBreite - strichBreite * 2;

  const paarBreite = strichBreite * 2 + steg;
  const abstand = paarBreite * 1.85;
  const hoehe = 640;
  const feldBreite = abstand * (partiturHoehen.length - 1) + paarBreite;

  const gruppen = partiturHoehen.map((anteil, i) => {
    const x = i * abstand;
    const h = hoehe * anteil;
    return {
      name: `takt-${i}`,
      pfade: [
        rechteck(x, hoehe - h, strichBreite, h),
        rechteck(x + strichBreite + steg, hoehe - h, strichBreite, h),
      ],
    };
  });

  return { box: `0 0 ${feldBreite} ${hoehe}`, gruppen };
}

/* --------------------------------------------------------------------------
   Rebe und Trauben
   Die Ranke wächst, die Beeren setzen sich. Das gab es schon auf der
   Startseite — hier wird es zum Zeichen wie alle anderen auch.
   -------------------------------------------------------------------------- */
export function rankeWachstum(): Zeichnung {
  const [rx, ry, rb] = L.rankeBox;
  const [, ty, , th] = L.traubenBox;
  const rand = 10;

  return {
    box: `${rx - rand} ${ry - rand} ${rb + rand * 2} ${ty + th - ry + rand * 2}`,
    gruppen: [
      { name: 'ranke', pfade: [...L.ranke] },
      { name: 'trauben', pfade: [...L.trauben] },
    ],
  };
}

/* --------------------------------------------------------------------------
   Trauben als Netz
   Jede Beere ein Knoten, jede kurze Strecke eine Verbindung. Die Traube ist
   das Bild dafür, dass Einzelne zusammenhängen — hier wird es gezeigt.
   -------------------------------------------------------------------------- */
export function traubenNetz(): Zeichnung {
  const [x, y, b, h] = L.traubenBox;
  const knoten = L.trauben.map(anker);

  // Nur nahe Beeren verbinden, sonst wird aus dem Netz ein Knäuel.
  const weite = Math.min(b, h) * 0.27;
  const kanten: string[] = [];
  for (let i = 0; i < knoten.length; i++) {
    for (let j = i + 1; j < knoten.length; j++) {
      const dx = knoten[i][0] - knoten[j][0];
      const dy = knoten[i][1] - knoten[j][1];
      if (Math.hypot(dx, dy) <= weite) {
        kanten.push(strecke(knoten[i][0], knoten[i][1], knoten[j][0], knoten[j][1]));
      }
    }
  }

  const rand = 14;
  return {
    box: `${x - rand} ${y - rand} ${b + rand * 2} ${h + rand * 2}`,
    gruppen: [
      { name: 'kanten', pfade: kanten, strich: true, breite: 1.6 },
      // Die Beeren bleiben offen. Massiv gefüllt verschlucken sie genau das
      // Netz, um das es hier geht.
      { name: 'beeren', pfade: [...L.trauben], strich: true, breite: 1.6 },
    ],
  };
}

/* --------------------------------------------------------------------------
   Wortmarke als Kontur
   Dieselben Buchstaben, aber nur ihr Umriss. Sie schreiben sich beim Scrollen
   selbst — der Schluss der Seite, der zurück an den Anfang zeigt.
   -------------------------------------------------------------------------- */
export function wortmarkeKontur(): Zeichnung {
  const [x, y, b, h] = L.wortmarkeBox;
  const rand = 12;

  return {
    box: `${x - rand} ${y - rand} ${b + rand * 2} ${h + rand * 2}`,
    gruppen: L.wortmarke.map((d, i) => ({
      name: `zug-${i}`,
      pfade: [d],
      strich: true,
      breite: 2.5,
    })),
  };
}
