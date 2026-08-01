---
name: web-animation
description: >
  Premium-Web-Animationsprinzipien für die KSR-Astro-Seite. Nutze diesen Skill
  immer, wenn Bewegung, Übergänge, Scroll-Effekte, Hover-/Mikrointeraktionen oder
  Entrance-Animationen gebaut oder verbessert werden. Motion (motion/react) in
  Inseln + GSAP. Triggert bei: "Animation", "Übergang", "scroll", "reveal",
  "hover", "soll teurer/wertiger wirken", "lebendiger".
---

# Web-Animation (Astro + React-Inseln)

Ziel: „teuer und aufwendig" durch Zurückhaltung und perfektes Timing — nicht
durch viele Effekte. Mehr Animation = meist billiger. Wenige Signaturbewegungen,
sauber getimt, schlagen ein Effektgewitter.

## Engine (Astro + React-Inseln)
- Motion (`motion/react`) IN React-Inseln: whileInView-Reveals, Stagger,
  Spring, AnimatePresence-Exits, automatische Layout-Animationen.
- GSAP für schwere cinematische Effekte (ScrollTrigger-Pinning, SplitText).
- Lenis für Smooth-Scroll (größter Einzelhebel für „premium feel").
- Reine CSS-Transitions für simple Hover-/State-Wechsel ohne Insel.

## Prinzipien (nach Emil Kowalski, „Animations on the Web")
- Easing: Eintritte mit ease-out (schnell rein, sanft aus). Nie lineares Easing
  für UI. Eigene cubic-bezier statt Default-Werten.
- Timing: Mikrointeraktionen 150–250ms, größere Übergänge 300–500ms,
  Hero-/Scroll-Reveals länger, aber nie zäh. Spürbar, nicht wartend.
- Stagger: Listen/Karten zeitversetzt einblenden (0.05–0.1s Versatz) — liest
  sich sofort „durchdesignt".
- Nur GPU-Properties animieren: transform und opacity. Nie width/height/top.
- Restraint: pro Sektion höchstens EINE Signaturbewegung.

## Pflicht: Accessibility
Jede Animation hinter `prefers-reduced-motion` absichern. In CSS eine
Reduce-Regel setzen, in GSAP `gsap.matchMedia()` mit reduzierter Variante nutzen
(z. B. Inhalte sofort sichtbar, ohne Bewegung).

## GSAP-Rezepte (Vanilla)
- Scroll-Reveal: ScrollTrigger, Elemente bei Eintritt y:30→0 + opacity:0→1,
  ease "power2.out", mit Stagger.
- Kinetische Headline: SplitText in Zeichen/Wörter, gestaffelt einblenden.
- Storytelling: ScrollTrigger-Pin für eine Hero- oder Zahlen-Sektion.
- Hover: kleine scale/translate-Reaktion (≤1.03), schnelles ease-out.

## Verbote
- Kein schweres WebGL/Three.js (Performance + Wartbarkeit auf Schul-Geräten).
- Keine Auto-Play-Bewegung, die das Lesen stört; keine Parallax-Übertreibung.
- React-Inseln nur dort, wo Interaktion/Animation es braucht — nie für rein
  statische Inhalte (sonst leiden Performance und Barrierefreiheit).
