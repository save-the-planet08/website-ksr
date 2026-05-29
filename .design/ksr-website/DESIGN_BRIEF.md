# Design Brief: KSR Website

## Problem

Schülervertreter im Rheingau-Taunus-Kreis haben keine eigenständige, moderne Anlaufstelle im Netz. Das Original vermischt Eltern- und Schülerinteressen und wirkt veraltet. Es fehlt eine klare, ansprechende Plattform, die Schülern zeigt: Der Kreisschülerrat ist relevant, greifbar, euer Stimme.

## Solution

Eine eigenständige Website für den Kreisschülerrat (KSR) — funktional, selbstbewusst, jung. Nicht Elternportal, nicht Schulamt. Eine Stimme für Schüler, präsentiert mit dem Anspruch einer tickenden Zeitbombe: klar, schnell, mutig.

## Experience Principles

1. **Klarheit über Hierarchie** — Jede Seite hat genau ein Ziel. Navigation ist selbsterklärend. Kein Schüler soll sich fragen "bin ich hier richtig?"
2. **Vertrauen durch Sichtbarkeit** — Echte Namen, echte Kontakte, echte Gesichter. Eine Maske weniger als das Original. Die Seite soll ehrlich wirken.
3. **Dynamik ohne Ablenkung** — Bewegung signalisiert Lebendigkeit, nicht Chaos. Dezente Animation, deutliche Typografie, ein Mut zu Weißraum.

## Aesthetic Direction

- **Philosophy**: Swiss / International Typographic
- **Tone**: Selbstbewusst, funktional, jugendlich — aber nicht kitschig. Eine Behörde mit Haltung.
- **Reference points**: Rebellion-Haltung einer Schülerzeitung, Klarheit eines Amtsblatts, Energie eines Vereinshefts
- **Anti-references**: Kein Elternportal-Mitmach-Joomla. Keine stockigen Behördentöne. Keine veraltete SchulHomepage-Ästhetik.
- **Accent color**: Ein leuchtendes, jugendliches Rot (#E63946) — Mut, Kraft, Schülerstimme. Nicht Corporate-Blau.

## Content

### Pages

| Page | URL | Content |
|------|-----|---------|
| Home | `/` | Hero mit KSR-Slogan, Mission in 3 Punkten, Zitate, aktuelle Quick-Links |
| Über uns | `/ueber-uns` | Wer wir sind, was wir tun, Kontaktpersonen |
| Wünsche | `/wuensche` | 8 Wünsche/Galerien — Ganztagskonzept, Schulsozialarbeit, etc. |
| Termine | `/termine` | Events und Termine |
| Kontakt | `/kontakt` | Kontaktinfos, Standort, Social Links |
| Links | `/links` | Externe Ressourcen (LEB, Hessisches Schulgesetz etc.) |
| Impressum | `/impressum` | Legal |

### Quotes (from original site, to retain)
- "Bildung ist die mächtigste Waffe, die du verwenden kannst, um die Welt zu verändern." — Nelson Mandela
- "Es gibt nur eins, was auf Dauer teurer ist als Bildung, keine Bildung." — John F. Kennedy
- "Lernen ist wie Rudern gegen den Strom. Sobald man aufhört, treibt man zurück." — Chinesisches Sprichwort

### Gallery Wishes
1. sinnvolles Ganztagskonzept
2. Zusammenarbeit Schule und Eltern
3. Zusammenspiel
4. Schulsozialarbeit fördern
5. Neue Wege
6. Angepasste Vorgaben
7. kleine Klassen
8. unser Wunsch

### Contact
- Email: keb@keb-ksr-rtk.de (reused, it's the same inbox)
- Phone: +49 170 9485853
- Address: 65527 Niedernhausen
- Social: Facebook, Instagram

### External Links
- LEB Hessen: https://leb-hessen.de
- ELAN: https://leb-hessen.de/elan/
- Hessisches Schulgesetz

## Typography
- Display/Headings: **Barlow Condensed** (Bold, 700) — condensed, functional, Swiss lineage, youth energy
- Body: **Barlow** (Regular, Medium) — same family, cohesive, readable
- Fallback: system-ui, sans-serif
- No decorative serifs. No mixing families.

## Color Palette
- Primary accent: `#E63946` (youthful red)
- Background: `#FAFAFA` (light), `#121212` (dark)
- Text: `#1A1A1A` (light mode), `#F5F5F5` (dark mode)
- Secondary: `#2B2B2B` (dark surfaces in light mode)
- Border: `#E0E0E0` (light), `#2A2A2A` (dark)

## Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| Navigation (header) | New | Sticky, hamburger mobile, full nav desktop |
| Hero section | New | Full-viewport, KSR branding, accent color block |
| Quote block | New | Clean, text-forward, alternating attribution |
| Wish cards | New | Grid, icon + text, hover effect |
| Contact card | New | Info block with icon links |
| Page footer | New | Links, social, legal note |
| Mobile drawer | New | Hamburger → full-screen slide |

## Key Interactions

- **Navigation hover**: underline grows from left, 200ms
- **Wish cards**: subtle shadow lift on hover, 150ms
- **Mobile nav open**: drawer slides in from left, 250ms ease-out
- **Page load**: hero content fades in, staggered 100ms between elements
- **Links**: color shift on hover, 150ms
- **Dark mode toggle**: smooth 200ms transition on all colors

## Responsive Behavior

- **Mobile first** (375px base)
- **Tablet** (768px): 2-column grids become available
- **Desktop** (1024px+): Full navigation, 3-4 column grids where appropriate
- Touch targets: minimum 44x44px
- Body text: minimum 16px (no iOS zoom)

## Accessibility Requirements

- Color contrast: WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- Focus states: visible ring on all interactive elements
- Keyboard navigable: full nav, all links, buttons
- Screen reader: semantic HTML, proper heading hierarchy (h1 → h2 → h3)
- `prefers-reduced-motion`: disable all animations if set

## Out of Scope

- Elternebene / KEB — nur Schülerrat
- Download-Funktionalität (keine Content-Zugriffs-Konzepte缺失)
- Echte Veranstaltungsdaten — vorerst Placeholder da scraped Content unvollständig
- Newsletter / Anmeldung
- Mehrsprachigkeit

## Tech Stack

Single-page static HTML — kein Framework nötig für diesen Umfang. Vanilla HTML/CSS/JS. CSS Custom Properties für Design Tokens. Kein Build-Schritt.
