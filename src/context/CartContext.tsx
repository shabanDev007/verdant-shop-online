import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "verdura.cart";
// Egyptian Pound thresholds
const DELIVERY_FEE_FREE_THRESHOLD = 2000;
export const DELIVERY_FEE = 50;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    return {
      items,
      subtotal,
      itemCount,
      add: (product, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
            );
          }
          return [...prev, { product, quantity }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId)),
      updateQty: (productId, quantity) =>
        setItems((prev) =>
          prev
            .map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

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
