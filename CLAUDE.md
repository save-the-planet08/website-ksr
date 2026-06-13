# KSR-Website — Projekt-Guide (CLAUDE.md)

Dies ist der EINE Einstiegspunkt. Wer an dieser Seite arbeitet, befolgt diesen
Guide — er steuert alle Skills und Standards. Wird in jeder Session geladen.

## Stack
- Vanilla HTML/CSS/JS in `public/`. Kein Build, kein Framework.
- Animationen: GSAP (+ ScrollTrigger, SplitText), Smooth-Scroll via Lenis.
  Framework-agnostisch, kostenlos. GSAP ist DIE Animations-Engine dieser Seite.
- Hosting: statisch, mit aktivierten Clean URLs.

## So wird an dieser Seite gearbeitet (Pipeline)
Bei jedem Auftrag zu Design / Bau / Rewrite / Verbesserung IMMER diese Kette
laufen lassen (nichts überspringen). `/design-flow` orchestriert Schritt 1–7:
1. grill-me  2. design-brief  3. information-architecture  4. design-tokens
5. brief-to-tasks  6. frontend-design  7. design-review

Zusätzlich bei JEDER Umsetzung anwenden:
- web-animation-Prinzipien: passendes Easing, sinnvolles Timing, nur
  GPU-Properties (transform/opacity), immer `prefers-reduced-motion` beachten.
- Motion mit GSAP umsetzen (Vanilla). Den Motion-(React-)Skill NUR nutzen,
  falls je React-Inseln eingeführt werden — sonst ignorieren.
- Ästhetik: Swiss / International Typographic, editorial. Starke Typo-Hierarchie,
  striktes Raster, viel Weißraum. Bewegung sparsam, an wenigen Signaturstellen.
  „Teuer" entsteht durch Handwerk, nicht durch Effekt-Gewitter.

## Harte Vorgaben (nicht verhandelbar)
- Barrierefreiheit: WCAG AA (quasi-öffentliche Stelle). Tastaturbedienung,
  Kontraste, Reduced-Motion.
- Performance: schnell auf Schul-WLAN und alten Handys. Kein schweres WebGL.
- Recht: Impressum + Datenschutzerklärung stets vorhanden und aktuell.
- Pflegbarkeit: Ein künftiger Vorstand muss Inhalte von Hand ändern können.

## Konventionen
- Clean URLs: jede Seite als `public/<name>/index.html` → wird als `/<name>`
  ausgeliefert (kein `.html`). Beim Hoster Clean/Pretty URLs aktivieren.
- Header/Footer/Navigation über EINEN Include, keine Duplizierung pro Datei.
- Tokens: eine Quelle (CSS Custom Properties) für Farbe/Abstand/Typo/Motion.

## Neustart / kompletter Rewrite
Die gesamte Website liegt in `public/`. Alles andere (`.claude/`,
`.agents/skills`, `.design/`, diese Datei, git) bleibt bestehen. Für einen
Rewrite: `public/` leeren, dann die Pipeline oben laufen lassen — die Standards
hier bleiben automatisch erhalten.

## Skills (Soll-Stand)
- Julian Oczkowski designer-skills (8): grill-me, design-brief,
  information-architecture, design-tokens, brief-to-tasks, frontend-design,
  design-review, design-flow.  [installiert]
- web-animation (Prinzipien, framework-agnostisch).  [projektlokal, wird angelegt]
- motion (React/Motion) — ruht, bis React eingeführt wird.  [via npx ergänzen]
