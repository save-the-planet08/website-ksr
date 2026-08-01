# KSR-Website — Projekt-Guide

Website des Kreisschülerrats Rheingau-Taunus-Kreis. Diese Datei ist der
Einstiegspunkt: wer hier arbeitet, hält sich daran.

## Die Idee in einem Satz

Das Logo zerfällt beim Scrollen in seine Bauteile — jedes Bauteil trägt eine
Sektion — im Fuß setzt es sich wieder zusammen. Alles Sichtbare kommt aus
diesem einen Zeichen. **Es gibt keine Fotos auf dieser Seite.** Das ist eine
Entscheidung, kein Zwischenstand.

Die vier Bauteile und wofür sie stehen:

| Bauteil | Steht für | Trägt |
|---|---|---|
| Löwe (Hessen) | Haltung, Stimme | Startseite „Haltung", `/der-rat` |
| Doppelbalken | Gliederung, Raster | Die acht Wünsche, Listen, Aufzählungen |
| Rebe + Trauben | Herkunft, der Kreis | Startseite „Der Kreis", `/termine` |
| Wortmarke | die Marke selbst | Kopf, Fuß |

## Stack

- **Astro**, statische Ausgabe. Kein React, keine UI-Bibliothek.
- **GSAP + ScrollTrigger** für die Startseite (nur dort geladen).
- **Lenis** für weiches Scrollen, einmalig in `src/lib/scroll.ts`.
- **Archivo Variable** als einzige Schrift, selbst gehostet über
  `@fontsource-variable/archivo`. Hierarchie über `wght` und `wdth`, nie über
  eine zweite Familie.

## Struktur

```
src/lib/logo.ts        Pfaddaten des Logos, nach Bauteilen getrennt (generiert)
src/lib/scroll.ts      Der eine Scroll-Motor
src/components/brand/  Logo.astro — rendert beliebige Bauteile in beliebiger Box
src/data/wuensche.ts   Die acht Wünsche, einzige Quelle
src/content/termine/   Eine Datei pro Termin
src/styles/            tokens.css (Variablen) + global.css (Basis)
brand/                 Quellmaterial des Logos, nicht ausgeliefert
```

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

## Harte Vorgaben

- **Barrierefreiheit:** WCAG AA. Tastaturbedienung, sichtbarer Fokus,
  `prefers-reduced-motion` schaltet auf statische Endzustände.
- **Performance:** muss auf Schul-WLAN laufen. GSAP nur auf der Startseite.
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
