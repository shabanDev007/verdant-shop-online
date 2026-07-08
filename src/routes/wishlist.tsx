import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { getProductsByIds } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Verdura" },
      { name: "description", content: "Save your favorite plants and accessories for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const { data: products = [] } = useQuery({
    queryKey: ["wishlist", ids],
    queryFn: () => getProductsByIds(ids),
    enabled: ids.length > 0,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Saved</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          {ids.length} item{ids.length === 1 ? "" : "s"} saved for later.
        </p>
      </header>

      {ids.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
            <Heart className="h-7 w-7" />
          </div>
          <p className="mt-5 font-display text-2xl font-semibold">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse products
          </Link>
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
