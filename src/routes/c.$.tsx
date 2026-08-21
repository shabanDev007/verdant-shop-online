import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { filterProductsByCategory, getCategories } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import type { Category } from "@/types";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { getCategoryText } from "@/lib/localizeData";

export const Route = createFileRoute("/c/$")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${(params._splat ?? "").split("/").pop()?.replace(/-/g, " ") || "Category"} — Jothour | جذور`,
      },
      {
        name: "description",
        content: "Shop premium plants, pots, tools, and gardening essentials at Jothour.",
      },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Category not found</h1>
      <Link to="/categories" className="mt-4 inline-block text-primary underline">
        Browse all categories
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
    </div>
  ),
});

function CategoryPage() {
  const t = useT();
  const { lang } = useLanguage();
  const { _splat } = Route.useParams();
  const slug = (_splat ?? "").replace(/\/$/, "");
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const category = cats.find((c) => c.slug === slug);

  if (cats.length > 0 && !category) throw notFound();

  const { data: products = [] } = useQuery({
    queryKey: ["products-by-category", category?.id ?? ""],
    queryFn: () => filterProductsByCategory(category?.id ?? ""),
    enabled: !!category,
  });

  const children = cats.filter((c) => c.parentId === category?.id);
  const breadcrumb: Category[] = [];
  let cursor: Category | undefined = category;
  while (cursor) {
    breadcrumb.unshift(cursor);
    cursor = cats.find((c) => c.id === cursor?.parentId);
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          {t("nav.home")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/categories" className="hover:text-primary">
          {t("nav.categories")}
        </Link>
        {breadcrumb.map((c) => (
          <span key={c.id} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3" />
            <Link to="/c/$" params={{ _splat: c.slug }} className="hover:text-primary">
              {getCategoryText(c, lang).name}
            </Link>
          </span>
        ))}
      </nav>

      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Category</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {getCategoryText(category, lang).name}
        </h1>
        <p className="mt-3 text-muted-foreground">{getCategoryText(category, lang).description}</p>
      </header>

      {children.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl font-semibold">{t("categories.all")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">
            {products.length} product{products.length === 1 ? "" : "s"}
          </h2>
        </div>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No products in this category yet — check back soon.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
