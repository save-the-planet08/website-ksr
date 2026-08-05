/**
 * Kontakt — das Blatt liniert sich.
 *
 * Versalhöhe, x-Höhe, Grundlinie: die Linien, auf denen die Wortmarke sitzt,
 * ziehen sich von links durchs Bild. Hinter einer Seite, die zum Schreiben
 * auffordert, liegt ein Schreibheft.
 */
import { szeneAnmelden, strecke, teil, zugVorbereiten } from '../szene';

szeneAnmelden('kontakt-achsen', (wurzel) => {
  const zeilen = Array.from(wurzel.querySelectorAll<SVGPathElement>('[data-teil^="zeile-"] path'));
  const stiele = teil(wurzel, 'stiele');
  if (!zeilen.length) return;

  zugVorbereiten(zeilen);
  zugVorbereiten(stiele);

  strecke(wurzel, 'top 78%', 'bottom 55%')
    .to(zeilen, { strokeDashoffset: 0, ease: 'none', stagger: 0.045 }, 0)
    .to(stiele, { strokeDashoffset: 0, ease: 'none', stagger: 0.08 }, 0.4);
});
