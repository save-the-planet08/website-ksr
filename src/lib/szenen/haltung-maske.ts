/**
 * Haltung — der Löwe als Fenster.
 *
 * Die Silhouette schneidet, dahinter wandern Streifen durch. Jeder Streifen
 * läuft ein wenig anders schnell, deshalb schert das Band beim Scrollen — das
 * Tier steht still und ist trotzdem in Bewegung.
 */
import { gsap } from 'gsap';
import { szeneAnmelden, strecke, teil } from '../szene';

szeneAnmelden('haltung-maske', (wurzel) => {
  const feld = wurzel.querySelector<HTMLElement>('[data-tier]');
  const streifen = teil(wurzel, 'streifen');
  if (!feld || !streifen.length) return;

  const zeit = strecke(wurzel);

  zeit.fromTo(streifen,
    { x: -90 },
    {
      x: 90,
      ease: 'none',
      // `from: 'edges'` staffelt von außen nach innen: das Band knickt in der
      // Mitte, statt gleichmäßig zu rutschen.
      stagger: { each: 0.012, from: 'edges' },
    }, 0);

  // Der Löwe selbst hält gegen: er wandert langsamer als die Seite.
  zeit.fromTo(feld, { yPercent: -9 }, { yPercent: 9, ease: 'none' }, 0);
});
