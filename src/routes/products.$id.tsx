import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Droplets, Sun, Thermometer, Sprout, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { getProductById, getRelatedProducts } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: "Plant Details — Verdura" }],
  }),
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });
  const { data: related = [] } = useQuery({
    queryKey: ["related", id],
    queryFn: () => getRelatedProducts(id),
  });
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-[500px] animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }
  if (!product) throw notFound();

  const wished = has(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-primary">{product.categoryName}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-clay text-clay" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">· {product.reviewsCount} reviews</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                product.stock > 0 ? "bg-accent text-accent-foreground" : "bg-destructive/15 text-destructive"
              }`}
            >
              {product.stock > 0 ? `In stock · ${product.stock} left` : "Out of stock"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Care */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CareTile icon={<Droplets className="h-4 w-4" />} label="Water" value={product.care.water} />
            <CareTile icon={<Sun className="h-4 w-4" />} label="Light" value={product.care.sunlight} />
            <CareTile icon={<Thermometer className="h-4 w-4" />} label="Temp" value={product.care.temperature} />
            <CareTile icon={<Sprout className="h-4 w-4" />} label="Level" value={product.care.difficulty} />
          </div>

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-accent"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                aria-label="Increase"
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => {
                add(product, qty);
                toast.success(`${product.name} added to cart`);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40 sm:flex-none"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                toggle(product.id);
                toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className="grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-foreground/70 hover:text-clay"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-clay text-clay" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">You may also love</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CareTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span></div>
      <p className="mt-1.5 font-medium">{value}</p>
    </div>
  );
}
