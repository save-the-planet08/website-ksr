-- Schema der KSR-Website. Einmal im SQL Editor von Supabase ausführen.
-- Lesen darf jeder, aber nur Veröffentlichtes. Schreiben darf nur, wer in
-- `admins` steht — ein Login allein reicht nicht.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

-- security definer, weil `admins` selbst für niemanden lesbar ist.
create function public.ist_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

create table public.news (
  id uuid primary key default gen_random_uuid(),
  titel text not null check (char_length(titel) between 1 and 200),
  text text not null check (char_length(text) between 1 and 20000),
  datum date not null default current_date,
  veroeffentlicht boolean not null default false,
  geaendert_am timestamptz not null default now()
);

create table public.termine (
  id uuid primary key default gen_random_uuid(),
  titel text not null check (char_length(titel) between 1 and 200),
  datum date not null,
  uhrzeit text check (char_length(uhrzeit) <= 40),
  ort text check (char_length(ort) <= 200),
  beschreibung text not null check (char_length(beschreibung) between 1 and 5000),
  art text not null default 'treffen' check (art in ('sitzung', 'event', 'workshop', 'treffen')),
  veroeffentlicht boolean not null default false,
  geaendert_am timestamptz not null default now()
);

create function public.zeitstempel() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.geaendert_am := now();
  return new;
end;
$$;

create trigger news_zeitstempel before update on public.news
  for each row execute function public.zeitstempel();
create trigger termine_zeitstempel before update on public.termine
  for each row execute function public.zeitstempel();

alter table public.news enable row level security;
alter table public.termine enable row level security;

create policy "news lesen" on public.news for select to anon, authenticated
  using (veroeffentlicht or (select public.ist_admin()));
create policy "news anlegen" on public.news for insert to authenticated
  with check ((select public.ist_admin()));
create policy "news aendern" on public.news for update to authenticated
  using ((select public.ist_admin())) with check ((select public.ist_admin()));
create policy "news loeschen" on public.news for delete to authenticated
  using ((select public.ist_admin()));

create policy "termine lesen" on public.termine for select to anon, authenticated
  using (veroeffentlicht or (select public.ist_admin()));
create policy "termine anlegen" on public.termine for insert to authenticated
  with check ((select public.ist_admin()));
create policy "termine aendern" on public.termine for update to authenticated
  using ((select public.ist_admin())) with check ((select public.ist_admin()));
create policy "termine loeschen" on public.termine for delete to authenticated
  using ((select public.ist_admin()));
