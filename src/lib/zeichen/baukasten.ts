/**
 * Der Baukasten der zweiten Bildwelt.
 *
 * Das Logo ist der Kern der Seite, nicht ihre Grenze. Was hier entsteht, kommt
 * nicht mehr aus den fünf Bauteilen — es folgt nur ihrer Bauart: Kreis, Bogen,
 * Strecke, Kerbe, Knoten. Alles liegt auf einem Maß, nichts ist gemalt.
 *
 * Alle Formen geben absolute Pfade aus `M`, `L`, `C`, `Z` zurück. Das ist
 * Bedingung für `geplottet()` weiter unten.
 */

const TAU = Math.PI * 2;

function r(n: number) {
  return Math.round(n * 100) / 100;
}

/* --------------------------------------------------------------------------
   Der Strich
   -------------------------------------------------------------------------- */

/**
 * Eine feste, winzige Unregelmäßigkeit auf jeden Stützpunkt.
 *
 * Erzeugte Geometrie ist zu genau: perfekte Kreise und exakt gleiche Abstände
 * sehen nach Maschine aus, und die Seite soll gezeichnet aussehen. Die Folge
 * ist berechnet, nicht gewürfelt — derselbe Pfad ergibt immer denselben
 * Strich, bei jedem Build und bei jedem Aufruf.
 *
 * `staerke` zählt in Einheiten der viewBox, muss also zur Größe des Zeichens
 * passen: ein Prozent der kurzen Seite ist ein guter Anfang.
 *
 * Nur für Pfade aus `M`, `L`, `C`, `Q`, `Z` — bei `A` (Bogen) stünden Radien
 * und Schalter zwischen den Koordinaten und würden mitverwackelt.
 */
export function geplottet(d: string, staerke = 1): string {
  if (/[aA]/.test(d)) return d;
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (zahl) => String(r(parseFloat(zahl) + folge(i++) * staerke)));
}

/** Eine feste Folge in −1 … 1. Kein Zufall: gleicher Index, gleicher Wert. */
function folge(i: number) {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/* --------------------------------------------------------------------------
   Die Formen
   -------------------------------------------------------------------------- */

/**
 * Ein Kreisbogen als Kette kubischer Segmente. Winkel im Bogenmaß, 0 zeigt
 * nach rechts, positiv dreht im Uhrzeigersinn (SVG-Achsen).
 */
export function bogen(cx: number, cy: number, rad: number, von: number, bis: number) {
  const spanne = bis - von;
  const teile = Math.max(1, Math.ceil(Math.abs(spanne) / (Math.PI / 2)));
  const schritt = spanne / teile;
  // Griffhebel für die Kreisannäherung — der bekannte Faktor 4/3·tan(Δ/4).
  const k = (4 / 3) * Math.tan(schritt / 4) * rad;

  const p = (w: number) => [cx + Math.cos(w) * rad, cy + Math.sin(w) * rad];
  let [x, y] = p(von);
  let d = `M${r(x)} ${r(y)}`;

  for (let i = 0; i < teile; i++) {
    const a = von + schritt * i;
    const b = a + schritt;
    const [x1, y1] = p(a);
    const [x2, y2] = p(b);
    d += `C${r(x1 - Math.sin(a) * k)} ${r(y1 + Math.cos(a) * k)} `
       + `${r(x2 + Math.sin(b) * k)} ${r(y2 - Math.cos(b) * k)} ${r(x2)} ${r(y2)}`;
  }
  return d;
}

/** Ein voller Ring. */
export function ring(cx: number, cy: number, rad: number) {
  return `${bogen(cx, cy, rad, 0, TAU)}Z`;
}

/**
 * Radiale Kerben auf einem Kreisbogen — die Stundenstriche eines Zifferblatts,
 * die Wochen eines Jahres, die Stimmen eines Gremiums.
 */
export function kerben(
  cx: number, cy: number, innen: number, aussen: number,
  anzahl: number, von = 0, bis = TAU,
) {
  // Beim vollen Kreis fällt die letzte Kerbe auf die erste — eine weglassen.
  const voll = Math.abs(bis - von) >= TAU - 1e-6;
  const teiler = voll ? anzahl : Math.max(1, anzahl - 1);
  const striche: string[] = [];
  for (let i = 0; i < anzahl; i++) {
    const w = von + ((bis - von) * i) / teiler;
    const [cw, sw] = [Math.cos(w), Math.sin(w)];
    striche.push(
      `M${r(cx + cw * innen)} ${r(cy + sw * innen)}L${r(cx + cw * aussen)} ${r(cy + sw * aussen)}`,
    );
  }
  return striche;
}

/** Ein Knoten — kleiner Punkt, gefüllt. Lötstelle, Ort, Termin. */
export function knoten(cx: number, cy: number, rad: number) {
  return ring(cx, cy, rad);
}

/** Eine Strecke. */
export function achse(x1: number, y1: number, x2: number, y2: number) {
  return `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`;
}

/**
 * Ein geführter Weg mit gerundeten Ecken — der Schaltplan-Strich. Punkte
 * werden der Reihe nach verbunden, jede Ecke bekommt einen Viertelkreis.
 * Ist ein Schenkel kürzer als zweimal der Radius, wird die Ecke enger
 * genommen, statt über den nächsten Punkt hinauszuschießen.
 */
export function leitung(punkte: [number, number][], radius = 14) {
  if (punkte.length < 2) return '';

  let d = `M${r(punkte[0][0])} ${r(punkte[0][1])}`;

  for (let i = 1; i < punkte.length - 1; i++) {
    const [px, py] = punkte[i - 1];
    const [x, y] = punkte[i];
    const [nx, ny] = punkte[i + 1];

    const einLaenge = Math.hypot(x - px, y - py);
    const ausLaenge = Math.hypot(nx - x, ny - y);
    const rad = Math.min(radius, einLaenge / 2, ausLaenge / 2);

    const ein: [number, number] = [x - ((x - px) / einLaenge) * rad, y - ((y - py) / einLaenge) * rad];
    const aus: [number, number] = [x + ((nx - x) / ausLaenge) * rad, y + ((ny - y) / ausLaenge) * rad];

    // Der Viertelkreis über die Ecke: die Griffe liegen auf den Schenkeln,
    // 0.552 ist die übliche Annäherung.
    const g = 0.552;
    d += `L${r(ein[0])} ${r(ein[1])}`
       + `C${r(ein[0] + (x - ein[0]) * g)} ${r(ein[1] + (y - ein[1]) * g)} `
       + `${r(aus[0] + (x - aus[0]) * g)} ${r(aus[1] + (y - aus[1]) * g)} ${r(aus[0])} ${r(aus[1])}`;
  }

  const letzter = punkte[punkte.length - 1];
  return `${d}L${r(letzter[0])} ${r(letzter[1])}`;
}

/** Eine offene Pfeilspitze. `winkel` ist die Richtung, in die sie zeigt. */
export function pfeilspitze(x: number, y: number, winkel: number, groesse = 10) {
  const oeffnung = 0.42;
  const a: [number, number] = [
    x - Math.cos(winkel - oeffnung) * groesse,
    y - Math.sin(winkel - oeffnung) * groesse,
  ];
  const b: [number, number] = [
    x - Math.cos(winkel + oeffnung) * groesse,
    y - Math.sin(winkel + oeffnung) * groesse,
  ];
  return `M${r(a[0])} ${r(a[1])}L${r(x)} ${r(y)}L${r(b[0])} ${r(b[1])}`;
}
