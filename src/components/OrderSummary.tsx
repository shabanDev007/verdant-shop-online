import { usePrice } from "@/lib/usePrice";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  subtotal: number;
  delivery: number;
  children?: React.ReactNode;
}

export function OrderSummary({ subtotal, delivery, children }: Props) {
  const t = useT();
  const price = usePrice();
  const total = subtotal + delivery;
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-xl font-semibold">{t("summary.title")}</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label={t("summary.subtotal")} value={price(subtotal)} />
        <Row label={t("summary.delivery")} value={delivery === 0 ? t("summary.free") : price(delivery)} />
        <div className="my-2 border-t border-border" />
        <Row label={t("summary.total")} value={price(total)} bold />
      </dl>
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
    <div className={`flex justify-between ${bold ? "text-base font-semibold text-foreground" : "text-muted-foreground"}`}>
      <dt>{label}</dt>
      <dd className={bold ? "text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
