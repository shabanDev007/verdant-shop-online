# 🌿 Jothour | جذور — Premium Plant E-commerce

A modern, production-ready plant store built with **React + TypeScript + TanStack Start + Tailwind v4**. Bilingual (English / Arabic with full RTL), Egyptian Pound pricing, and a clean API layer ready for a Spring Boot backend.

---

## ✨ Features

- 🛍️ **Catalog** — browse, search, filter by category, sort
- 🪴 **Product detail** — gallery, care guide (water / light / temperature / difficulty), related items
- 🛒 **Cart & Wishlist** — persisted to `localStorage`
- 💳 **Checkout** — Cash on Delivery flow with full Zod form validation
- 🌐 **i18n** — English + Arabic with automatic **RTL** layout, Cairo Arabic font, easy to extend to more languages
- 💷 **Egyptian Pound** — single source-of-truth currency formatter (`src/lib/format.ts`)
- 📱 **Fully responsive** — mobile, tablet, desktop
- 🔍 **SEO** — per-route `<title>`, meta description, OG tags, `robots.txt`, `sitemap.xml`
- ♿ **Accessible** — semantic HTML, ARIA labels on icon-only buttons, focus styles
- 🔌 **Backend-ready** — every network call lives in `src/services/api.ts`; swap mocks for `fetch` to hit a Spring Boot API

---

## 🧱 Tech Stack

| Layer         | Choice                                  |
| ------------- | --------------------------------------- |
| Framework     | React 19 + TanStack Start (Vite 7)      |
| Language      | TypeScript (strict)                     |
| Styling       | Tailwind CSS v4 + design tokens (OKLCH) |
| UI Primitives | shadcn/ui (Radix)                       |
| Data          | TanStack Query                          |
| Forms         | Zod                                     |
| Notifications | sonner                                  |
| Icons         | lucide-react                            |

---

## 📁 Project Structure

```
src/
├─ assets/              # Bundled images
├─ components/          # Reusable UI (Navbar, Footer, ProductCard, ...)
│  └─ ui/               # shadcn primitives
├─ context/             # Cart, Wishlist providers
├─ data/                # mockData.ts (replace with API)
├─ i18n/                # LanguageProvider + translations
├─ lib/                 # format.ts (EGP), usePrice hook, utils
├─ routes/              # File-based routes (TanStack Router)
├─ services/api.ts      # ← Single API layer (point at Spring Boot here)
├─ styles.css           # Tailwind v4 theme tokens
└─ types/               # Shared TypeScript domain types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** or **Bun 1.1+**

### Install

```bash
bun install        # or: npm install / pnpm install
```

### Environment variables

Copy the example and edit as needed:

```bash
cp .env.example .env
```

| Variable            | Default                     | Purpose                        |
| ------------------- | --------------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Spring Boot REST endpoint base |

### Run dev server

```bash
bun dev            # http://localhost:8080
```

### Build for production

```bash
bun run build
bun run start      # serves the production build
```

---

## 🌍 Adding a Language

1. Add the language to `LANGUAGES` and `translations` in `src/i18n/translations.ts`.
2. The `LanguageProvider` automatically sets `<html lang>` and `<html dir>`.
3. Use `useT()` for strings and `usePrice()` for amounts in your components.

```tsx
const t = useT();
const price = usePrice();
return (
  <button>
    {t("product.addToCart")} — {price(199)}
  </button>
);
```

---

## 💷 Currency

All prices are formatted via `src/lib/format.ts` (Egyptian Pound — `EGP`).

- English: `1,250 EGP`
- Arabic: `١٬٢٥٠ ج.م.‏` (via `Intl.NumberFormat("ar-EG", ...)`)

To change currency globally, update `CURRENCY_CODE` in `src/lib/format.ts`.

---

## 🔌 Connecting the Spring Boot Backend

Every network call is centralized in `src/services/api.ts`. Each function carries a comment showing the equivalent `fetch` against `API_BASE_URL`. Swap the mock returns for real calls — components don't need to change.

Expected backend contract (see `src/types/index.ts` for full DTOs):

| Method | Path                         | Returns           |
| ------ | ---------------------------- | ----------------- |
| GET    | `/api/products`              | `Product[]`       |
| GET    | `/api/products/{id}`         | `Product`         |
| GET    | `/api/products/featured`     | `Product[]`       |
| GET    | `/api/products?search=`      | `Product[]`       |
| GET    | `/api/products?categoryId=`  | `Product[]`       |
| GET    | `/api/products/{id}/related` | `Product[]`       |
| GET    | `/api/categories`            | `Category[]`      |
| POST   | `/api/orders`                | `Order` (with id) |

---

## 🌐 Deployment

The project uses Nitro, so the production bundle can run on a standard Node.js host.

- **Any Node host** — `bun run build`, then `bun run start`
- **Vercel / Netlify / Cloudflare** — select the corresponding Nitro preset or platform adapter before deploying

---

## 📜 License

MIT — do whatever, just don't blame us if your monstera doesn't thrive.
