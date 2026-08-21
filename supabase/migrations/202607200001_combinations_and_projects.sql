-- Ready-made plant/pot combinations and landscaping project requests.
-- Run once in Supabase Dashboard > SQL Editor.

create table if not exists public.plant_pot_combinations (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.products(id) on delete cascade,
  pot_id uuid not null references public.products(id) on delete cascade,
  preview_image_url text not null,
  name_en text,
  name_ar text,
  description_en text,
  description_ar text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (plant_id, pot_id)
);

create index if not exists plant_pot_combinations_plant_idx
  on public.plant_pot_combinations(plant_id, active, sort_order);
alter table public.plant_pot_combinations enable row level security;
drop policy if exists "Public can view active plant pot combinations"
  on public.plant_pot_combinations;
create policy "Public can view active plant pot combinations"
  on public.plant_pot_combinations for select using (active = true);

create sequence if not exists public.project_request_number_seq start 1001;

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  request_number bigint not null unique default nextval('public.project_request_number_seq'),
  customer_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  project_type text not null check (
    project_type in ('balcony', 'villa', 'landscape', 'office', 'garden', 'maintenance')
  ),
  space_size text,
  budget text,
  preferred_contact_time text,
  details text not null,
  image_paths text[] not null default '{}',
  status text not null default 'new' check (
    status in ('new', 'contacted', 'survey_scheduled', 'quoted', 'accepted', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now()
);

alter table public.project_requests enable row level security;
-- No public policies: only the service-role Edge Function can read/write requests.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-requests',
  'project-requests',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
