import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getProductsByFacet } from "@/services/api";
import { facets, type FacetKey } from "@/data/mockData";
import { ProductCard } from "@/components/ProductCard";

const isFacetKey = (v: string): v is FacetKey =>
  ["room", "light", "water", "difficulty", "benefit", "occasion"].includes(v);

export const Route = createFileRoute("/browse/$facet/$value")({
  head: ({ params }) => ({
    meta: [
      { title: `Browse by ${params.facet}: ${params.value} — Verdura` },
      {
        name: "description",
        content: `Plants and products filtered by ${params.facet}: ${params.value}.`,
      },
    ],
  }),
  component: BrowsePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary underline">
        Browse all products
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
    </div>
  ),
});

function BrowsePage() {
  const { facet, value } = Route.useParams();
  if (!isFacetKey(facet)) throw notFound();
  const facetMeta = facets[facet];
  const valueMeta = facetMeta.find((f) => f.value === value);
  if (!valueMeta) throw notFound();

  const { data: products = [] } = useQuery({
    queryKey: ["facet", facet, value],
    queryFn: () => getProductsByFacet(facet, value),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize">{facet}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{valueMeta.label}</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary capitalize">
          Browse by {facet}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {valueMeta.label}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} matched this filter.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {facetMeta.map((f) => (
          <Link
            key={f.value}
            to="/browse/$facet/$value"
            params={{ facet, value: f.value }}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              f.value === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No products match this filter yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
