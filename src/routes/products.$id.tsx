import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Droplets,
  Sun,
  Thermometer,
  Sprout,
  ArrowLeft,
  Star,
  Share2,
  Truck,
  RotateCcw,
  GitCompareArrows,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { getProductById, getRelatedProducts, getReviews, getProductsByIds } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { ProductCard } from "@/components/ProductCard";
import { usePrice } from "@/lib/usePrice";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailPage,
  head: () => ({ meta: [{ title: "Product Details — Verdura" }] }),
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
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviews(id),
  });

  const { add } = useCart();
  const { toggle: toggleWish, has: hasWish } = useWishlist();
  const { toggle: toggleCmp, has: hasCmp } = useCompare();
  const { add: addRecent, ids: recentIds } = useRecentlyViewed();
  const price = usePrice();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"specs" | "care" | "delivery" | "faq" | "reviews">("specs");

  useEffect(() => {
    if (product) addRecent(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const recentOthers = recentIds.filter((i) => i !== id).slice(0, 4);
  const { data: recentProducts = [] } = useQuery({
    queryKey: ["recent", recentOthers.join(",")],
    queryFn: () => getProductsByIds(recentOthers),
    enabled: recentOthers.length > 0,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-[500px] animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }
  if (!product) throw notFound();

  const wished = hasWish(product.id);
  const compared = hasCmp(product.id);
  const gallery = product.gallery ?? [product.image];

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
            <img
              src={gallery[activeImg]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-xl border-2 transition ${
                    activeImg === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">{product.categoryName}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          {product.sku && <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-clay text-clay" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">· {product.reviewsCount} reviews</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                product.stock > 0
                  ? "bg-accent text-accent-foreground"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {product.stock > 0 ? `In stock · ${product.stock} left` : "Out of stock"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-primary">
              {price(product.price)}
            </span>
            {product.oldPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {price(product.oldPrice)}
                </span>
                <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-semibold text-clay">
                  Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CareTile
              icon={<Droplets className="h-4 w-4" />}
              label="Water"
              value={product.care.water}
            />
            <CareTile
              icon={<Sun className="h-4 w-4" />}
              label="Light"
              value={product.care.sunlight}
            />
            <CareTile
              icon={<Thermometer className="h-4 w-4" />}
              label="Temp"
              value={product.care.temperature}
            />
            <CareTile
              icon={<Sprout className="h-4 w-4" />}
              label="Level"
              value={product.care.difficulty}
            />
          </div>

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
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                toggleWish(product.id);
                toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className="grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-foreground/70 hover:text-clay"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-clay text-clay" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                toggleCmp(product.id);
                toast.success(compared ? "Removed from compare" : "Added to compare");
              }}
              className={`grid h-12 w-12 place-items-center rounded-full border border-border bg-background hover:text-primary ${
                compared ? "text-primary" : "text-foreground/70"
              }`}
              aria-label="Compare"
            >
              <GitCompareArrows className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={share}
              className="grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-foreground/70 hover:text-primary"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Trust bar */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-sm">
              <Truck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Free delivery over 2,000 EGP</p>
                <p className="text-xs text-muted-foreground">Arrives in 2–5 business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-sm">
              <RotateCcw className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">30-day plant guarantee</p>
                <p className="text-xs text-muted-foreground">
                  Healthy on arrival, or we replace it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-16">
        <div className="flex flex-wrap gap-1 border-b border-border">
          {(["specs", "care", "delivery", "faq", "reviews"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "faq" ? "FAQ" : t}
              {t === "reviews" && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "specs" && (
            <dl className="grid gap-3 sm:grid-cols-2">
              <SpecRow label="SKU" value={product.sku ?? "—"} />
              <SpecRow label="Category" value={product.categoryName} />
              <SpecRow label="Plant height" value={product.specs?.plantHeight ?? "—"} />
              <SpecRow label="Pot size" value={product.specs?.potSize ?? "—"} />
              <SpecRow label="Humidity" value={product.specs?.humidity ?? "—"} />
              <SpecRow label="Temperature" value={product.specs?.temperature ?? "—"} />
              <SpecRow label="Growth rate" value={product.specs?.growthRate ?? "—"} />
              <SpecRow label="Pet safe" value={product.petSafe ? "Yes" : "No"} />
              <SpecRow label="Air purifying" value={product.airPurifying ? "Yes" : "No"} />
              <SpecRow label="Indoor/Outdoor" value={product.indoorOutdoor ?? "—"} />
            </dl>
          )}
          {tab === "care" && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                {product.careInstructions ??
                  "Follow the care summary above. Rotate weekly, wipe leaves monthly, and repot when roots outgrow the pot."}
              </p>
            </div>
          )}
          {tab === "delivery" && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Delivery:</strong> {product.deliveryInfo}
              </p>
              <p>
                <strong className="text-foreground">Returns:</strong> {product.returnPolicy}
              </p>
            </div>
          )}
          {tab === "faq" && (
            <div className="space-y-3">
              {(product.faq ?? []).map((f, i) => (
                <details key={i} className="group rounded-2xl border border-border/60 bg-card p-4">
                  <summary className="flex cursor-pointer items-center justify-between font-medium">
                    {f.q}
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {r.userName}{" "}
                        {r.verified && (
                          <span className="ms-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                            Verified
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < r.rating ? "fill-clay text-clay" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            You may also love
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Recently viewed
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((p) => (
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
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1.5 font-medium">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-xl border border-border/40 bg-card px-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
