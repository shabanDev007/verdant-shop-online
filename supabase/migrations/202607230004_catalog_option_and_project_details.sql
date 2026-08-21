alter table public.plant_pot_combinations
  add column if not exists show_in_catalog boolean not null default false;

create index if not exists plant_pot_combinations_catalog_idx
  on public.plant_pot_combinations (show_in_catalog, sort_order)
  where active = true and show_in_catalog = true;

comment on column public.plant_pot_combinations.show_in_catalog is
  'When true, this exact plant and pot option appears among normal catalog products.';
