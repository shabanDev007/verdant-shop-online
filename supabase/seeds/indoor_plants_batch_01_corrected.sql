-- Jothoor indoor plants seed — corrected for the current Supabase schema.
--
-- CURRENT BATCH SETTINGS:
--   Prices use the supplied source price (the lowest supplied price where a
--   range or "from" price was provided).
--   stock = 10, size_code = 'M', active = true.
--   image_url remains '/placeholder.svg' until each real Storage URL is added.
--
-- Products are publishable now, but replacing '/placeholder.svg' with the real
-- image URL in both places inside each product block is strongly recommended.
-- Keep featured false unless the product should appear in the featured section.
--
-- Re-running this file updates products by slug, reuses any existing real product image and replaces only the four standard FAQs below. Extra gallery images,
-- reviews, pot combinations and custom FAQs are preserved.

begin;

-- Optional category creation. Remove this block if the category already exists.
insert into public.categories
(slug, name_en, name_ar, description_en, description_ar, active)
values
('indoor-plants', 'Indoor Plants', 'نباتات داخلية',
 'Decorative plants selected for indoor growing conditions.',
 'نباتات زينة مختارة للزراعة والعرض داخل المنزل أو المكتب.',
 true)
on conflict (slug) do update set
 name_en = excluded.name_en,
 name_ar = excluded.name_ar,
 description_en = excluded.description_en,
 description_ar = excluded.description_ar,
 active = excluded.active;


-- Santa Rosa Dracaena | Source reference price: EGP 315–550
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'santa-rosa',
 'santa-rosa',
 'Santa Rosa Dracaena',
 'دراسينا سانتا روزا',
 'A resilient dracaena with upright, sword-like foliage, suitable for bright indoor spaces and sheltered outdoor areas. Natural plants may vary slightly from photos.',
 'دراسينا قوية بأوراق طويلة قائمة تشبه السيوف، مناسبة للأماكن الداخلية المضيئة والأماكن الخارجية المحمية. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 315,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"potSize": "Choose the exact sold size", "growthRate": "Slow", "flowering": true, "indoorOutdoor": "both", "scientificName": "Dracaena marginata", "soil": "Mixed potting soil", "sunlight": "Bright indirect light", "water": "Moderate"}'::jsonb,
 'Place in bright indirect light. Water moderately after the upper soil begins to dry. Avoid standing water and cold drafts.',
 'توضع في ضوء ساطع غير مباشر. تُروى باعتدال بعد بدء جفاف سطح التربة، مع تجنب ركود المياه والتيارات الباردة.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='santa-rosa')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='santa-rosa'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='santa-rosa'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='santa-rosa'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='santa-rosa'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Arrowroot | Source reference price: EGP 330
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'arrowroot',
 'arrowroot',
 'Arrowroot',
 'أروروت',
 'A fast-growing tropical foliage plant with fresh green leaves and an easy-care character for softly lit interiors. Natural plants may vary slightly from photos.',
 'نبات استوائي سريع النمو بأوراق خضراء جذابة، مناسب للديكور الداخلي ذي الإضاءة الهادئة. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 330,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"potSize": "15 cm", "growthRate": "Fast", "flowering": true, "indoorOutdoor": "indoor", "scientificName": "Maranta arundinacea", "family": "Marantaceae", "plantHeight": "Up to about 1.5 m", "soil": "Moist, well-draining soil", "sunlight": "Bright indirect light", "water": "Moderate"}'::jsonb,
 'Provide bright indirect light and evenly moist, well-draining soil. Do not leave the pot waterlogged.',
 'يُفضل ضوء ساطع غير مباشر وتربة جيدة التصريف تظل رطبة بدرجة معتدلة، دون إغراق القصرية.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='arrowroot')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='arrowroot'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='arrowroot'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='arrowroot'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='arrowroot'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Dracaena Rikki | Source reference price: EGP 100
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'dracaena-rikki',
 'dracaena-rikki',
 'Dracaena Rikki',
 'دراسينا ريكي',
 'A hardy dracaena with arching deep-green leaves that adapts well to lower-light indoor locations. Natural plants may vary slightly from photos.',
 'دراسينا قوية بأوراق خضراء داكنة مقوسة، وتتحمل الأماكن الداخلية ذات الإضاءة المنخفضة نسبيًا. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 100,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"growthRate": "Fast", "flowering": null, "indoorOutdoor": "indoor", "scientificName": "Dracaena deremensis ''Rikki''", "soil": "Mixed potting soil", "sunlight": "Indirect light", "water": "Moderate"}'::jsonb,
 'Keep in indirect light. Water moderately and allow slight surface drying between waterings. Avoid overwatering.',
 'توضع في إضاءة غير مباشرة، وتُروى باعتدال مع ترك سطح التربة يجف قليلًا بين الريات.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='dracaena-rikki')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='dracaena-rikki'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='dracaena-rikki'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='dracaena-rikki'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='dracaena-rikki'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Domino Peace Lily | Source reference price: EGP 480
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'peace-lily-domino',
 'peace-lily-domino',
 'Domino Peace Lily',
 'سباتفيلم دومينو مبرقش',
 'A variegated peace lily with cream-streaked foliage and elegant white blooms for shaded indoor corners. Natural plants may vary slightly from photos.',
 'سباتفيلم مبرقش بأوراق مخططة بالكريمي وزهور بيضاء أنيقة، مناسب للأركان الداخلية بعيدة عن الشمس المباشرة. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 480,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"humidity": "Medium to high", "growthRate": "Moderate", "flowering": true, "petSafe": false, "indoorOutdoor": "indoor", "scientificName": "Spathiphyllum wallisii ''Domino''", "family": "Araceae", "origin": "Tropical America; cultivar parent associated with Colombia and Venezuela", "plantHeight": "About 30–90 cm", "soil": "Moist, organic, well-draining soil", "toxicity": "Toxic if ingested", "sunlight": "Low to bright indirect light", "water": "Moderate"}'::jsonb,
 'Grow in indirect light and moist, well-draining organic soil. Water when the surface begins to dry and keep away from pets.',
 'يوضع في ضوء غير مباشر وتربة عضوية جيدة التصريف. يُروى عند بدء جفاف السطح ويُحفظ بعيدًا عن الحيوانات الأليفة.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='peace-lily-domino')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='peace-lily-domino'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='peace-lily-domino'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='peace-lily-domino'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='peace-lily-domino'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Cast Iron Plant | Source reference price: EGP 420
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'cast-iron-plant',
 'cast-iron-plant',
 'Cast Iron Plant',
 'أسبيدسترا',
 'A famously tolerant foliage plant with upright green leaves, ideal for low-light homes and beginner plant owners. Natural plants may vary slightly from photos.',
 'نبات ورقي شديد التحمل بأوراق خضراء قائمة، مناسب للإضاءة المنخفضة ولمحبي النباتات المبتدئين. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 420,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"growthRate": "Slow", "flowering": true, "indoorOutdoor": "both", "scientificName": "Aspidistra elatior", "family": "Asparagaceae", "origin": "Asia", "plantHeight": "Up to about 60 cm", "soil": "Rich, well-draining soil", "sunlight": "Low to indirect light", "water": "Moderate"}'::jsonb,
 'Keep away from direct sun. Water regularly in warm months but reduce watering in winter. Use rich, well-draining soil.',
 'يُبعد عن الشمس المباشرة. يُروى بانتظام في الجو الدافئ مع تقليل الري شتاءً، ويزرع في تربة غنية جيدة التصريف.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='cast-iron-plant')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='cast-iron-plant'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='cast-iron-plant'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='cast-iron-plant'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='cast-iron-plant'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Syngonium Wendlandii | Source reference price: EGP 315
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'syngonium-silver-goosefoot',
 'syngonium-silver-goosefoot',
 'Syngonium Wendlandii',
 'سينجونيوم ويندلاند',
 'A distinctive climbing syngonium with deep-green arrow-shaped leaves and a contrasting pale central vein. Natural plants may vary slightly from photos.',
 'سينجونيوم متسلق مميز بأوراق سهمية خضراء داكنة وعِرق وسطي فاتح واضح. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 315,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"growthRate": "Slow", "flowering": null, "petSafe": false, "indoorOutdoor": "indoor", "scientificName": "Syngonium wendlandii", "family": "Araceae", "origin": "Central America", "soil": "Mixed, well-draining potting soil", "toxicity": "Toxic if ingested", "sunlight": "Indirect light", "water": "Moderate"}'::jsonb,
 'Provide indirect light and moderate watering in a draining mix. Let the top layer dry slightly before watering again.',
 'يُفضل إضاءة غير مباشرة وريًا متوسطًا في تربة جيدة التصريف، مع ترك الطبقة العلوية تجف قليلًا قبل الري.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='syngonium-silver-goosefoot')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='syngonium-silver-goosefoot'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='syngonium-silver-goosefoot'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='syngonium-silver-goosefoot'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='syngonium-silver-goosefoot'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Variegated Shell Ginger | Source reference price: EGP From 290
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'shell-ginger',
 'shell-ginger',
 'Variegated Shell Ginger',
 'زنجبيل صدفي مبرقش',
 'A bold tropical foliage plant with striped leaves that adds a lush, jungle-inspired look to bright spaces. Natural plants may vary slightly from photos.',
 'نبات استوائي بأوراق مبرقشة جريئة يضيف مظهرًا كثيفًا وحيويًا للأماكن المضيئة. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 290,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"flowering": true, "indoorOutdoor": "both", "scientificName": "Alpinia zerumbet", "family": "Zingiberaceae", "soil": "Mixed, fertile, well-draining soil", "sunlight": "Bright indirect light", "water": "Moderate"}'::jsonb,
 'Give bright indirect light, moderate moisture and a fertile, draining mix. Protect from cold and harsh direct sun.',
 'يحتاج إلى ضوء ساطع غير مباشر ورطوبة معتدلة وتربة خصبة جيدة التصريف، مع حمايته من البرد والشمس القوية.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='shell-ginger')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='shell-ginger'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='shell-ginger'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='shell-ginger'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='shell-ginger'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Christmas Cactus | Source reference price: EGP 220
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'christmas-cactus',
 'christmas-cactus',
 'Christmas Cactus',
 'صبار الكريسماس',
 'A winter-flowering houseplant with segmented stems and bright pink blooms, well suited to decorative indoor displays. Natural plants may vary slightly from photos.',
 'نبات منزلي مزهر شتاءً بسيقان مفصلية وزهور وردية زاهية، مناسب للديكور والهدايا. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 220,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"growthRate": "Slow", "flowering": true, "indoorOutdoor": "indoor", "scientificName": "Schlumbergera × buckleyi", "family": "Cactaceae", "origin": "Brazil", "soil": "Well-draining organic cactus mix", "sunlight": "Shade to filtered indirect light", "water": "Regular, without waterlogging"}'::jsonb,
 'Use filtered light and a draining mix. Water more regularly than desert cacti, but never leave roots sitting in water.',
 'يوضع في إضاءة مفلترة وتربة جيدة التصريف. يحتاج ريًا أكثر من الصبارات الصحراوية، مع منع ركود المياه حول الجذور.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='christmas-cactus')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='christmas-cactus'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='christmas-cactus'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='christmas-cactus'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='christmas-cactus'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Philodendron Xanadu | Source reference price: EGP 185
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'philodendron-xanadu',
 'winterbourn',
 'Philodendron Xanadu',
 'فيلوديندرون زانادو',
 'A compact tropical foliage plant with deeply divided leaves, ideal for adding a full green accent to bright interiors. Natural plants may vary slightly from photos.',
 'نبات استوائي مدمج بأوراق عميقة التفصيص، يضيف كتلة خضراء أنيقة للأماكن الداخلية المضيئة. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 185,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"flowering": null, "petSafe": false, "indoorOutdoor": "both", "scientificName": "Thaumatophyllum xanadu", "family": "Araceae", "origin": "Brazil", "soil": "Loose, well-draining potting mix", "toxicity": "Toxic if ingested", "sunlight": "Bright indirect light", "water": "Moderate"}'::jsonb,
 'Grow in bright indirect light and a loose, draining mix. Water moderately after the upper soil begins to dry.',
 'يوضع في ضوء ساطع غير مباشر وتربة خفيفة جيدة التصريف. يُروى باعتدال بعد بدء جفاف سطح التربة.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='philodendron-xanadu')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='philodendron-xanadu'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='philodendron-xanadu'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='philodendron-xanadu'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='philodendron-xanadu'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);


-- Foxtail Fern | Source reference price: EGP From 75
-- Product is active with the supplied price, stock 10 and size M.
insert into public.products (
 category_id, slug, sku, name_en, name_ar, description_en, description_ar,
 price, old_price, stock, image_url, featured, active, specs,
 care_instructions_en, care_instructions_ar, delivery_info_en, delivery_info_ar,
 return_policy_en, return_policy_ar, product_type, size_code
)
values (
 (select id from public.categories where slug = 'indoor-plants'),
 'foxtail-fern',
 'foxtail-fern',
 'Foxtail Fern',
 'سرخس ذيل الثعلب',
 'An evergreen ornamental with dense, feathery stems that create a soft architectural shape indoors or in shaded outdoor areas. Natural plants may vary slightly from photos.',
 'نبات زينة دائم الخضرة بسيقان ريشية كثيفة تمنحه شكلًا مميزًا داخل المنزل أو في الأماكن الخارجية المظللة. قد يختلف شكل النبات الطبيعي قليلًا عن الصور.',
 75,
 null,
 10,
 '/placeholder.svg', -- TODO: Supabase Storage public image URL
 false,
 true,
 '{"growthRate": "Fast", "flowering": true, "indoorOutdoor": "both", "scientificName": "Asparagus densiflorus ''Myersii''", "family": "Asparagaceae", "origin": "South Africa", "plantHeight": "Approximately 40–90 cm", "soil": "Loamy, well-draining soil", "sunlight": "Shade to filtered light", "water": "Moderate"}'::jsonb,
 'Keep in filtered light or shade and water moderately in loamy, draining soil. Trim old or damaged stems from the base.',
 'يوضع في إضاءة مفلترة أو ظل، ويُروى باعتدال في تربة طميية جيدة التصريف. تُزال السيقان القديمة أو التالفة من القاعدة.',
 'Delivered across Greater Cairo in 2–5 business days with protective plant packaging.',
 'يتم التوصيل داخل القاهرة الكبرى خلال 2–5 أيام عمل مع تغليف يحمي النبات.',
 'Report damaged plants within 24 hours of delivery with clear photos.',
 'أبلغنا عن النبات التالف خلال 24 ساعة من الاستلام مع إرسال صور واضحة.',
 'plant',
 'M' -- Fixed batch size
)
on conflict (slug) do update set
 category_id=excluded.category_id, sku=excluded.sku, name_en=excluded.name_en,
 name_ar=excluded.name_ar, description_en=excluded.description_en,
 description_ar=excluded.description_ar, price=excluded.price,
 old_price=excluded.old_price, stock=excluded.stock, image_url=case when excluded.image_url='/placeholder.svg' then products.image_url else excluded.image_url end,
 featured=excluded.featured, active=excluded.active, specs=excluded.specs,
 care_instructions_en=excluded.care_instructions_en,
 care_instructions_ar=excluded.care_instructions_ar,
 delivery_info_en=excluded.delivery_info_en, delivery_info_ar=excluded.delivery_info_ar,
 return_policy_en=excluded.return_policy_en, return_policy_ar=excluded.return_policy_ar,
 product_type=excluded.product_type, size_code=excluded.size_code;

delete from public.product_faqs
where product_id=(select id from public.products where slug='foxtail-fern')
  and question_en in (
    'What light does this plant need?',
    'How often should I water it?',
    'Why are the leaves turning yellow?',
    'Will my plant look exactly like the photo?'
  );

insert into public.product_faqs
(product_id,question_en,question_ar,answer_en,answer_ar,sort_order)
values
((select id from public.products where slug='foxtail-fern'),
 'What light does this plant need?','ما الإضاءة المناسبة لهذا النبات؟',
 'Use the light guidance shown in the care section and avoid sudden exposure to harsh direct sun.',
 'اتبع إرشادات الإضاءة الموجودة في قسم العناية، وتجنب نقل النبات فجأة إلى شمس مباشرة قوية.',1),
((select id from public.products where slug='foxtail-fern'),
 'How often should I water it?','كل قد إيه أسقي النبات؟',
 'Check the soil before watering. Water according to the care section and never leave excess water in the outer pot.',
 'افحص التربة قبل الري، واتبع إرشادات العناية مع عدم ترك مياه زائدة راكدة داخل القصرية الخارجية.',2),
((select id from public.products where slug='foxtail-fern'),
 'Why are the leaves turning yellow?','ليه الأوراق بتصفر؟',
 'Yellow leaves commonly follow excess water, poor drainage or sudden environmental change. Check the roots and soil moisture first.',
 'غالبًا يرتبط اصفرار الأوراق بزيادة الري أو ضعف التصريف أو تغير مفاجئ في المكان. افحص رطوبة التربة والجذور أولًا.',3),
((select id from public.products where slug='foxtail-fern'),
 'Will my plant look exactly like the photo?','هل النبات هيكون مطابق للصورة؟',
 'Each natural plant is unique, so leaf number, shape, colour and overall height may vary slightly.',
 'كل نبات طبيعي له شكل خاص، لذلك قد يختلف عدد الأوراق وشكلها ودرجة اللون والارتفاع قليلًا عن الصورة.',4);

commit;
