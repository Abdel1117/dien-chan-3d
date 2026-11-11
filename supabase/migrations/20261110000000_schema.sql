-- Visage 3D Dien Chan — schema
-- Translatable texts live in *_traductions tables (one row per locale).
-- Supported locales: fr (source language), en, vi.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admins: accounts allowed to write. Managed from the Supabase console only.
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- SECURITY DEFINER so policies can check admin status without being able to
-- read the table themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- points
-- Positions and normals are in the local coordinates of the 3D model.
-- ---------------------------------------------------------------------------

create table public.points (
  id uuid primary key default gen_random_uuid(),
  numero text not null check (length(btrim(numero)) > 0),
  pos_x double precision not null,
  pos_y double precision not null,
  pos_z double precision not null,
  normal_x double precision not null,
  normal_y double precision not null,
  normal_z double precision not null,
  model_version text not null check (length(btrim(model_version)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_version, numero)
);

create trigger points_set_updated_at
  before update on public.points
  for each row execute function public.set_updated_at();

create table public.points_traductions (
  point_id uuid not null references public.points (id) on delete cascade,
  locale text not null check (locale in ('fr', 'en', 'vi')),
  nom text not null check (length(btrim(nom)) > 0),
  zone text,
  description text,
  primary key (point_id, locale)
);

-- ---------------------------------------------------------------------------
-- parcours
-- ---------------------------------------------------------------------------

create table public.parcours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  categorie text not null check (categorie in ('douleur', 'trouble')),
  tours integer not null default 1 check (tours >= 1),
  duree_defaut_secondes integer check (duree_defaut_secondes > 0),
  publie boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger parcours_set_updated_at
  before update on public.parcours
  for each row execute function public.set_updated_at();

create table public.parcours_traductions (
  parcours_id uuid not null references public.parcours (id) on delete cascade,
  locale text not null check (locale in ('fr', 'en', 'vi')),
  titre text not null check (length(btrim(titre)) > 0),
  description text,
  avertissement text,
  primary key (parcours_id, locale)
);

-- ---------------------------------------------------------------------------
-- parcours_etapes
-- Deleting a parcours deletes its steps; deleting a point used by a step is
-- refused (on delete restrict).
-- ---------------------------------------------------------------------------

create table public.parcours_etapes (
  id uuid primary key default gen_random_uuid(),
  parcours_id uuid not null references public.parcours (id) on delete cascade,
  point_id uuid not null references public.points (id) on delete restrict,
  ordre integer not null check (ordre >= 0),
  cote text not null check (cote in ('gauche', 'droite', 'les_deux', 'central')),
  mode_dosage text not null check (mode_dosage in ('duree', 'repetitions')),
  duree_secondes integer check (duree_secondes > 0),
  repetitions integer check (repetitions > 0),
  cadence_par_minute integer check (cadence_par_minute > 0),
  technique text,
  outil text,
  pause_apres_secondes integer not null default 0 check (pause_apres_secondes >= 0),
  -- Deferred so steps can be reordered inside one transaction.
  constraint parcours_etapes_ordre_unique
    unique (parcours_id, ordre) deferrable initially deferred,
  constraint parcours_etapes_dosage_coherent check (
    (mode_dosage = 'duree' and duree_secondes is not null)
    or (mode_dosage = 'repetitions' and repetitions is not null)
  )
);

create index parcours_etapes_point_id_idx on public.parcours_etapes (point_id);

create table public.etapes_traductions (
  etape_id uuid not null references public.parcours_etapes (id) on delete cascade,
  locale text not null check (locale in ('fr', 'en', 'vi')),
  note text,
  primary key (etape_id, locale)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.points enable row level security;
alter table public.points_traductions enable row level security;
alter table public.parcours enable row level security;
alter table public.parcours_traductions enable row level security;
alter table public.parcours_etapes enable row level security;
alter table public.etapes_traductions enable row level security;

-- admins: a signed-in user can see their own row (lets the app check the
-- role). No write policy exists: only the console (service role) can edit.
create policy admins_select_self on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.admins from anon, authenticated;

-- points: public read, admin write.
create policy points_select on public.points
  for select to anon, authenticated using (true);
create policy points_admin_write on public.points
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy points_traductions_select on public.points_traductions
  for select to anon, authenticated using (true);
create policy points_traductions_admin_write on public.points_traductions
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- parcours: public read of published ones (admins also see drafts).
create policy parcours_select on public.parcours
  for select to anon, authenticated
  using (publie or (select public.is_admin()));
create policy parcours_admin_write on public.parcours
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Child tables follow the visibility of their parcours: the sub-select is
-- itself filtered by the policy above.
create policy parcours_traductions_select on public.parcours_traductions
  for select to anon, authenticated
  using (exists (
    select 1 from public.parcours p where p.id = parcours_traductions.parcours_id
  ));
create policy parcours_traductions_admin_write on public.parcours_traductions
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy parcours_etapes_select on public.parcours_etapes
  for select to anon, authenticated
  using (exists (
    select 1 from public.parcours p where p.id = parcours_etapes.parcours_id
  ));
create policy parcours_etapes_admin_write on public.parcours_etapes
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy etapes_traductions_select on public.etapes_traductions
  for select to anon, authenticated
  using (exists (
    select 1 from public.parcours_etapes e
    where e.id = etapes_traductions.etape_id
  ));
create policy etapes_traductions_admin_write on public.etapes_traductions
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
