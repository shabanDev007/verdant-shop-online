import { useState } from "react";
import { usePrice } from "@/lib/usePrice";
import { useT } from "@/i18n/LanguageContext";
import { useCoupon } from "@/context/CouponContext";
import { validateCoupon } from "@/services/api";
import { toast } from "sonner";
import { Tag, X } from "lucide-react";

interface Props {
  subtotal: number;
  delivery: number;
  showCoupon?: boolean;
  children?: React.ReactNode;
}

export function OrderSummary({ subtotal, delivery, showCoupon = true, children }: Props) {
  const t = useT();
  const price = usePrice();
  const { applied, discount, apply, clear } = useCoupon();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);

  const effectiveDiscount = applied ? Math.min(discount, subtotal) : 0;
  const total = Math.max(0, subtotal - effectiveDiscount) + delivery;

  const handleApply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const res = await validateCoupon(code, subtotal);
      apply(res.coupon, res.discount + res.deliveryDiscount);
      toast.success(t("summary.couponApplied", { code: res.coupon.code }));
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("summary.couponInvalid"));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-xl font-semibold">{t("summary.title")}</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label={t("summary.subtotal")} value={price(subtotal)} />
        {applied && (
          <div className="flex items-center justify-between text-sm text-primary">
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> {applied.code}
              <button
                type="button"
                onClick={clear}
                aria-label="Remove coupon"
                className="ms-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
            <span>−{price(effectiveDiscount)}</span>
          </div>
        )}
        <Row
          label={t("summary.delivery")}
          value={delivery === 0 ? t("summary.free") : price(delivery)}
        />
        <div className="my-2 border-t border-border" />
        <Row label={t("summary.total")} value={price(total)} bold />
      </dl>

      {showCoupon && !applied && subtotal > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder={t("summary.couponPlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full rounded-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={checking}
            className="rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {checking ? t("summary.checking") : t("summary.apply")}
          </button>
        </div>
      )}

      {delivery === 0 && subtotal > 0 && (
        <p className="mt-3 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          {t("summary.freeUnlocked")}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between ${bold ? "text-base font-semibold text-foreground" : "text-muted-foreground"}`}
    >
      <dt>{label}</dt>
      <dd className={bold ? "text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
