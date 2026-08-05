/**
 * Acht Wappen für die acht Wünsche.
 *
 * Kein Muster, sondern acht Bilder, die je einen Satz zeigen. Sie sind aus
 * demselben Baukasten gebaut — Ring, Bogen, Kerbe, Knoten, Achse — und deshalb
 * unverkennbar Geschwister. Keins gleicht dem anderen, weil keins dasselbe
 * meint.
 *
 * Die Kompositionen sind gesetzt, nicht erzeugt. Wunsch 04 sieht immer aus wie
 * eine Schale mit etwas darin.
 */
import {
  achse, bogen, geplottet, kerben, knoten, leitung, pfeilspitze, ring,
} from './baukasten';
import type { Gruppe, Zeichnung } from './typen';

const FELD = 200;
const M = FELD / 2;
const TAU = Math.PI * 2;

/** Die Unregelmäßigkeit maßstäblich zum Feld: knapp ein halbes Prozent. */
const WACKELN = 0.9;

function bauen(gruppen: Gruppe[]): Zeichnung {
  return {
    box: `0 0 ${FELD} ${FELD}`,
    gruppen: gruppen.map((g) => ({
      ...g,
      pfade: (g.pfade ?? []).map((d) => geplottet(d, WACKELN)),
    })),
  };
}

/* --------------------------------------------------------------------------
   01 — Zeit. Ein Tag als Zifferblatt, und der Teil davon, der Bildung ist.
   -------------------------------------------------------------------------- */
function zeit(): Gruppe[] {
  const oben = -TAU / 4;
  return [
    { name: 'teil-0', pfade: [ring(M, M, 80)], strich: true, breite: 1.4 },
    { name: 'teil-1', pfade: kerben(M, M, 68, 80, 24), strich: true, breite: 1.2, deckung: 0.55 },
    { name: 'teil-2', pfade: kerben(M, M, 62, 80, 8), strich: true, breite: 1.6 },
    // Der eingefärbte Bogen ist die Zeit, die etwas wert ist.
    { name: 'teil-3', pfade: [bogen(M, M, 48, oben, oben + TAU * 0.42)], strich: true, breite: 5, akzent: true },
    { name: 'teil-4', pfade: [knoten(M, M, 4)] },
  ];
}

/* --------------------------------------------------------------------------
   02 — Partner. Zwei Kreise, und was sie gemeinsam haben.
   -------------------------------------------------------------------------- */
function partner(): Gruppe[] {
  const rad = 54;
  const versatz = 29;
  const links = M - versatz;
  const rechts = M + versatz;
  // Schnittpunkte der beiden Kreise
  const halb = Math.sqrt(rad * rad - versatz * versatz);
  const w = Math.atan2(halb, versatz);

  return [
    { name: 'teil-0', pfade: [ring(links, M, rad)], strich: true, breite: 1.4 },
    { name: 'teil-1', pfade: [ring(rechts, M, rad)], strich: true, breite: 1.4 },
    // Die Linse: der Bereich, den beide teilen.
    {
      name: 'teil-2',
      pfade: [bogen(links, M, rad, -w, w), bogen(rechts, M, rad, Math.PI - w, Math.PI + w)],
      strich: true,
      breite: 4,
      akzent: true,
    },
    { name: 'teil-3', pfade: [knoten(M, M - halb, 4), knoten(M, M + halb, 4)] },
  ];
}

/* --------------------------------------------------------------------------
   03 — Zusammen. Vieles, das auf einen Punkt zuläuft.
   -------------------------------------------------------------------------- */
function zusammen(): Gruppe[] {
  const speichen: string[] = [];
  const enden: string[] = [];
  const anzahl = 11;
  for (let i = 0; i < anzahl; i++) {
    const wi = (TAU * i) / anzahl - TAU / 4;
    // Abwechselnd lang und kurz: nicht alles kommt gleich weit.
    const aussen = i % 2 ? 78 : 62;
    speichen.push(achse(M + Math.cos(wi) * 14, M + Math.sin(wi) * 14, M + Math.cos(wi) * aussen, M + Math.sin(wi) * aussen));
    enden.push(knoten(M + Math.cos(wi) * aussen, M + Math.sin(wi) * aussen, 3.4));
  }
  return [
    { name: 'teil-0', pfade: [ring(M, M, 80)], strich: true, breite: 1.2, deckung: 0.4 },
    { name: 'teil-1', pfade: speichen, strich: true, breite: 1.4 },
    { name: 'teil-2', pfade: enden, deckung: 0.7 },
    { name: 'teil-3', pfade: [knoten(M, M, 9)], akzent: true },
  ];
}

/* --------------------------------------------------------------------------
   04 — Halt. Eine Schale, und etwas, das darin liegt.
   -------------------------------------------------------------------------- */
function halt(): Gruppe[] {
  const cy = M + 8;
  const schale = 70;
  return [
    // Die Schale trägt: dick, unten, offen nach oben.
    { name: 'teil-0', pfade: [bogen(M, cy, schale, 0.08, Math.PI - 0.08)], strich: true, breite: 5 },
    // Der Rest des Kreises steht nur angedeutet da — die Schale ist die Hälfte,
    // auf die es ankommt.
    {
      name: 'teil-1',
      pfade: [bogen(M, cy, schale, Math.PI + 0.3, TAU - 0.3)],
      strich: true,
      breite: 1.2,
      deckung: 0.3,
    },
    { name: 'teil-2', pfade: [ring(M, cy + 14, 28)], strich: true, breite: 2, akzent: true },
    { name: 'teil-3', pfade: [knoten(M, cy + 14, 8)], akzent: true },
  ];
}

/* --------------------------------------------------------------------------
   05 — Neu. Ein Weg, der einmal abbiegt und dann hinausführt.
   -------------------------------------------------------------------------- */
function neu(): Gruppe[] {
  const weg: [number, number][] = [
    [30, 150], [30, 104], [96, 104], [96, 54], [158, 54],
  ];
  const brav: [number, number][] = [
    [30, 150], [170, 150],
  ];
  return [
    // Der Weg, den alle gehen — blass, gerade, endet nirgends.
    { name: 'teil-0', pfade: [leitung(brav, 12)], strich: true, breite: 1.4, deckung: 0.35 },
    { name: 'teil-1', pfade: [leitung(weg, 16)], strich: true, breite: 2.4 },
    { name: 'teil-2', pfade: [knoten(30, 150, 5), knoten(96, 104, 4)], deckung: 0.8 },
    { name: 'teil-3', pfade: [pfeilspitze(168, 54, 0, 14)], strich: true, breite: 2.4, akzent: true },
  ];
}

/* --------------------------------------------------------------------------
   06 — Maß. Eine Skala, und ein Zeiger, der auf ihr steht.
   -------------------------------------------------------------------------- */
function mass(): Gruppe[] {
  const cy = M + 42;
  const rad = 82;
  const zeiger = -Math.PI + 0.72;
  return [
    { name: 'teil-0', pfade: [bogen(M, cy, rad, -Math.PI, 0)], strich: true, breite: 1.6 },
    { name: 'teil-1', pfade: kerben(M, cy, rad - 8, rad, 21, -Math.PI, 0), strich: true, breite: 1.1, deckung: 0.45 },
    { name: 'teil-2', pfade: kerben(M, cy, rad - 17, rad, 6, -Math.PI, 0), strich: true, breite: 1.6 },
    {
      name: 'teil-3',
      pfade: [achse(M, cy, M + Math.cos(zeiger) * (rad - 22), cy + Math.sin(zeiger) * (rad - 22))],
      strich: true,
      breite: 3,
      akzent: true,
    },
    { name: 'teil-4', pfade: [knoten(M, cy, 6)], akzent: true },
  ];
}

/* --------------------------------------------------------------------------
   07 — Raum. Oben gedrängt, unten Platz. Derselbe Kreis.
   -------------------------------------------------------------------------- */
function raum(): Gruppe[] {
  const reihen = [
    { y: 46, n: 9, r: 2.6 },
    { y: 72, n: 8, r: 2.9 },
    { y: 100, n: 6, r: 3.4 },
    { y: 130, n: 4, r: 4.4 },
    { y: 160, n: 3, r: 5.6 },
  ];
  const eng: string[] = [];
  const weit: string[] = [];
  reihen.forEach((reihe, i) => {
    const spanne = 118 - i * 6;
    for (let k = 0; k < reihe.n; k++) {
      const x = M - spanne / 2 + (spanne * k) / Math.max(1, reihe.n - 1);
      (i < 3 ? eng : weit).push(knoten(x, reihe.y, reihe.r));
    }
  });
  return [
    { name: 'teil-0', pfade: [ring(M, M, 84)], strich: true, breite: 1.2, deckung: 0.35 },
    { name: 'teil-1', pfade: eng, deckung: 0.6 },
    { name: 'teil-2', pfade: weit, akzent: true },
  ];
}

/* --------------------------------------------------------------------------
   08 — Gerne. Ein Ring mit einer Lücke, und jemand, der hineingeht.
   -------------------------------------------------------------------------- */
function gerne(): Gruppe[] {
  const luecke = -TAU / 4;
  const oeffnung = 0.6;
  const rad = 78;
  const ein = luecke + oeffnung / 2;

  return [
    {
      name: 'teil-0',
      pfade: [bogen(M, M, rad, ein, luecke - oeffnung / 2 + TAU)],
      strich: true,
      breite: 4,
    },
    // Die beiden Pfosten der Lücke.
    {
      name: 'teil-1',
      pfade: [
        knoten(M + Math.cos(ein) * rad, M + Math.sin(ein) * rad, 4),
        knoten(M + Math.cos(luecke - oeffnung / 2) * rad, M + Math.sin(luecke - oeffnung / 2) * rad, 4),
      ],
    },
    // Der Weg hinein, von außen kommend.
    {
      name: 'teil-2',
      pfade: [achse(M, 6, M, M - rad + 16)],
      strich: true,
      breite: 2,
      akzent: true,
    },
    { name: 'teil-3', pfade: [pfeilspitze(M, M - rad + 18, Math.PI / 2, 12)], strich: true, breite: 2, akzent: true },
  ];
}

const bauplaene = [zeit, partner, zusammen, halt, neu, mass, raum, gerne];

/** `nr` ist die Nummer des Wunsches, 1 bis 8. */
export function wappen(nr = 1): Zeichnung {
  const bau = bauplaene[(nr - 1) % bauplaene.length];
  return bauen(bau());
}
