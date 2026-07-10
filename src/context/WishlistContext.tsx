import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

interface WishlistContextValue {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "verdura.wishlist";
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = usePersistentState<string[]>(STORAGE_KEY, [], isStringArray);

  return (
    <WishlistContext.Provider
      value={{
        ids,
        toggle: (id) =>
          setIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])),
        has: (id) => ids.includes(id),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
