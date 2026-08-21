-- Product details, approved reviews, FAQs, and Build Your Plant configuration.
-- Run once in Supabase Dashboard > SQL Editor.

alter table public.products add column if not exists specs jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists care_instructions_en text;
alter table public.products add column if not exists care_instructions_ar text;
alter table public.products add column if not exists delivery_info_en text;
alter table public.products add column if not exists delivery_info_ar text;
alter table public.products add column if not exists return_policy_en text;
alter table public.products add column if not exists return_policy_ar text;
alter table public.products add column if not exists product_type text not null default 'other';
alter table public.products add column if not exists size_code text;
alter table public.products add column if not exists builder_image_url text;
alter table public.products add column if not exists builder_scale numeric not null default 1;
alter table public.products add column if not exists builder_offset_x integer not null default 0;
alter table public.products add column if not exists builder_offset_y integer not null default 0;

do $$ begin
  alter table public.products add constraint products_product_type_check
    check (product_type in ('plant', 'pot', 'other'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.products add constraint products_size_code_check
    check (size_code is null or size_code in ('S', 'M', 'L'));
exception when duplicate_object then null;
end $$;

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question_en text not null,
  question_ar text,
  answer_en text not null,
  answer_ar text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_faqs_product_id_idx
  on public.product_faqs(product_id, sort_order);
alter table public.product_faqs enable row level security;
drop policy if exists "Public can view product FAQs" on public.product_faqs;
create policy "Public can view product FAQs" on public.product_faqs for select using (true);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  verified boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews(product_id, approved, created_at desc);
alter table public.product_reviews enable row level security;
drop policy if exists "Public can view approved reviews" on public.product_reviews;
create policy "Public can view approved reviews"
  on public.product_reviews for select using (approved = true);

-- Complete the existing Monstera product with test details.
update public.products
set
  product_type = 'plant',
  size_code = 'M',
  specs = '{"plantHeight":"50–70 cm","potSize":"20 cm","humidity":"Medium to high","temperature":"18–28°C","growthRate":"Fast","petSafe":false,"airPurifying":true,"indoorOutdoor":"indoor"}'::jsonb,
  care_instructions_en = 'Place in bright indirect light. Water when the top 3–5 cm of soil feels dry and avoid leaving the roots in standing water.',
  care_instructions_ar = 'ضعها في ضوء ساطع غير مباشر. اسقها عندما يجف أول 3–5 سم من التربة وتجنب ترك الجذور في مياه راكدة.',
  delivery_info_en = 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
  delivery_info_ar = 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
  return_policy_en = 'Report damaged plants within 24 hours of delivery with clear photos.',
  return_policy_ar = 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.'
where id = 'b8fbcfd3-5a4a-40e3-8256-19f9e78507b9';

delete from public.product_faqs
where product_id = 'b8fbcfd3-5a4a-40e3-8256-19f9e78507b9';
insert into public.product_faqs
  (product_id, question_en, question_ar, answer_en, answer_ar, sort_order)
values
  ('b8fbcfd3-5a4a-40e3-8256-19f9e78507b9', 'Is Monstera easy to care for?', 'هل العناية بالمونستيرا سهلة؟', 'Yes. It is suitable for beginners when kept in bright indirect light and watered after the topsoil dries.', 'نعم، هي مناسبة للمبتدئين عند وضعها في ضوء ساطع غير مباشر وريها بعد جفاف سطح التربة.', 1),
  ('b8fbcfd3-5a4a-40e3-8256-19f9e78507b9', 'Is it safe for pets?', 'هل هي آمنة للحيوانات الأليفة؟', 'No. Keep it away from cats and dogs that may chew its leaves.', 'لا، يجب إبعادها عن القطط والكلاب التي قد تمضغ أوراقها.', 2);

delete from public.product_reviews
where product_id = 'b8fbcfd3-5a4a-40e3-8256-19f9e78507b9'
  and customer_name in ('Nour A.', 'Ahmed M.');
insert into public.product_reviews
  (product_id, customer_name, rating, title, body, verified, approved)
values
  ('b8fbcfd3-5a4a-40e3-8256-19f9e78507b9', 'Nour A.', 5, 'Healthy plant', 'The plant arrived healthy and carefully packaged.', true, true),
  ('b8fbcfd3-5a4a-40e3-8256-19f9e78507b9', 'Ahmed M.', 4, 'Beautiful Monstera', 'Good size and looks great in the living room.', true, true);
