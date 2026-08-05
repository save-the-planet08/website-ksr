/**
 * Wo wir sind — kein festes Büro.
 *
 * Der einzige Abschnitt der Seite ohne eigenes Zeichen. Er braucht keins: die
 * beiden Spalten schieben sich gegeneinander, während man vorbeiscrollt. Nichts
 * steht fest — genau das sagt der Text.
 */
import { szeneAnmelden, strecke } from '../szene';

szeneAnmelden('kontakt-parallaxe', (wurzel) => {
  const spalten = Array.from(wurzel.querySelectorAll<HTMLElement>('.wo > *'));
  if (spalten.length < 2) return;

  const zeit = strecke(wurzel);
  zeit.fromTo(spalten[0], { y: 44 }, { y: -44, ease: 'none' }, 0);
  zeit.fromTo(spalten[1], { y: -30 }, { y: 30, ease: 'none' }, 0);
});
