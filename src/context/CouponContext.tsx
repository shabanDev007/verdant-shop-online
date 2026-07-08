import { createContext, useContext, useState, type ReactNode } from "react";
import type { Coupon } from "@/types";

interface CouponContextValue {
  applied: Coupon | null;
  discount: number;
  apply: (coupon: Coupon, discount: number) => void;
  clear: () => void;
}

const Ctx = createContext<CouponContextValue | null>(null);

export function CouponProvider({ children }: { children: ReactNode }) {
  const [applied, setApplied] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  return (
    <Ctx.Provider
      value={{
        applied,
        discount,
        apply: (c, d) => {
          setApplied(c);
          setDiscount(d);
        },
        clear: () => {
          setApplied(null);
          setDiscount(0);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCoupon() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCoupon must be used within CouponProvider");
  return ctx;
}
