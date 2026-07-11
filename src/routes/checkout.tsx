import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart, deliveryFor } from "@/context/CartContext";
import { OrderSummary } from "@/components/OrderSummary";
import { createOrder } from "@/services/api";
import { usePrice } from "@/lib/usePrice";
import { useT } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Verdura" }] }),
  component: CheckoutPage,
});

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Please enter your phone number").max(30),
  address: z.string().trim().min(5, "Please enter your address").max(200),
  city: z.string().trim().min(2, "Please enter your city").max(100),
  notes: z.string().max(500).optional(),
});

type FormState = z.infer<typeof customerSchema>;
type Errors = Partial<Record<keyof FormState, string>>;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const delivery = deliveryFor(subtotal);
  const price = usePrice();
  const t = useT();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && !orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">{t("checkout.empty.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("checkout.empty.subtitle")}</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("checkout.empty.action")}
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
          {t("checkout.success.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("checkout.success.body", { id: orderId })}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            {t("checkout.success.backHome")}
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t("checkout.success.keepShopping")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(t("checkout.toast.fix"));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const order = await createOrder({
        customer: {
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
        },
        items,
        notes: parsed.data.notes,
        paymentMethod: "cod",
        subtotal,
        deliveryFee: delivery,
        total: subtotal + delivery,
      });
      clear();
      setOrderId(order.id ?? "ORD-NEW");
      toast.success(t("checkout.toast.success"));
    } catch {
      toast.error(t("checkout.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const update =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("checkout.title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("checkout.subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <Section title={t("checkout.section.customer")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("checkout.field.fullName")} error={errors.fullName}>
                <input className={inputCls} value={form.fullName} onChange={update("fullName")} />
              </Field>
              <Field label={t("checkout.field.email")} error={errors.email}>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={update("email")}
                />
              </Field>
              <Field label={t("checkout.field.phone")} error={errors.phone}>
                <input className={inputCls} value={form.phone} onChange={update("phone")} />
              </Field>
              <Field label={t("checkout.field.city")} error={errors.city}>
                <input className={inputCls} value={form.city} onChange={update("city")} />
              </Field>
              <Field
                label={t("checkout.field.address")}
                error={errors.address}
                className="sm:col-span-2"
              >
                <input className={inputCls} value={form.address} onChange={update("address")} />
              </Field>
            </div>
          </Section>

          <Section title={t("checkout.section.notes")}>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder={t("checkout.notes.placeholder")}
              value={form.notes}
              onChange={update("notes")}
            />
          </Section>

          <Section title={t("checkout.section.payment")}>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-primary bg-accent/30 p-4">
              <input type="radio" name="payment" checked readOnly className="mt-1 accent-primary" />
              <div>
                <p className="font-semibold">{t("checkout.cod.title")}</p>
                <p className="text-sm text-muted-foreground">{t("checkout.cod.subtitle")}</p>
              </div>
            </label>
          </Section>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold">
              {t("checkout.items", { count: items.length })}
            </h3>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={it.product.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={it.product.image}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{it.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("checkout.quantity", { count: it.quantity })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {price(it.product.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <OrderSummary subtotal={subtotal} delivery={delivery}>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t("checkout.placing") : t("checkout.placeOrder")}
            </button>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
