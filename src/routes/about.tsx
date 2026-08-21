import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Sprout, HeartHandshake } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Jothour | جذور" },
      {
        name: "description",
        content:
          "Jothour is a family-run plant shop with a 30-day plant promise and a passion for healthy greenery.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  const values = [
    { icon: Sprout, title: t("about.hand.title"), text: t("about.hand.text") },
    { icon: ShieldCheck, title: t("about.promise.title"), text: t("about.promise.text") },
    { icon: HeartHandshake, title: t("about.support.title"), text: t("about.support.text") },
    { icon: Leaf, title: t("about.eco.title"), text: t("about.eco.text") },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t("about.eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          {t("about.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">{t("about.intro")}</p>
      </header>

      <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl border border-border/60 bg-card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-3xl border border-border/60 bg-secondary/40 p-8 sm:p-12">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          {t("about.care.title")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("about.care.text")}</p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("about.action")}
          </Link>
        </div>
      </section>
    </div>
  );
}
