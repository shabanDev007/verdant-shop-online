import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, deliveryFor } from "@/context/CartContext";
import { CartItemRow } from "@/components/CartItemRow";
import { OrderSummary } from "@/components/OrderSummary";
import { useT } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Verdura" }] }),
  component: CartPage,
});

function CartPage() {
  const t = useT();
  const { items, subtotal } = useCart();
  const delivery = deliveryFor(subtotal);
  const subtitle =
    items.length === 0
      ? t("cart.empty")
      : items.length === 1
        ? t("cart.item")
        : t("cart.items", { count: items.length });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("cart.title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="mt-5 font-display text-2xl font-semibold">{t("cart.emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("cart.emptySubtitle")}</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("cart.browsePlants")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {items.map((it) => (
              <CartItemRow key={it.product.id} item={it} />
            ))}
          </div>
          <OrderSummary subtotal={subtotal} delivery={delivery}>
            <Link
              to="/checkout"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {t("cart.checkout")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/products"
              className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary"
            >
              {t("cart.continueShopping")}
            </Link>
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
