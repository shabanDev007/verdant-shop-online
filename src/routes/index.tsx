import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Truck,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  Quote,
  Sparkles,
} from "lucide-react";
import heroImage from "@/assets/hero-plants.jpg";
import { getCategories, getFeaturedProducts } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { useT } from "@/i18n/LanguageContext";
import { usePrice } from "@/lib/usePrice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdura — Premium Plants Delivered to Your Door" },
      {
        name: "description",
        content:
          "Shop curated indoor, outdoor, succulents, and flowering plants. Healthy plants, fast delivery across Egypt, and lifetime care support.",
      },
      { property: "og:title", content: "Verdura — Premium Plants Delivered" },
      { property: "og:description", content: "Greener homes, happier humans." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const t = useT();
  const price = usePrice();
  const { data: featured = [] } = useQuery({
    queryKey: ["featured"],
    queryFn: () => getFeaturedProducts(),
  });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8 lg:py-28">
          <div className="motion-safe:animate-[reveal-up_650ms_ease-out_both]">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/70 px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {t("home.hero.title1")} <span className="text-primary">{t("home.hero.title2")}</span>{" "}
              {t("home.hero.title3")}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {t("home.hero.cta1")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-background"
              >
                {t("home.hero.cta2")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span>{t("home.hero.stat1")}</span>
              <span>{t("home.hero.stat2")}</span>
              <span>{t("home.hero.stat3")}</span>
            </div>
          </div>
          <div className="relative motion-safe:animate-[reveal-up_750ms_120ms_ease-out_both]">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-[var(--shadow-soft)]">
              <img
                src={heroImage}
                alt="Lush monstera plant in soft natural light"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition duration-700 motion-safe:hover:scale-[1.025]"
              />
            </div>
            {featured[0] && (
              <div className="absolute -bottom-6 -start-6 hidden rounded-2xl border border-border/60 bg-background/90 p-4 shadow-[var(--shadow-card)] backdrop-blur sm:block">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("home.hero.bestseller")}
                </p>
                <p className="font-display text-lg font-semibold">{featured[0].name}</p>
                <p className="text-sm text-primary">{price(featured[0].price)}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.cats.eyebrow")}
          title={t("home.cats.title")}
          subtitle={t("home.cats.subtitle")}
          actionTo="/categories"
          actionLabel={t("home.cats.action")}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cats.slice(0, 6).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t("home.featured.eyebrow")}
            title={t("home.featured.title")}
            subtitle={t("home.featured.subtitle")}
            actionTo="/products"
            actionLabel={t("home.featured.action")}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: t("home.benefit1.title"), text: t("home.benefit1.text") },
            { icon: Leaf, title: t("home.benefit2.title"), text: t("home.benefit2.text") },
            {
              icon: HeartHandshake,
              title: t("home.benefit3.title"),
              text: t("home.benefit3.text"),
            },
            { icon: ShieldCheck, title: t("home.benefit4.title"), text: t("home.benefit4.text") },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-border/60 bg-card p-6 transition hover:shadow-[var(--shadow-card)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              {t("home.testimonials.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {t("home.testimonials.title")}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "My monstera arrived flawless. The packaging was unreal — it felt like unboxing a gift.",
                name: "Amelia R.",
              },
              {
                quote:
                  "Their care team replied to my fiddle leaf questions within hours. Real humans who care.",
                name: "Daniel S.",
              },
              {
                quote:
                  "Three orders in. Every plant has thrived. Verdura is now my only plant shop.",
                name: "Priya M.",
              },
            ].map((tt) => (
              <figure
                key={tt.name}
                className="rounded-3xl bg-primary-foreground/10 p-6 backdrop-blur"
              >
                <Quote className="h-6 w-6 text-primary-foreground/60" />
                <blockquote className="mt-4 text-base leading-relaxed">"{tt.quote}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{tt.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("home.cta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("home.cta.subtitle")}</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {t("home.cta.button")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionTo,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionTo: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        to={actionTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
      >
        {actionLabel} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}
