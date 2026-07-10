import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Verdura" },
      {
        name: "description",
        content: "Get in touch with the Verdura plant team. Email, phone, WhatsApp, or visit us.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    // BACKEND: POST /api/contact { name, email, message }
    toast.success("Thanks! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Get in touch</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          We'd love to hear from you.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a plant, an order, or just want to share a photo? Our team is here.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Info
            icon={<Mail className="h-5 w-5" />}
            title="Email us"
            lines={["hello@verdura.shop", "support@verdura.shop"]}
          />
          <Info
            icon={<Phone className="h-5 w-5" />}
            title="Call us"
            lines={["+1 (555) 010-9090", "Mon–Sat · 9am–6pm"]}
          />
          <a
            href="https://wa.me/15550109090"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-3xl border border-border/60 bg-leaf/15 p-5 transition hover:bg-leaf/25"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Chat on WhatsApp</p>
              <p className="text-sm text-muted-foreground">Fastest way to reach us</p>
            </div>
          </a>
          <Info
            icon={<MapPin className="h-5 w-5" />}
            title="Visit us"
            lines={["88 Greenhouse Lane", "Portland, OR 97204"]}
          />

          <div className="overflow-hidden rounded-3xl border border-border/60">
            <div className="grid h-56 place-items-center bg-gradient-to-br from-accent to-secondary text-sm text-muted-foreground">
              🗺️ Google Maps placeholder
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
          <Field label="Name" error={errors.name}>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Message" error={errors.message}>
            <textarea
              rows={6}
              className={`${inputCls} resize-none`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Field>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Info({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {lines.map((l) => (
          <p key={l} className="text-sm text-muted-foreground">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
