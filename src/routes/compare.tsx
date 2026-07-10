import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X, Check, GitCompareArrows, ShoppingBag } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { getProductsByIds } from "@/services/api";
import { usePrice } from "@/lib/usePrice";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Products — Verdura" },
      { name: "description", content: "Compare specs, care needs, and prices side-by-side." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const price = usePrice();
  const { add } = useCart();
  const { data: products = [] } = useQuery({
    queryKey: ["compare", ids],
    queryFn: () => getProductsByIds(ids),
    enabled: ids.length > 0,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Side-by-side
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Compare
          </h1>
          <p className="mt-2 text-muted-foreground">
            {ids.length}/4 items · pick the best fit for your space.
          </p>
        </div>
        {ids.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Clear all
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
            <GitCompareArrows className="h-7 w-7" />
          </div>
          <p className="mt-5 font-display text-2xl font-semibold">Nothing to compare yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add up to 4 products from any product page.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-40 text-left" />
                {products.map((p) => (
                  <th key={p.id} className="p-4 align-top">
                    <div className="flex flex-col items-start gap-3">
                      <div className="relative w-full">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="aspect-square w-full rounded-2xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => toggle(p.id)}
                          aria-label="Remove"
                          className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Link
                        to="/products/$id"
                        params={{ id: p.id }}
                        className="font-display text-base font-semibold hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          add(p);
                          toast.success(`${p.name} added to cart`);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Price" values={products.map((p) => price(p.price))} />
              <Row
                label="Rating"
                values={products.map((p) => `${p.rating.toFixed(1)} ★ (${p.reviewsCount})`)}
              />
              <Row
                label="Stock"
                values={products.map((p) => (p.stock > 0 ? `${p.stock} in stock` : "Out of stock"))}
              />
              <Row label="Category" values={products.map((p) => p.categoryName)} />
              <Row label="Light" values={products.map((p) => p.care?.sunlight ?? "—")} />
              <Row label="Water" values={products.map((p) => p.care?.water ?? "—")} />
              <Row label="Difficulty" values={products.map((p) => p.care?.difficulty ?? "—")} />
              <Row label="Height" values={products.map((p) => p.specs?.plantHeight ?? "—")} />
              <Row label="Pot size" values={products.map((p) => p.specs?.potSize ?? "—")} />
              <BoolRow label="Pet Safe" values={products.map((p) => !!p.petSafe)} />
              <BoolRow label="Air Purifying" values={products.map((p) => !!p.airPurifying)} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="border-t border-border/60 p-3 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="border-t border-border/60 p-3 text-sm">
          {v}
        </td>
      ))}
    </tr>
  );
}

function BoolRow({ label, values }: { label: string; values: boolean[] }) {
  return (
    <tr>
      <td className="border-t border-border/60 p-3 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="border-t border-border/60 p-3">
          {v ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground/50" />
          )}
        </td>
      ))}
    </tr>
  );
}
