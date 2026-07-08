import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { getCategories, getProducts } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { facets } from "@/data/mockData";

const searchSchema = z.object({
  category: fallback(z.string(), "all").default("all"),
  q: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "featured").default("featured"),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 0).default(0),
  pet: fallback(z.boolean(), false).default(false),
  air: fallback(z.boolean(), false).default(false),
  inStock: fallback(z.boolean(), false).default(false),
  featured: fallback(z.boolean(), false).default(false),
  light: fallback(z.string(), "").default(""),
  water: fallback(z.string(), "").default(""),
  difficulty: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shop All Plants & Gardening — Verdura" },
      { name: "description", content: "Browse our full collection of plants, pots, tools, soil, and gardening essentials." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [drawer, setDrawer] = useState(false);

  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const setP = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }), replace: true });

  const filtered = useMemo(() => {
    let list = products;
    if (search.category !== "all") list = list.filter((p) => p.categoryId === search.category);
    if (search.q.trim()) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q),
      );
    }
    if (search.min > 0) list = list.filter((p) => p.price >= search.min);
    if (search.max > 0) list = list.filter((p) => p.price <= search.max);
    if (search.pet) list = list.filter((p) => p.petSafe);
    if (search.air) list = list.filter((p) => p.airPurifying);
    if (search.inStock) list = list.filter((p) => p.stock > 0);
    if (search.featured) list = list.filter((p) => p.featured);
    if (search.light) list = list.filter((p) => p.lightTag === search.light);
    if (search.water) list = list.filter((p) => p.waterTag === search.water);
    if (search.difficulty) list = list.filter((p) => p.difficultyLevel === (search.difficulty as never));

    if (search.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (search.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (search.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (search.sort === "newest") list = [...list].sort((a, b) => (b.badges.includes("new") ? 1 : 0) - (a.badges.includes("new") ? 1 : 0));
    return list;
  }, [products, search]);

  const activeCount =
    (search.category !== "all" ? 1 : 0) +
    (search.q ? 1 : 0) +
    (search.min > 0 ? 1 : 0) +
    (search.max > 0 ? 1 : 0) +
    (search.pet ? 1 : 0) +
    (search.air ? 1 : 0) +
    (search.inStock ? 1 : 0) +
    (search.featured ? 1 : 0) +
    (search.light ? 1 : 0) +
    (search.water ? 1 : 0) +
    (search.difficulty ? 1 : 0);

  const clearAll = () =>
    navigate({
      search: {
        category: "all", q: "", sort: "featured", min: 0, max: 0,
        pet: false, air: false, inStock: false, featured: false,
        light: "", water: "", difficulty: "",
      },
      replace: true,
    });

  const rootCategories = categories.filter((c) => !c.parentId);

  const filtersPanel = (
    <div className="space-y-6 text-sm">
      <FilterSection title="Category">
        <select
          value={search.category}
          onChange={(e) => setP({ category: e.target.value })}
          className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All categories</option>
          {rootCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Price (EGP)">
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} placeholder="Min"
            value={search.min || ""}
            onChange={(e) => setP({ min: Number(e.target.value) || 0 })}
            className="w-full rounded-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number" min={0} placeholder="Max"
            value={search.max || ""}
            onChange={(e) => setP({ max: Number(e.target.value) || 0 })}
            className="w-full rounded-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </FilterSection>

      <FilterSection title="Light">
        <ChipGroup
          value={search.light}
          onChange={(v) => setP({ light: v })}
          options={facets.light.map((f) => ({ value: f.value, label: f.label }))}
        />
      </FilterSection>

      <FilterSection title="Water">
        <ChipGroup
          value={search.water}
          onChange={(v) => setP({ water: v })}
          options={facets.water.map((f) => ({ value: f.value, label: f.label }))}
        />
      </FilterSection>

      <FilterSection title="Difficulty">
        <ChipGroup
          value={search.difficulty}
          onChange={(v) => setP({ difficulty: v })}
          options={facets.difficulty.map((f) => ({ value: f.value, label: f.label }))}
        />
      </FilterSection>

      <FilterSection title="Attributes">
        <div className="flex flex-col gap-2">
          <Toggle checked={search.pet} onChange={(v) => setP({ pet: v })} label="Pet friendly" />
          <Toggle checked={search.air} onChange={(v) => setP({ air: v })} label="Air purifying" />
          <Toggle checked={search.inStock} onChange={(v) => setP({ inStock: v })} label="In stock only" />
          <Toggle checked={search.featured} onChange={(v) => setP({ featured: v })} label="Featured" />
        </div>
      </FilterSection>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
        >
          Clear all filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Shop</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          All Products
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {filtered.length} product{filtered.length === 1 ? "" : "s"} · ready to ship across Egypt.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            value={search.q}
            onChange={(e) => setP({ q: e.target.value })}
            className="w-full rounded-full border border-input bg-background py-2.5 ps-10 pe-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <select
          value={search.sort}
          onChange={(e) => setP({ sort: e.target.value })}
          className="rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="featured">Sort: Featured</option>
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm hover:border-primary lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden rounded-3xl border border-border/60 bg-card p-6 lg:block h-fit sticky top-24">
          {filtersPanel}
        </aside>

        <section>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 font-display text-xl font-semibold">No products match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try clearing search or another category.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground me-1">Browse by:</span>
            {Object.entries(facets).slice(0, 4).map(([key, values]) =>
              values.slice(0, 2).map((v) => (
                <Link
                  key={`${key}-${v.value}`}
                  to="/browse/$facet/$value"
                  params={{ facet: key, value: v.value }}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary"
                >
                  {v.label}
                </Link>
              )),
            )}
          </div>
        </section>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute end-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersPanel}
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ChipGroup({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(active ? "" : o.value)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input accent-primary"
      />
      {label}
    </label>
  );
}
