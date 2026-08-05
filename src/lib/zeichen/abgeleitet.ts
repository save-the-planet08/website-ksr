/**
 * Die sechs abgeleiteten Zeichen.
 *
 * Sie zeigen nichts aus dem Logo, aber sie sind nach seinen Maßen gebaut: der
 * Umriss des Löwen, das Verhältnis des Doppelbalkens, die Kurve der Ranke, die
 * Streuung der Trauben, die Achsen der Wortmarke. Dieselbe Handschrift, neue
 * Form — deshalb passen sie dazu, ohne sich zu wiederholen.
 */
import * as L from '../logo';
import {
  anker, konturPfad, kreis, rechteck, strecke, wellenPfad, type Zeichnung,
} from './typen';

/* --------------------------------------------------------------------------
   Höhenlinien — aus der Figur wird eine Landschaft
   Der Löwe steht aufrecht: hoch, schmal, nach einer Seite geneigt. Dieses
   Verhältnis gibt die Kuppe vor, zwölf Schichten geben ihr die Höhe. Aus einem
   Wappentier wird der Landkreis, in dem es hängt — und aus Schichten werden
   Ebenen, was neben „Von der Klasse bis ins Ministerium" genau stimmt.
   -------------------------------------------------------------------------- */
const kuppenProfil = [1, 0.93, 1.04, 0.88, 0.97, 1.08, 0.91, 1.02, 0.86, 1.05, 0.94, 0.99];

export function hoehenlinien(): Zeichnung {
  const [, , loeweBreite, loeweHoehe] = L.loeweBox;
  const verhaeltnis = loeweHoehe / loeweBreite;

  const breite = 900;
  const hoehe = breite * verhaeltnis;
  const schichten = 12;

  // Der Gipfel sitzt nicht in der Mitte — sonst sind es Ringe, kein Hang.
  const gipfelX = breite * 0.58;
  const gipfelY = hoehe * 0.42;

  return {
    box: `0 0 ${breite} ${hoehe}`,
    gruppen: Array.from({ length: schichten }, (_, i) => {
      const t = i / (schichten - 1);
      const faktor = 1 - t * 0.88;
      return {
        name: `schicht-${i}`,
        pfade: [konturPfad(
          // Jede höhere Linie rückt ein Stück auf den Gipfel zu.
          breite / 2 + (gipfelX - breite / 2) * t,
          hoehe / 2 + (gipfelY - hoehe / 2) * t,
          breite * 0.46 * faktor,
          hoehe * 0.44 * faktor,
          kuppenProfil,
        )],
        strich: true,
        breite: 1.4,
        deckung: 0.35 + t * 0.55,
      };
    }),
  };
}

/* --------------------------------------------------------------------------
   Taktraster — der Rhythmus des Doppelbalkens als Feld
   Zwei Striche, ein Steg, immer derselbe Abstand. Vierzehnmal nebeneinander
   und siebenmal gequert ergibt das ein Kalenderblatt.
   -------------------------------------------------------------------------- */
export function taktraster(): Zeichnung {
  // Das Verhältnis aus dem Logo: Strich zu Steg wie 9 zu 29.
  const strich = 2;
  const steg = (29 / 9) * strich;
  const paar = strich * 2 + steg;
  const abstand = paar * 8.4;

  const spalten = 14;
  const zeilen = 7;
  const breite = abstand * spalten;
  const hoehe = 700;

  const senkrecht = [];
  for (let i = 0; i < spalten; i++) {
    const x = i * abstand + abstand / 2;
    senkrecht.push({
      name: `takt-${i}`,
      pfade: [rechteck(x, 0, strich, hoehe), rechteck(x + strich + steg, 0, strich, hoehe)],
      deckung: 0.55,
    });
  }

  const quer = [];
  for (let j = 1; j < zeilen; j++) {
    const y = (hoehe / zeilen) * j;
    quer.push({
      name: `quer-${j}`,
      pfade: [strecke(0, y, breite, y)],
      strich: true,
      breite: 1,
      deckung: 0.28,
    });
  }

  return { box: `0 0 ${breite} ${hoehe}`, gruppen: [...quer, ...senkrecht] };
}

/* --------------------------------------------------------------------------
   Wellenfeld — die Kurve der Ranke, gestapelt
   Das Höhen-zu-Längen-Verhältnis der Ranke gibt die Welle vor. Zwölfmal
   übereinander und jedes Mal ein Stück versetzt: Weinbergzeilen am Hang.
   -------------------------------------------------------------------------- */
export function wellenfeld(): Zeichnung {
  const [, , rankeBreite, rankeHoehe] = L.rankeBox;
  const laenge = 380;
  const hoehe = (laenge * (rankeHoehe / rankeBreite)) / 2;

  const breite = 1200;
  const feldHoehe = 620;
  const zeilen = 12;

  const gruppen = [];
  for (let i = 0; i < zeilen; i++) {
    const y = (feldHoehe / (zeilen - 1)) * i;
    gruppen.push({
      name: `zeile-${i}`,
      // Der Versatz je Zeile ist fest: die Wellen laufen schräg durchs Bild,
      // statt übereinander zu stehen.
      pfade: [wellenPfad(-laenge, breite + laenge, y, hoehe, laenge, i * 0.11)],
      strich: true,
      breite: 1.6,
      deckung: 0.25 + (i / zeilen) * 0.55,
    });
  }

  return { box: `0 0 ${breite} ${feldHoehe}`, gruppen };
}

/* --------------------------------------------------------------------------
   Konstellation — die Streuung der Trauben, über die Fläche gezogen
   Dieselbe Anordnung wie in der Traube, aber weit auseinander und in zwei
   Größen: aus einer Frucht wird eine Karte mit Orten darauf.
   -------------------------------------------------------------------------- */
export function konstellation(): Zeichnung {
  const [tx, ty, tb, th] = L.traubenBox;
  const breite = 1400;
  const hoehe = 620;

  // Die Beerenlage auf Einheitsmaß bringen — und dabei kippen: die Traube ist
  // hoch und schmal, das Feld ist breit und flach. Ohne den Tausch stünden
  // alle Orte in einer Säule.
  const roh = L.trauben.map(anker).map(([x, y]) => [(y - ty) / th, (x - tx) / tb]);

  // Dreimal verschieden über das Feld gelegt: drei Gegenden, ein Kreis.
  const lagen = [
    { sx: 0.4, sy: 0.86, dx: 0.01, dy: 0.06, r: 4.2 },
    { sx: 0.33, sy: 0.58, dx: 0.36, dy: 0.34, r: 3.2 },
    { sx: 0.27, sy: 0.48, dx: 0.7, dy: 0.08, r: 2.6 },
  ];

  const punkte: [number, number, number][] = [];
  for (const lage of lagen) {
    for (const [ex, ey] of roh) {
      punkte.push([
        (lage.dx + ex * lage.sx) * breite,
        (lage.dy + ey * lage.sy) * hoehe,
        lage.r,
      ]);
    }
  }

  // Verbindungen nur zwischen nahen Orten, und gedeckelt: ein Netz soll man
  // noch lesen können, und jede Linie ist Gewicht im HTML.
  const weite = 150;
  const grenze = 70;
  const kanten: string[] = [];
  for (let i = 0; i < punkte.length && kanten.length < grenze; i++) {
    for (let j = i + 1; j < punkte.length && kanten.length < grenze; j++) {
      const d = Math.hypot(punkte[i][0] - punkte[j][0], punkte[i][1] - punkte[j][1]);
      if (d <= weite) kanten.push(strecke(punkte[i][0], punkte[i][1], punkte[j][0], punkte[j][1]));
    }
  }

  return {
    box: `0 0 ${breite} ${hoehe}`,
    gruppen: [
      { name: 'wege', pfade: kanten, strich: true, breite: 1, deckung: 0.35 },
      { name: 'orte', pfade: punkte.map(([x, y, r]) => kreis(x, y, r)) },
    ],
  };
}

/* --------------------------------------------------------------------------
   Achsengitter — die Achsen der Wortmarke als Linienmaß
   Versalhöhe, x-Höhe, Grundlinie: die drei Linien, auf denen die Wortmarke
   sitzt, hier ohne Buchstaben. Ein Schreibheft, das auf Text wartet.
   -------------------------------------------------------------------------- */
export function achsengitter(): Zeichnung {
  const [wx, , wb, versalhoehe] = L.wortmarkeBox;
  const xHoehe = versalhoehe * 0.52;

  const breite = 1400;
  const zeilen = 3;
  const takt = versalhoehe * 1.62;
  const hoehe = takt * zeilen;
  const masstab = breite / wb;

  const gruppen = [];
  for (let i = 0; i < zeilen; i++) {
    const oben = i * takt + takt * 0.18;
    gruppen.push({
      name: `zeile-${i}`,
      pfade: [
        strecke(0, oben, breite, oben),                                    // Versalhöhe
        strecke(0, oben + (versalhoehe - xHoehe) * 0.6, breite, oben + (versalhoehe - xHoehe) * 0.6),
        strecke(0, oben + versalhoehe * 0.72, breite, oben + versalhoehe * 0.72), // Grundlinie
      ],
      strich: true,
      breite: 1.2,
      deckung: 0.4,
    });
  }

  // Die senkrechten Achsen sitzen dort, wo im Logo die drei Buchstaben stehen.
  const stiele = L.wortmarke.map(anker).map(([x]) => (x - wx) * masstab);
  gruppen.push({
    name: 'stiele',
    pfade: stiele.map((x) => strecke(x, 0, x, hoehe)),
    strich: true,
    breite: 1.2,
    deckung: 0.22,
  });

  return { box: `0 0 ${breite} ${hoehe}`, gruppen };
}

/* --------------------------------------------------------------------------
   Kanten — der Doppelbalken flach gelegt
   Dasselbe Paar, um neunzig Grad gedreht und in wechselnder Länge gestapelt.
   Neben einer Liste von Verweisen liest sich das wie ihre Maße.
   -------------------------------------------------------------------------- */
const kantenLaengen = [1, 0.62, 0.84, 0.41, 0.73, 0.95, 0.55, 0.68, 0.36];

export function kanten(): Zeichnung {
  const strich = 4;
  const steg = (29 / 9) * strich;
  const paar = strich * 2 + steg;
  const abstand = paar * 2.4;

  const breite = 900;
  const hoehe = abstand * kantenLaengen.length;

  return {
    box: `0 0 ${breite} ${hoehe}`,
    gruppen: kantenLaengen.map((anteil, i) => {
      const y = i * abstand;
      const l = breite * anteil;
      return {
        name: `kante-${i}`,
        pfade: [rechteck(0, y, l, strich), rechteck(0, y + strich + steg, l, strich)],
      };
    }),
  };
}
