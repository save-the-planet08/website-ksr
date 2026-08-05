# KSR-Website — Projekt-Guide

Website des Kreisschülerrats Rheingau-Taunus-Kreis. Diese Datei ist der
Einstiegspunkt: wer hier arbeitet, hält sich daran.

## Die Idee in einem Satz

Das Logo zerfällt beim Scrollen in seine Bauteile — jedes Bauteil trägt eine
Sektion — im Fuß setzt es sich wieder zusammen. **Das Logo ist der Kern der
Seite, nicht ihre Grenze.** Was darüber hinausgeht, ist trotzdem gezeichnet:
**es gibt keine Fotos auf dieser Seite.** Das ist eine Entscheidung, kein
Zwischenstand.

Dazu die zweite Regel: **kein Abschnitt bewegt sich wie ein anderer, und kein
Zeichen kommt zweimal vor.** Die Seite ist bei jedem Öffnen dieselbe — das ist
keine Zufallsmaschine, sondern eine gebaute Choreografie. Wer sie ändert, ändert
sie in `src/lib/register.ts`; dort steht, wer was bekommt, und dort bricht der
Build, wenn etwas doppelt vergeben wird.

Die vier Bauteile und wofür sie stehen:

| Bauteil | Steht für | Trägt |
|---|---|---|
| Löwe (Hessen) | Haltung, Stimme | Startseite „Haltung", Seitenköpfe |
| Doppelbalken | Gliederung, Raster | Die acht Wünsche, Listen, Aufzählungen |
| Rebe + Trauben | Herkunft, der Kreis | Startseite „Der Kreis", `/termine` |
| Wortmarke | die Marke selbst | Kopf, Fuß, `/der-rat` |

## Die Bildwelt

Dreizehn **Zeichen** in `src/lib/zeichen/`, in drei Schichten:

**Aus dem Zeichen** (5) — die Logo-Pfade selbst, anders verarbeitet: der Löwe
als Schnittmaske, der Doppelbalken als Partitur, die Rebe im Wachstum, die
Trauben als Netz, die Wortmarke als Kontur.

**Abgeleitet** (4) — neue Formen nach den Maßen des Logos: die Proportionen des
Löwen werden zu Höhenlinien, die Kurve der Ranke zu einem Wellenfeld, die
Streuung der Trauben zu einer Konstellation, die Achsen der Wortmarke zu einem
Linienmaß.

**Gebaut** (4) — aus einem eigenen Baukasten (`zeichen/baukasten.ts`: Ring,
Bogen, Kerbe, Knoten, Achse, geführte Leitung, Pfeilspitze), und sie zeigen
etwas, statt zu schmücken:

| Zeichen | Wo | Was es zeigt |
|---|---|---|
| `wappen` | `/wuensche` | Acht Embleme, eines je Wunsch — acht Kompositionen aus demselben Baukasten |
| `jahresband` | `/termine` | Das Schuljahr mit den **echten** Terminen aus `src/content/termine/` |
| `leitungsplan` | `/kontakt` | Drei Leitungen zu den drei Wegen, mit Signal darauf |
| `aussenkanten` | `/links` | Eine Kante je Quelle, nach draußen zeigend |

**Die Regel für neue Zeichen:** gebaut statt gemalt, ein Strich (1,4 px,
`non-scaling-stroke`), genau ein `--rebe`-Akzent je Bild, nichts Gewürfeltes.
Alles folgt aus Daten oder aus einer festen Tabelle — zweimal Bauen ergibt
zweimal dasselbe.

**Der Strich:** `geplottet()` legt eine feste, winzige Unregelmäßigkeit auf
jeden Stützpunkt. Erzeugte Geometrie ist zu genau; ein perfekter Kreis sieht
nach Maschine aus. Angewandt auf alle abgeleiteten und gebauten Zeichen — nie
auf die fünf aus dem Logo. An der Marke wird nicht gewackelt.

**Am wichtigsten:** ein Zeichen, das nichts zeigt, ist Tapete. Das Jahresband
ändert sich, wenn ein Termin dazukommt; die Außenkanten zählen die Quellen.
Wer ein neues Zeichen baut, ohne dass es an etwas hängt, baut ein Muster —
und Muster sind hier schon zweimal wieder rausgeflogen (`taktraster`,
`kanten`).

## Stack

- **Astro**, statische Ausgabe. Kein React, keine UI-Bibliothek.
- **GSAP + ScrollTrigger** auf jeder Seite — `BaseLayout` lädt `auftritt.ts`,
  und das braucht beides. Die alte Regel „nur auf der Startseite" stimmte schon
  vor dieser Arbeit nicht mehr.
- **Lenis** für weiches Scrollen, einmalig in `src/lib/scroll.ts`.
- **Archivo Variable** als einzige Schrift, selbst gehostet über
  `@fontsource-variable/archivo`. Hierarchie über `wght` und `wdth`, nie über
  eine zweite Familie.

## Struktur

```
src/lib/logo.ts        Pfaddaten des Logos, nach Bauteilen getrennt (generiert)
src/lib/arten.ts       Das Vokabular: welche Auftritte, Zeichen, Szenen es gibt
src/lib/register.ts    Wer bekommt was — plus der Wächter gegen Doppelvergabe
src/lib/auftritt.ts    Sechzehn Arten, wie ein Element ins Bild kommt
src/lib/szene.ts       Registry für alles, was am Scrollrad hängt
src/lib/szenen/        Eine Datei je Szene, eine Szene je Abschnitt
src/lib/zeichen/       Dreizehn Generatoren, laufen beim Bauen (kein Laufzeit-JS)
  ausDemZeichen.ts       die fünf aus den Logo-Pfaden
  abgeleitet.ts          die vier nach den Maßen des Logos
  baukasten.ts           Grundformen der zweiten Bildwelt + geplottet()
  wappen.ts, jahresband.ts, leitungsplan.ts, aussenkanten.ts
src/lib/scroll.ts      Der eine Scroll-Motor
src/components/brand/  Logo.astro (Bauteile) + Zeichen.astro (alle Zeichen)
src/data/wuensche.ts   Die acht Wünsche, einzige Quelle
src/content/termine/   Eine Datei pro Termin
src/styles/            tokens.css (Variablen) + global.css (Basis)
brand/                 Quellmaterial des Logos, nicht ausgeliefert
```

Ein Abschnitt sieht damit so aus: er holt sich seine Vergabe im Frontmatter
(`const x = ort('rat/ebenen')`), trägt `data-szene={x.szene}`, rendert
`<Zeichen art={x.zeichen} />` und gibt seiner Überschrift `data-auftritt=
{x.auftritt}`. Alles Weitere steht am Element selbst.

## Regeln, die man leicht bricht

- **Größe und Farbe des Logos gehören an den Wrapper, nie an die SVG.**
  Astro-Scoping erreicht die SVG nicht — sie trägt den Scope der
  Logo-Komponente. Immer ein eigenes Element drumherum stylen.
- **Kein `will-change: transform` auf dem Bühnen-Logo.** Der Zoom vergrößert
  die Ebene um ein Vielfaches; eine erzwungene Rasterebene sprengt das
  Speicherlimit und die Bühne wird leer gezeichnet.
- **Startzustände von Animationen hängen an `html.js`.** Fällt das Skript aus,
  muss der Inhalt sichtbar sein. Eine unsichtbare Seite ist schlimmer als eine
  unbewegte.
- **Scrub-Zeitstrahlen enden dort, wo das Kleben endet** — Bühnenhöhe minus
  ein Viewport. Was danach käme, sieht niemand.
- **`.huelle` nie zusätzlich in der Breite begrenzen.** Sie zentriert sich
  selbst; eine engere `max-width` darauf zentriert den Text statt ihn links
  auszurichten. Stattdessen ein Kind-Element begrenzen.

- **Kein Ornament hinter kleinem `--ink-60`-Text.** Diese Farbe steht auf
  Papier bei 4,7:1 und hat damit fast keinen Spielraum: schon ein Zeichen mit
  fünf Prozent Deckkraft dahinter drückt sie unter AA. `--ink-80` verträgt bis
  etwa 0,28. Ornamente gehören also neben den Text, nicht darunter — siehe
  `padding-inline: 50% var(--rand)` an der Partitur auf der Startseite.

- **`clip-path: inset()` immer mit Einheit an allen vier Werten.** GSAP findet
  keinen Weg von `100%` nach `0` und lässt das Element verdeckt stehen — der
  Inhalt ist dann schlicht weg. `inset(0% 100% 0% 0%)`, nicht `inset(0 100% 0 0)`.

- **Zeichen, die mehrfach dieselbe Geometrie brauchen, gehören in `<defs>`.**
  Neun Kopien des Löwenpfads sind fünfzig Kilobyte, neun `<use>` darauf keine
  zwei. Siehe `vorlagen` in `lib/zeichen/typen.ts`.

## Harte Vorgaben

- **Barrierefreiheit:** WCAG AA. Tastaturbedienung, sichtbarer Fokus,
  `prefers-reduced-motion` schaltet auf statische Endzustände.
- **Performance:** muss auf Schul-WLAN laufen. Die Zeichen werden beim Bauen
  erzeugt und stehen als SVG im HTML — kein zusätzliches Skript, kein
  Nachladen, kein Springen. Kein Zeichen über 12 kB Markup; gepackt kostet
  die Bildwelt zwischen 0,4 und 8,7 kB je Seite.
- **Recht:** Impressum und Datenschutz sind Pflicht. Beide enthalten aktuell
  markierte Lücken (`.hinweis`), die vor dem Livegang gefüllt werden müssen.
- **Pflegbarkeit:** Termine und Wünsche ändert man in Textdateien, nicht im
  Code.

## Offen vor dem Livegang

Alles davon steht als `.hinweis`-Kasten auf der jeweiligen Seite:

- Eigene E-Mail-Adresse des KSR (die alte gehört dem Kreiselternbeirat und
  wurde bewusst entfernt). Platzhalter in `src/pages/kontakt.astro` und
  `src/components/Kopf.astro`.
- Impressum: ladungsfähige Anschrift und die nach § 18 Abs. 2 MStV
  verantwortliche Person.
- Datenschutz: Hosting-Anbieter und Speicherdauer der Logfiles.
- Aktuelle Termine (die vorhandenen stammen aus dem Altbestand).
- Vorstand und Mitgliedsschulen, sobald der Vorstand konstituiert ist.
- `src/pages/muster.astro` löschen. Der Musterbogen zeigt alle elf Zeichen und
  alle sechzehn Auftritte nebeneinander — nützlich beim Bauen, hat auf der
  fertigen Seite nichts verloren.
