# Build Tasks: KSR Website

Generated from: `.design/ksr-website/DESIGN_BRIEF.md`
Date: 2026-05-29
Philosophy: Swiss / International Typographic

## Foundation

- [ ] **Design tokens import**: Link `DESIGN_TOKENS.css` in all HTML files. Verify CSS variables load correctly (check computed styles in browser devtools). _Uses: `DESIGN_TOKENS.css`._
- [ ] **Global styles + reset**: Base HTML/CSS reset, box-sizing, font loading, custom scrollbar, selection color, smooth scroll. _New file._
- [ ] **Header/Nav component**: Sticky header with KSR logo (left), nav links (center-right), dark mode toggle. Mobile: hamburger → slide-in drawer from left, full-height. Logo + close button at top of drawer. _New component._
- [ ] **Footer component**: Three columns — nav links, social links (Facebook/Instagram), legal note ("§ Wir sind eine Schülervertretung."). German contact address. _New component._

## Core UI

- [ ] **Home — Hero section**: Full-viewport (100vh) intro, KSR name in massive Barlow Condensed display type, tagline underneath, a single bold accent color block (red, ~40% width on desktop), scroll indicator at bottom. Fade-in stagger on load. _New component._
- [ ] **Home — Mission section**: "Was wir tun" headline, 3 cards in a row — each with bold number (01, 02, 03), short title, 2 lines of description. 3-column grid on desktop, stacks on mobile. _New component._
- [ ] **Home — Quotes section**: 3 quotes from original site (Mandela, Kennedy, Chinese proverb). Each quote in large italic Barlow Condensed, attribution below in small caps. Clean, typographic layout. No decorative borders. _New component._
- [ ] **Home — Quick links section**: 3–4 cards linking to main sub-pages. Icon + title + one-liner. Hover: accent underline grows, subtle shadow lift. _New component._
- [ ] **Über uns — Page**: Sticky top bar with page title, intro paragraph ("Wir sind der Kreisschülerrat..."), 4 bullet points of what KSR does, contact info block at bottom. _New component._
- [ ] **Wünsche — Page**: Page title "Unsere Wünsche", 2x4 grid of wish cards. Each card: image placeholder or colored block at top, bold title, 1-line description. Cards have hover effect (lift + border accent). Rounded corners, 8px. _New component._
- [ ] **Termine — Page**: Page title "Termine", placeholder events list — 3 sample events with date badge, title, description. Clean list layout, date in accent red box. _New component._
- [ ] **Kontakt — Page**: Page title "Kontakt", contact info block (email, phone, address with icons), social links (Facebook + Instagram, icon buttons). Map placeholder or text location. _New component._
- [ ] **Links — Page**: Page title "Links", external link cards for LEB Hessen, ELAN, Hessisches Schulgesetz. Each card: site name, description, external link icon. Cards have hover effect. _New component._
- [ ] **Impressum — Page**: Full legal text, standard German imprint content. Name, address, responsible person, contact email. Privacy policy section below. _New component._

## Interactions & States

- [ ] **Mobile nav drawer**: Hamburger icon → full-height slide-in from left, 250ms. Overlay behind. Close on X click or outside tap. Body scroll locked while open. _Handles: open, close, scroll lock._
- [ ] **Dark mode toggle**: Click moon/sun icon in header → toggles `data-theme="dark"` on `<html>`. State saved in `localStorage`. 200ms transition on all color variables. Falls back to `prefers-color-scheme` on first visit. _Handles: light, dark, system pref, localStorage._
- [ ] **Nav link hover**: Underline grows left-to-right via CSS transform/scaleX, 200ms. Active page link has persistent underline. _Handles: hover, active._
- [ ] **Wish card hover**: translateY(-4px) + shadow-md, 150ms ease-out. _Handles: hover._
- [ ] **Quick link card hover**: Same as wish card. _Handles: hover._
- [ ] **External link icon**: SVG arrow-up-right icon on link cards. Animates 2px on hover, 150ms. _Handles: hover._
- [ ] **Page load animation**: Hero content fades in on load with staggered delays (100ms between elements). Opt-out if `prefers-reduced-motion`. _Handles: load, reduced-motion._

## Responsive & Polish

- [ ] **Responsive: Mobile (375px)**: Single column. Nav drawer full-screen. Hero type scales down to ~3rem max. Cards stack to 1 column. Touch targets min 44x44px. Body text 16px min. _Breakpoints: 375px base._
- [ ] **Responsive: Tablet (768px)**: 2-column grids where applicable. Navigation still shows hamburger. Hero type scales to ~4rem. _Breakpoints: 768px._
- [ ] **Responsive: Desktop (1024px+)**: Full horizontal nav. 3-4 column grids. Hero type full size (~5rem display). Footer 3-column. _Breakpoints: 1024px._
- [ ] **Accessibility pass**: Check all interactive elements have `:focus-visible` rings. Semantic HTML throughout. Proper heading hierarchy. Alt text on any images. Test keyboard navigation (Tab, Enter, Escape on drawer). _Specific: contrast, keyboard nav, screen reader labels._
- [ ] **Dark mode polish pass**: Verify dark mode at 1280px. Check contrast ratios. Ensure shadows are darker/more transparent. Check for any pure-black (#000) or pure-white (#fff) values that should be variables. _Specific: 3 breakpoints, both themes._

## Review

- [ ] **Design review**: Run `/design-review` — screenshots at 375, 768, 1280 in both light and dark mode. Compare against DESIGN_BRIEF.md.
