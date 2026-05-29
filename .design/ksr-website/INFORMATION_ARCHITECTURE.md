# Information Architecture: KSR Website

## Site Map

```
/                    → Home
/ueber-uns           → Über uns — Wer wir sind, was wir tun
/wunsch-e            → Wünsche — 8 Gallery Cards mit Bildern
/termine             → Termine — Events und Treffen
/kontakt             → Kontakt — Kontaktinfos, Adresse, Social
/links               → Links — Externe Ressourcen
/impressum           → Impressum — Legal, Datenschutz
```

## Navigation Model

### Primary Navigation (Desktop)
Horizontal top bar, sticky. Logo left, nav links right.

- Start (Home)
- Über uns
- Wünsche
- Termine
- Kontakt
- Links
- Impressum

### Mobile Navigation
Hamburger icon (top-right). Opens full-height drawer from left:
- Logo at top
- All nav links stacked
- Social links at bottom
- Close button / tap-outside to dismiss

### Utility Navigation
Dark mode toggle icon (moon/sun) in header, right side.

## Content Hierarchy

### Home (`/`)
1. **Hero** — KSR headline, tagline, visual accent block
2. **Mission** — 3 points: Was der KSR macht (kurz, punchy)
3. **Zitate** — 3 rotating or displayed quotes
4. **Quick links** — Navigate to main sections
5. **Footer** — Links, social, legal

### Über uns (`/ueber-uns`)
1. **Hero/Intro** — "Wir sind der Kreisschülerrat"
2. **Was wir tun** — 3-4 bullet points
3. **Kontaktpersonen** — Namen, Rolle, ggf. Bild
4. **Footer**

### Wünsche (`/wuensche`)
1. **Page title** — "Unsere Wünsche"
2. **8 Wish Cards** — Grid layout, icon + title + short description
3. **Footer**

### Termine (`/termine`)
1. **Page title** — "Termine"
2. **Event list** — Date, title, location, description
3. **Footer**

### Kontakt (`/kontakt`)
1. **Page title** — "Kontakt"
2. **Contact info block** — Email, Telefon, Adresse
3. **Social links** — Facebook, Instagram
4. **Footer**

### Links (`/links`)
1. **Page title** — "Links"
2. **External link cards** — LEB Hessen, ELAN, Hessisches Schulgesetz

### Impressum (`/impressum`)
1. **Legal text** — Name, Adresse, Kontakt, Verantwortliche
2. **Datenschutzerklärung** — Standard text
3. **Footer**

## User Flows

### Flow 1: Neue Schülervertreter findet die Seite
1. Landet auf Home (`/`)
2. Liest Hero + Mission in 30 Sekunden
3. Navigiert zu `/ueber-uns` → versteht wer wir sind
4. Geht zu `/kontakt` → findet Kontaktmöglichkeit
5. Kontaktiert uns

### Flow 2: Schülervertreter sucht Info zu Treffen
1. Kommt direkt über Suchmaschine oder `/termine`
2. Sieht Datum + Thema des nächsten Treffens
3. Findet Kontaktdaten falls Fragen

### Flow 3: Schnellnavigation
1. Jede Seite über Navigation erreichbar
2. Jede Seite maximal 2 Klicks vom Home entfernt

## Naming Conventions

| Concept | Label in UI | Notes |
|---------|-------------|-------|
| Organization | Kreisschülerrat (KSR) | Immer mit KSR-Kürzel |
| Home page | Start | Navigation label |
| Student representatives | Schülervertreter | Plural, klar |
| Meetup/Events | Termine | Nomen, nicht "Events" |
| Contact | Kontakt | |
| Legal | Impressum | Deutsch, Standard |

## Component Reuse Map

| Component | Used on | Variations |
|-----------|---------|------------|
| Header/Nav | All pages | Desktop vs. mobile state |
| Footer | All pages | Same on all pages |
| Hero section | Home, Über uns |
| Wish card | Wünsche |
| Event item | Termine |
| Contact block | Kontakt |
| Link card | Links |
| Quote block | Home |

## Content Growth Plan

- **Termine**: Neue Events werden als Liste angehängt, chronologisch sortiert
- **Wünsche**: Fix für immer 8 — keine Erweiterung geplant
- **Links**: Neue Links können hinzugefügt werden, Cards scrollen oder wickeln sich

## URL Strategy

- Static paths, no query params needed
- Lowercase, hyphen-separated, German
- `/impressum`, `/kontakt`, `/termine`, `/ueber-uns`, `/wuensche`, `/links`
- No sub-sections

## Dark Mode

- Toggle in header switches `data-theme="dark"` on `<html>`
- All colors via CSS custom properties — switching changes variable values
- System preference via `prefers-color-scheme` media query as default
- Toggle state persisted in `localStorage`
