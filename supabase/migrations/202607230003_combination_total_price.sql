alter table public.plant_pot_combinations
  add column if not exists total_price numeric(12, 2);

drop index if exists public.plant_pot_combinations_catalog_idx;

alter table public.plant_pot_combinations
  drop column if exists show_in_catalog;

alter table public.plant_pot_combinations
  drop constraint if exists plant_pot_combinations_total_price_check;

alter table public.plant_pot_combinations
  add constraint plant_pot_combinations_total_price_check
  check (total_price is null or total_price >= 0);

comment on column public.plant_pot_combinations.total_price is
  'Final price of the plant with this replacement pot. The base products.price is the price with the pot shown in the main product photo.';
