import type { APIRoute } from 'astro';
import { prioritaeten } from '../../data/umfrage';
import { absenden, codeNormal, saeubern } from '../../lib/umfrage';

export const prerender = false;

const MELDUNG = {
  falsch: 'Der Schulcode stimmt nicht mehr. Lade die Seite neu und gib ihn nochmal ein.',
  zu: 'Die Umfrage ist gerade nicht geöffnet.',
  technik: 'Gerade klemmt etwas bei uns. Deine Antworten sind gespeichert — versuch es gleich nochmal.',
  gross: 'Das ist zu viel Text auf einmal.',
};

/**
 * Nimmt den Fragebogen an — vom Skript als `fetch` (Antwort JSON), ohne
 * Skript als normales Formular (Antwort Weiterleitung oder kurze Fehlerseite).
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const alsJson = request.headers.get('accept')?.includes('application/json') ?? false;

  const fehler = (status: number, art: keyof typeof MELDUNG) =>
    alsJson
      ? Response.json({ meldung: MELDUNG[art] }, { status, headers: { 'Cache-Control': 'no-store' } })
      : new Response(
          `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nicht angekommen</title>`
          + `<body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1.25rem;line-height:1.5">`
          + `<h1>Das hat nicht geklappt.</h1><p>${MELDUNG[art]}</p>`
          + `<p>Geh mit der Zurück-Taste deines Browsers zurück — deine Eingaben sind dort meist noch da.</p></body></html>`,
          { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
        );

  if (Number(request.headers.get('content-length') ?? 0) > 64_000) return fehler(413, 'gross');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fehler(400, 'technik');
  }

  const code = codeNormal(form.get('code'));
  const antworten = saeubern(form);

  let ergebnis: string;
  try {
    ergebnis = await absenden(String(form.get('id') ?? ''), code, antworten);
  } catch (e) {
    console.error(e);
    return fehler(502, 'technik');
  }
  if (ergebnis === 'falsch') return fehler(400, 'falsch');
  if (ergebnis === 'zu') return fehler(409, 'zu');

  const gewaehlt = Array.isArray(antworten.f11) ? antworten.f11 : [];
  const p = prioritaeten.map((x) => x.id).filter((id) => gewaehlt.includes(id));
  const ziel = `/umfrage/danke?${new URLSearchParams({ code, p: p.join(',') })}`;

  return alsJson
    ? Response.json({ ziel }, { headers: { 'Cache-Control': 'no-store' } })
    : redirect(ziel, 303);
};
