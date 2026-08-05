/**
 * Wie ein Zeichen beschrieben wird.
 *
 * Alles ist ein Pfad — auch Linien und Punkte. Das hält den Renderer bei einem
 * einzigen Fall und die Szenen bei einem einzigen Selektor. Jede Gruppe trägt
 * einen Namen, damit eine Szene sie greifen kann (`[data-teil="schicht-3"]`).
 */

export interface Gruppe {
  /** Landet als `data-teil` im Markup. Der Griff für die Szenen. */
  name: string;
  pfade?: string[];
  /**
   * Statt eigener Pfade: eine Vorlage aus `vorlagen` benutzen. Neun Kopien des
   * Löwen sind fünfzig Kilobyte, neun Verweise darauf sind keine zwei.
   */
  nutzt?: string;
  /** Kontur statt Fläche. */
  strich?: boolean;
  /** Strichstärke, nur bei `strich`. */
  breite?: number;
  /** Grunddeckkraft, falls die Gruppe leiser sein soll als der Rest. */
  deckung?: number;
  /** Eigene Transformation, etwa für geschichtete Kopien. */
  transform?: string;
}

export interface Zeichnung {
  box: string;
  gruppen: Gruppe[];
  /** Name der Gruppe, die als Schnittmaske über allen übrigen liegt. */
  maske?: string;
  /** Geometrie, die mehrfach vorkommt. Steht einmal in `<defs>`. */
  vorlagen?: { id: string; pfade: string[] }[];
}

/* --------------------------------------------------------------------------
   Werkzeug
   -------------------------------------------------------------------------- */

export function strecke(x1: number, y1: number, x2: number, y2: number) {
  return `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`;
}

export function rechteck(x: number, y: number, b: number, h: number) {
  return `M${r(x)} ${r(y)}h${r(b)}v${r(h)}h${r(-b)}z`;
}

export function kreis(cx: number, cy: number, rad: number) {
  return `M${r(cx - rad)} ${r(cy)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0z`;
}

/**
 * Der erste Punkt eines Pfades. Reicht, um die Traubenbeeren als Knoten zu
 * benutzen, ohne die ganze Geometrie auswerten zu müssen.
 */
export function anker(d: string): [number, number] {
  const treffer = /^M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(d);
  return treffer ? [parseFloat(treffer[1]), parseFloat(treffer[2])] : [0, 0];
}

/**
 * Eine liegende Welle als Kette kubischer Segmente — ein Segment je halber
 * Wellenlänge, Griffe waagerecht. Genau genug fürs Auge, sparsam im Markup.
 */
export function wellenPfad(
  x0: number, x1: number, mitte: number,
  hoehe: number, laenge: number, phase = 0,
) {
  const halb = laenge / 2;
  const griff = laenge * 0.18;
  let x = x0 - ((phase % 1) + 1) % 1 * laenge;
  let hoch = true;
  let d = `M${r(x)} ${r(mitte + (hoch ? -hoehe : hoehe))}`;
  while (x < x1) {
    const y1 = mitte + (hoch ? -hoehe : hoehe);
    const y2 = mitte + (hoch ? hoehe : -hoehe);
    d += `C${r(x + griff)} ${r(y1)} ${r(x + halb - griff)} ${r(y2)} ${r(x + halb)} ${r(y2)}`;
    x += halb;
    hoch = !hoch;
  }
  return d;
}

/**
 * Eine geschlossene, weiche Kurve durch Punkte, die im Kreis um einen Mittel-
 * punkt liegen. `profil` gibt je Winkel den Radius als Vielfaches an — damit
 * wird aus dem Kreis eine Kuppe mit eigener Form.
 */
export function konturPfad(
  cx: number, cy: number, rx: number, ry: number, profil: number[],
) {
  const n = profil.length;
  const p = profil.map((f, i) => {
    const w = (i / n) * Math.PI * 2;
    return [cx + Math.cos(w) * rx * f, cy + Math.sin(w) * ry * f];
  });

  // Catmull-Rom in Bézier: die Griffe liegen auf einem Sechstel der Strecke
  // zwischen Vorgänger und Nachfolger. Ergibt eine Kurve ohne Ecken.
  const hol = (i: number) => p[((i % n) + n) % n];
  let d = `M${r(p[0][0])} ${r(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = hol(i - 1);
    const [x1, y1] = hol(i);
    const [x2, y2] = hol(i + 1);
    const [x3, y3] = hol(i + 2);
    d += `C${r(x1 + (x2 - x0) / 6)} ${r(y1 + (y2 - y0) / 6)} `
       + `${r(x2 - (x3 - x1) / 6)} ${r(y2 - (y3 - y1) / 6)} ${r(x2)} ${r(y2)}`;
  }
  return `${d}z`;
}

/** Skalieren um einen festen Punkt — für die Höhenschichten. */
export function skaliertUm(cx: number, cy: number, faktor: number) {
  return `translate(${r(cx)} ${r(cy)}) scale(${r(faktor)}) translate(${r(-cx)} ${r(-cy)})`;
}

/** Zwei Nachkommastellen reichen; alles darüber ist nur Gewicht im HTML. */
function r(n: number) {
  return Math.round(n * 100) / 100;
}
