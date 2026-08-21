import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  add: (
    product: Product,
    quantity?: number,
    selection?: {
      combinationId: string;
      name: string;
      image: string;
      unitPrice: number;
    },
  ) => void;
  remove: (itemKey: string) => void;
  updateQty: (itemKey: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "verdura.cart";
const isCart = (value: unknown): value is CartItem[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "product" in item &&
      typeof item.product === "object" &&
      item.product !== null &&
      "id" in item.product &&
      typeof item.product.id === "string" &&
      "price" in item.product &&
      typeof item.product.price === "number" &&
      "quantity" in item &&
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0,
  );
// Egyptian Pound thresholds
const DELIVERY_FEE_FREE_THRESHOLD = 2000;
export const DELIVERY_FEE = 50;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>(STORAGE_KEY, [], isCart);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((s, i) => s + (i.unitPrice ?? i.product.price) * i.quantity, 0);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    return {
      items,
      subtotal,
      itemCount,
      add: (product, quantity = 1, selection) =>
        setItems((prev) => {
          const key = selection ? `${product.id}:${selection.combinationId}` : product.id;
          const existing = prev.find((i) => (i.key ?? i.product.id) === key);
          if (existing) {
            return prev.map((i) =>
              (i.key ?? i.product.id) === key ? { ...i, quantity: i.quantity + quantity } : i,
            );
          }
          return [
            ...prev,
            {
              product,
              quantity,
              key,
              combinationId: selection?.combinationId,
              selectedName: selection?.name,
              selectedImage: selection?.image,
              unitPrice: selection?.unitPrice,
            },
          ];
        }),
      remove: (itemKey) =>
        setItems((prev) => prev.filter((i) => (i.key ?? i.product.id) !== itemKey)),
      updateQty: (itemKey, quantity) =>
        setItems((prev) =>
          prev
            .map((i) =>
              (i.key ?? i.product.id) === itemKey ? { ...i, quantity: Math.max(1, quantity) } : i,
            )
            .filter((i) => i.quantity > 0),
        ),
      clear: () => setItems([]),
    };
  }, [items, setItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function deliveryFor(subtotal: number) {
  return subtotal === 0 || subtotal >= DELIVERY_FEE_FREE_THRESHOLD ? 0 : DELIVERY_FEE;
}
