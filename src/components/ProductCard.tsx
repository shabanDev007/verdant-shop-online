import { Link } from "@tanstack/react-router";
import { GitCompareArrows, Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { usePrice } from "@/lib/usePrice";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { localizeLabel } from "@/lib/localizeData";

const badgeStyles: Record<string, string> = {
  new: "bg-leaf text-primary-foreground",
  "best-seller": "bg-clay text-primary-foreground",
  "low-stock": "bg-destructive text-destructive-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const t = useT();
  const { lang } = useLanguage();
  const productName = localizeLabel(product.name, lang);
  const categoryName = localizeLabel(product.categoryName, lang);
  const price = usePrice();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { ids: compareIds, toggle: toggleCompare, has: isCompared } = useCompare();
  const wished = has(product.id);
  const compared = isCompared(product.id);

  const badgeLabels: Record<string, string> = {
    new: t("product.badge.new"),
    "best-seller": t("product.badge.bestSeller"),
    "low-stock": t("product.badge.lowStock"),
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:shadow-[var(--shadow-card)]">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badges.length > 0 && (
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <span
                key={b}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[b]}`}
              >
                {badgeLabels[b]}
              </span>
            ))}
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={() => {
          toggle(product.id);
          toast.success(wished ? t("product.removedFromWishlist") : t("product.addedToWishlist"));
        }}
        aria-label={t("nav.wishlist")}
        className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition hover:text-clay"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-clay text-clay" : ""}`} />
      </button>

      <button
        type="button"
        onClick={() => {
          if (!compared && compareIds.length >= 4) {
            toast.error(t("product.compareLimit"));
            return;
          }
          toggleCompare(product.id);
          toast.success(compared ? t("product.removedFromCompare") : t("product.addedToCompare"));
        }}
        aria-label={t("nav.compare")}
        title={t("nav.compare")}
        className={`absolute end-3 top-14 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-sm transition hover:text-primary ${
          compared ? "text-primary ring-2 ring-primary" : "text-foreground/70"
        }`}
      >
        <GitCompareArrows className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{categoryName}</p>
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="font-display text-lg font-semibold leading-tight hover:text-primary"
        >
          {productName}
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-clay text-clay" />
          {product.rating.toFixed(1)} · {product.reviewsCount} {t("product.reviews")}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-primary">{price(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {price(product.oldPrice)}
              </span>
            )}
            <span
              className={`text-[11px] font-medium ${product.stock > 0 ? "text-moss" : "text-destructive"}`}
            >
              {product.stock > 0
                ? `${t("product.inStock")} · ${product.stock}`
                : t("product.outOfStock")}
            </span>
          </div>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => {
              add(product);
              toast.success(t("product.addedToCart", { name: productName }));
            }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40"
            aria-label={t("product.addToCart")}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
