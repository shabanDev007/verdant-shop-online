
# Verdura v2 — Complete Plant & Gardening Platform

Layered rollout. Each phase compiles and is usable before moving on. Kept "thinner but everywhere" per your choice.

## Phase 1 — Foundation & Taxonomy

**Data model rewrite** (`src/types/index.ts`, `src/data/mockData.ts`)
- New interfaces: `Category` (with `parentId`, `slug`, `type`), `Product` (SKU, discountPrice, gallery, spec block, room/light/water/difficulty/benefits/occasion tags, petSafe, airPurifying, indoorOutdoor, deliveryInfo, returnPolicy, careInstructions, faq), `Review`, `Coupon`, `Address`, `Wishlist`, `RecentlyViewed`, `CartItem`, `Order`, `Customer`.
- Seed **~140 categories** across the full tree you listed (Plants → Indoor/Outdoor/Succulents/Flowering/Herbs/Vegetable/Fruit/Large/Air-Purifying/Rare; Pots & Planters; Stands; Watering; Soil; Fertilizers; Tools; Pest Control; Decoration; Seeds; Propagation; Gift; Kits; Pet-Friendly).
- Seed 2–3 products per subcategory using placeholder imagery (unsplash-style or generated hero for top categories).
- Smart collections (`new-arrivals`, `best-sellers`, `trending`, `featured`, `sale`, `staff-picks`, `limited-edition`) as computed lists.
- "Browse By" taxonomies (Room, Light, Water, Difficulty, Benefits, Occasion) — tag-based.

**Categories browsing**
- `/categories` → mega grid of parent categories.
- `/c/$slug` → category landing with subcategories + product grid.
- `/browse/$facet/$value` → e.g. `/browse/room/bedroom`, `/browse/light/low-light`.

## Phase 2 — Shopping Experience

- **Advanced filters** on `/products` and category pages: category, price range, availability, pot size, plant height, light, water, difficulty, indoor/outdoor, pet-friendly, air-purifying, featured, rating. Client-side, URL-synced via search params.
- **Smart search**: header search dropdown with autocomplete, recent searches (localStorage), popular searches (seeded), product & category suggestions.
- **Product page upgrade**: image gallery + thumbnails, discount price, SKU, full spec table, care instructions accordion, delivery/return policy, FAQ accordion, related + recommended, reviews & ratings section, quantity picker, share buttons, "add to wishlist" & "add to compare".
- **Wishlist page** `/wishlist` (already exists as context, add full page).
- **Compare page** `/compare` — side-by-side up to 4 products (spec table).
- **Recently viewed** — localStorage-tracked, shown on product & home.
- **Coupon codes** — applied at cart/checkout, validated against Cloud table.
- **Gift cards** — simple product type with custom amount.

## Phase 3 — Accounts, Checkout, Cloud

**Lovable Cloud tables** (with RLS + grants):
- `profiles` (auto-created on signup, name/phone)
- `addresses` (user_id, label, name, phone, address, city, governorate, postal_code, is_default)
- `orders` + `order_items` (user_id nullable for guest COD)
- `reviews` (user_id, product_id, rating, title, body, verified)
- `coupons` (code, discount_type, discount_value, min_subtotal, expires_at, active) — public SELECT for validation
- `wishlist_items` (user_id, product_id) — synced from local on login

**Auth flow**: email/password + Google via Lovable managed OAuth. Routes:
- `/auth` (login/register tabs), `/auth/forgot`, `/auth/reset-password`.
- `_authenticated/account/*`: profile, orders, order detail, addresses, wishlist, notifications.

**Checkout upgrade**: multi-step (address → delivery → review), address book selector (logged in) or guest form, order notes, delivery method (standard/express), coupon field, invoice-ready order confirmation with printable `/account/orders/$id`.

## Phase 4 — Homepage, i18n, polish

- Homepage sections: premium hero, featured categories, best-sellers, new arrivals, Shop by Room, Shop by Light, Shop by Care Level, plant-care tips (static article cards), customer reviews carousel, Instagram-style gallery placeholder, newsletter, brand story.
- Translations expanded to cover all new copy (EN + AR).
- SEO: per-route `head()` on every new route, JSON-LD Product schema on product pages, sitemap generation from products+categories.
- Accessibility pass: ARIA labels on icon buttons, focus rings, keyboard nav on menus/filters, contrast on category overlays.
- Performance: lazy-load route chunks, `loading="lazy"` on all images, `defaultPreloadStaleTime: 0` verified.

## Realistic caveats (please read)

- **Product imagery**: 140 categories × 2–3 products ≈ 300–400 SKUs. Generating individual hero images for each would cost ~$40+ in image credits and take ~2 hours. Plan uses a small set of themed placeholder images per category (shared across products in that category) plus generated heroes for top ~10 categories. If you want unique imagery per SKU, that's a separate follow-up.
- **Reviews**: UI + Cloud table + submission form. Seeded with 2–3 sample reviews per featured product; not 300+.
- **Notifications**: in-app list stored in Cloud, not push/email. Email requires a separate Resend setup — can do in follow-up.
- **"Admin panel"**: I'll structure code + tables so a backend can populate them, but I won't build an admin UI in this pass (you mentioned Spring Boot handles admin).
- **Compare/Recently viewed**: localStorage only, not synced across devices.
- **Gift cards**: purchasable product with code delivery on order confirmation; not a full stored-value wallet system.

## Tech notes (technical readers)

- `createServerFn` for all Cloud calls; `_authenticated/` layout for account routes; public routes for catalog.
- `queryOptions` + `ensureQueryData` + `useSuspenseQuery` throughout.
- Search params via `zodValidator` + `fallback()` for all filter state.
- Product/category data stays in `src/data/` for now, exposed through `src/services/api.ts` — swap to `fetch(API_BASE_URL + ...)` when Spring Boot is ready. Auth/orders/reviews go through Cloud immediately.

## What you'll approve

Say **go** and I'll start with Phase 1 (types + full taxonomy + category routes), then check in before Phase 2. Or tell me to reorder — e.g. "skip Cloud for now, do catalog + shopping first."
