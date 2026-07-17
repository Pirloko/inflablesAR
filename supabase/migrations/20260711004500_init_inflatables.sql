-- Catálogo público de inflables
-- Aplicada al proyecto arriendoinflables (ohdwvcsxahvtqjaefpae) el 2026-07-11 vía MCP.

create table public.inflatables (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  length_m numeric not null check (length_m > 0),
  width_m numeric not null check (width_m > 0),
  height_m numeric not null check (height_m > 0),
  safety_margin_m numeric not null default 0.75,
  price_clp integer,
  age_range text,
  capacity text,
  power_required boolean not null default true,
  photos jsonb not null default '[]'::jsonb,
  model_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inflatables enable row level security;

-- Solo lectura pública de inflables activos; escritura solo vía dashboard/service role
create policy "public_read_active_inflatables"
  on public.inflatables for select
  to anon, authenticated
  using (active = true);

-- Desde abril 2026 las tablas nuevas no se exponen automáticamente a la Data API
grant usage on schema public to anon, authenticated;
grant select on public.inflatables to anon, authenticated;
grant all on public.inflatables to service_role;

-- Buckets públicos: fotos y modelos GLB
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true), ('models', 'models', true)
on conflict (id) do nothing;
