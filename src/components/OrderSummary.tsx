import { formatPrice } from "@/lib/format";

interface Props {
  subtotal: number;
  delivery: number;
  children?: React.ReactNode;
}

export function OrderSummary({ subtotal, delivery, children }: Props) {
  const total = subtotal + delivery;
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-xl font-semibold">Order Summary</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Delivery" value={delivery === 0 ? "Free" : formatPrice(delivery)} />
        <div className="my-2 border-t border-border" />
        <Row label="Total" value={formatPrice(total)} bold />
      </dl>
      {delivery === 0 && subtotal > 0 && (
        <p className="mt-3 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          🌿 You unlocked free delivery!
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
