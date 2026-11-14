-- Schülerbedarfskompass. Nach `schema.sql` einmal ausführen.
--
-- Niemand schreibt direkt in die Tabellen. Besucher kommen nur über
-- `umfrage_schule` und `umfrage_absenden` hinein, Admins lesen nur Summen aus
-- `umfrage_auswertung`. Damit hilft auch der öffentliche Schlüssel nicht, an
-- einzelne Antworten zu kommen oder an der Prüfung vorbei zu schreiben.

create table public.umfragen (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  start date,
  ende date,
  check (ende is null or start is null or ende >= start)
);

-- Ohne Start und Ende ist die Umfrage zu. Gesetzt wird beides in `/admin`.
insert into public.umfragen (id) values ('2027');

-- Sechs Zeichen ohne Verwechsler (kein 0/O, 1/I/L). Die ersten sechs Bytes
-- einer v4-UUID sind voll zufällig; `random()` wäre vorhersagbar.
create function public.schulcode() returns text
language sql volatile set search_path = ''
as $$
  select 'RTK-' || string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + get_byte(b, i) % 31, 1), '' order by i)
  from (select uuid_send(gen_random_uuid()) as b) x, generate_series(0, 5) i;
$$;

create table public.schulen (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 200),
  code text not null unique default public.schulcode(),
  -- Für die Ausreißerprüfung: mehr Antworten als Schüler fällt auf.
  schueler integer check (schueler > 0)
);

create table public.umfrage_antworten (
  -- Erzeugt der Browser beim Start. Wer zweimal auf Absenden tippt, zählt
  -- einmal; wer nach den Pflichtteilen noch Extras abschickt, auch.
  id uuid primary key,
  umfrage text not null references public.umfragen (id),
  schule_id uuid not null references public.schulen (id) on delete cascade,
  antworten jsonb not null check (
    jsonb_typeof(antworten) = 'object' and pg_column_size(antworten) < 16000
  ),
  -- Nur der Tag. Eine Uhrzeit würde Antworten mit Personen verknüpfbar machen,
  -- die zur selben Minute im selben Raum saßen.
  eingang date not null default (now() at time zone 'Europe/Berlin')::date
);

alter table public.umfragen enable row level security;
alter table public.schulen enable row level security;
alter table public.umfrage_antworten enable row level security;

create policy "umfragen lesen" on public.umfragen for select to authenticated
  using ((select public.ist_admin()));
create policy "umfragen aendern" on public.umfragen for update to authenticated
  using ((select public.ist_admin())) with check ((select public.ist_admin()));

create policy "schulen lesen" on public.schulen for select to authenticated
  using ((select public.ist_admin()));
create policy "schulen anlegen" on public.schulen for insert to authenticated
  with check ((select public.ist_admin()));
create policy "schulen aendern" on public.schulen for update to authenticated
  using ((select public.ist_admin())) with check ((select public.ist_admin()));
create policy "schulen loeschen" on public.schulen for delete to authenticated
  using ((select public.ist_admin()));

-- `umfrage_antworten` hat bewusst keine Regel: niemand liest oder schreibt sie
-- direkt, auch Admins nicht.

/* --------------------------------------------------------------------------
   Für Besucher
   -------------------------------------------------------------------------- */

-- 'offen' mit Schulname, 'zu' (Code stimmt, Umfrage läuft nicht) oder 'falsch'.
create function public.umfrage_schule(p_code text)
returns table (zustand text, umfrage text, schule text)
language sql stable security definer set search_path = ''
as $$
  with s as (select name from public.schulen where code = upper(trim(p_code))),
  u as (
    select id from public.umfragen
    where (now() at time zone 'Europe/Berlin')::date between start and ende
    order by start desc limit 1
  )
  select
    case when not exists (select 1 from s) then 'falsch'
         when not exists (select 1 from u) then 'zu'
         else 'offen' end,
    (select id from u),
    case when exists (select 1 from u) then (select name from s) end;
$$;

create function public.umfrage_absenden(p_id uuid, p_code text, p_antworten jsonb)
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_schule uuid;
  v_umfrage text;
begin
  select id into v_schule from public.schulen where code = upper(trim(p_code));
  if v_schule is null then return 'falsch'; end if;

  select id into v_umfrage from public.umfragen
  where (now() at time zone 'Europe/Berlin')::date between start and ende
  order by start desc limit 1;
  if v_umfrage is null then return 'zu'; end if;

  -- Erst kommen die Pflichtteile, nach den Extras dieselbe ID noch einmal mit
  -- allem. Die zweite Fassung ersetzt die erste — aber nur für dieselbe Schule.
  insert into public.umfrage_antworten (id, umfrage, schule_id, antworten)
  values (p_id, v_umfrage, v_schule, p_antworten)
  on conflict (id) do update set antworten = excluded.antworten
  where public.umfrage_antworten.schule_id = excluded.schule_id
    and public.umfrage_antworten.umfrage = excluded.umfrage;
  return 'ok';
end;
$$;

/* --------------------------------------------------------------------------
   Für Admins
   -------------------------------------------------------------------------- */

-- Antworten je Schule, auch unter zehn — nötig für die Ausreißerprüfung, verrät
-- aber keine Inhalte.
create function public.umfrage_uebersicht(p_umfrage text)
returns table (schule_id uuid, anzahl bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.ist_admin() then raise exception 'nur für Admins'; end if;
  return query
    select a.schule_id, count(*) from public.umfrage_antworten a
    where a.umfrage = p_umfrage group by a.schule_id;
end;
$$;

-- Summen je Frage und Wert, je Schule und für alle zusammen (`schule` ist dann
-- null). Eine Zeile erscheint nur, wenn mindestens zehn Personen diese Frage
-- beantwortet haben — so gilt die Regel auch für Frage 23 und die Module,
-- nicht nur für die Schule als Ganzes. Die Zehn steht hier fest und ist kein
-- Parameter, damit sie niemand von außen herabsetzt.
create function public.umfrage_auswertung(p_umfrage text)
returns table (schule text, frage text, wert text, anzahl bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.ist_admin() then raise exception 'nur für Admins'; end if;
  return query
  with flach as (
    select a.id, s.name as schule, e.key as frage, v.wert
    from public.umfrage_antworten a
    join public.schulen s on s.id = a.schule_id
    cross join lateral jsonb_each(a.antworten) e
    cross join lateral (
      select e.value #>> '{}' as wert where jsonb_typeof(e.value) = 'string'
      union all
      select x from jsonb_array_elements_text(
        case when jsonb_typeof(e.value) = 'array' then e.value else '[]'::jsonb end) x
    ) v
    where a.umfrage = p_umfrage
  ),
  beide as (
    select f.id, f.schule, f.frage, f.wert from flach f
    union all
    select f.id, null, f.frage, f.wert from flach f
  ),
  genug as (
    select b.schule, b.frage from beide b
    group by b.schule, b.frage
    having count(distinct b.id) >= 10
  )
  select b.schule, b.frage, b.wert, count(*)
  from beide b
  join genug g on g.frage = b.frage and g.schule is not distinct from b.schule
  group by b.schule, b.frage, b.wert;
end;
$$;

-- Admins brauchen `schulcode()`: es ist der Standardwert beim Anlegen einer
-- Schule und läuft mit den Rechten dessen, der anlegt.
revoke execute on function public.schulcode() from public, anon;
grant execute on function public.schulcode() to authenticated;
revoke execute on function public.umfrage_schule(text) from public;
revoke execute on function public.umfrage_absenden(uuid, text, jsonb) from public;
revoke execute on function public.umfrage_uebersicht(text) from public, anon;
revoke execute on function public.umfrage_auswertung(text) from public, anon;
grant execute on function public.umfrage_schule(text) to anon, authenticated;
grant execute on function public.umfrage_absenden(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.umfrage_uebersicht(text) to authenticated;
grant execute on function public.umfrage_auswertung(text) to authenticated;
