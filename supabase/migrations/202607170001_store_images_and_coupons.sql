-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_en text,
  alt_ar text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.product_images add column if not exists alt_en text;
alter table public.product_images add column if not exists alt_ar text;
alter table public.product_images add column if not exists sort_order integer not null default 0;
alter table public.product_images add column if not exists is_primary boolean not null default false;
alter table public.product_images add column if not exists created_at timestamptz not null default now();

create index if not exists product_images_product_id_idx
  on public.product_images(product_id, sort_order);

alter table public.product_images enable row level security;
drop policy if exists "Public can view product images" on public.product_images;
create policy "Public can view product images"
  on public.product_images for select
  using (true);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent', 'fixed', 'free_shipping')),
  value numeric not null default 0 check (value >= 0),
  min_subtotal numeric not null default 0 check (min_subtotal >= 0),
  max_discount numeric,
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  description_en text,
  description_ar text,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
-- Coupons are intentionally not publicly readable. Edge Functions use the service role.

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount numeric not null default 0;

insert into public.coupons (code, type, value, min_subtotal, max_discount, active, description_en, description_ar)
values
  ('WELCOME10', 'percent', 10, 500, 300, true, '10% off orders over 500 EGP', 'خصم 10% للطلبات فوق 500 جنيه'),
  ('PLANT50', 'fixed', 50, 800, null, true, '50 EGP off orders over 800 EGP', 'خصم 50 جنيه للطلبات فوق 800 جنيه'),
  ('FREESHIP', 'free_shipping', 0, 0, null, true, 'Free standard delivery', 'توصيل عادي مجاني')
on conflict (code) do nothing;
