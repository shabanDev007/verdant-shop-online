-- Public projects portfolio and its ordered images.
-- Run once in Supabase Dashboard > SQL Editor.

create table if not exists public.project_portfolio (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text,
  description_en text,
  description_ar text,
  project_type text not null check (
    project_type in ('balcony', 'villa', 'landscape', 'office', 'garden', 'maintenance')
  ),
  location_en text,
  location_ar text,
  completed_at date,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.project_portfolio_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project_portfolio(id) on delete cascade,
  image_url text not null,
  alt_en text,
  alt_ar text,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_portfolio_images_project_idx
  on public.project_portfolio_images(project_id, is_cover desc, sort_order);

alter table public.project_portfolio enable row level security;
alter table public.project_portfolio_images enable row level security;

drop policy if exists "Public can view active portfolio projects" on public.project_portfolio;
create policy "Public can view active portfolio projects"
  on public.project_portfolio for select using (active = true);

drop policy if exists "Public can view active portfolio images"
  on public.project_portfolio_images;
create policy "Public can view active portfolio images"
  on public.project_portfolio_images for select
  using (
    exists (
      select 1 from public.project_portfolio project
      where project.id = project_id and project.active = true
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-portfolio',
  'project-portfolio',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio storage" on storage.objects;
create policy "Public can view portfolio storage"
  on storage.objects for select
  using (bucket_id = 'project-portfolio');
