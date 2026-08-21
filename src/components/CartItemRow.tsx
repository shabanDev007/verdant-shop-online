import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { usePrice } from "@/lib/usePrice";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQty, remove } = useCart();
  const price = usePrice();
  const { product, quantity } = item;
  const itemKey = item.key ?? product.id;
  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-4 rounded-2xl border border-border/60 bg-card p-3 sm:grid-cols-[100px_1fr_auto_auto] sm:p-4">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="overflow-hidden rounded-xl bg-muted"
      >
        <img
          src={item.selectedImage ?? product.image}
          alt={item.selectedName ?? product.name}
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.categoryName}
        </p>
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="block truncate font-display text-base font-semibold hover:text-primary sm:text-lg"
        >
          {item.selectedName ?? product.name}
        </Link>
        <p className="mt-1 text-sm font-medium text-primary">
          {price(item.unitPrice ?? product.price)}
        </p>
      </div>
      <div className="col-start-3 row-start-1 flex items-center gap-1 self-center rounded-full border border-border bg-background p-1 sm:col-auto sm:row-auto">
        <button
          type="button"
          aria-label="Decrease"
          className="grid h-7 w-7 place-items-center rounded-full text-foreground/70 hover:bg-accent"
          onClick={() => updateQty(itemKey, quantity - 1)}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label="Increase"
          className="grid h-7 w-7 place-items-center rounded-full text-foreground/70 hover:bg-accent"
          onClick={() => updateQty(itemKey, quantity + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Remove"
        onClick={() => remove(itemKey)}
        className="col-start-3 row-start-2 self-end justify-self-end text-muted-foreground hover:text-destructive sm:col-auto sm:row-auto sm:self-center"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
