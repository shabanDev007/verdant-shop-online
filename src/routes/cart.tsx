import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, deliveryFor } from "@/context/CartContext";
import { CartItemRow } from "@/components/CartItemRow";
import { OrderSummary } from "@/components/OrderSummary";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Verdura" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal } = useCart();
  const delivery = deliveryFor(subtotal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your Cart</h1>
      <p className="mt-2 text-muted-foreground">{items.length === 0 ? "Empty for now." : `${items.length} item${items.length === 1 ? "" : "s"} ready to grow.`}</p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="mt-5 font-display text-2xl font-semibold">Your cart is feeling bare</p>
          <p className="mt-2 text-sm text-muted-foreground">Add a few plants and let's get growing.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse plants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {items.map((it) => <CartItemRow key={it.product.id} item={it} />)}
          </div>
          <OrderSummary subtotal={subtotal} delivery={delivery}>
            <Link
              to="/checkout"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products" className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary">
              or continue shopping
            </Link>
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
