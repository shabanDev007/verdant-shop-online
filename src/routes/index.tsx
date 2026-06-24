import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Leaf, HeartHandshake, ShieldCheck, Quote, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-plants.jpg";
import { getCategories, getFeaturedProducts } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdura — Premium Plants Delivered to Your Door" },
      {
        name: "description",
        content:
          "Shop curated indoor, outdoor, succulents, and flowering plants. Healthy plants, fast delivery, and lifetime care support.",
      },
      { property: "og:title", content: "Verdura — Premium Plants Delivered" },
      { property: "og:description", content: "Greener homes, happier humans." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featured = [] } = useQuery({ queryKey: ["featured"], queryFn: getFeaturedProducts });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/70 px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> New season, fresh arrivals
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Bring the <span className="text-primary">outdoors</span> in.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Hand-picked, nursery-grown plants delivered with love. Every leaf, every detail —
              curated to make your space breathe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Shop the collection
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-background"
              >
                Browse categories
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span>🌿 300+ plant varieties</span>
              <span>🚚 Free delivery over $75</span>
              <span>💚 30-day plant promise</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-[var(--shadow-soft)]">
              <img
                src={heroImage}
                alt="Lush monstera plant in soft natural light"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/60 bg-background/90 p-4 shadow-[var(--shadow-card)] backdrop-blur sm:block">
              <p className="text-xs font-medium text-muted-foreground">Bestseller</p>
              <p className="font-display text-lg font-semibold">Monstera Deliciosa</p>
              <p className="text-sm text-primary">$49.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Shop by space"
          title="Find your perfect plant"
          subtitle="From sunny patios to dim corners — there's a plant for every spot."
          actionTo="/categories"
          actionLabel="View all"
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
            eyebrow="Featured"
            title="This week's favorites"
            subtitle="Hand-picked plants our community can't stop talking about."
            actionTo="/products"
            actionLabel="Shop all"
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
            { icon: Truck, title: "Fast Delivery", text: "Door-step delivery in 24–48 hours with safe packaging." },
            { icon: Leaf, title: "Healthy Plants", text: "Nursery-fresh and quality-checked before shipping." },
            { icon: HeartHandshake, title: "Care Support", text: "Lifetime care guidance from our plant experts." },
            { icon: ShieldCheck, title: "30-Day Promise", text: "Not thriving? We'll replace it, free of charge." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border/60 bg-card p-6 transition hover:shadow-[var(--shadow-card)]">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Loved by plant parents</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Stories from our garden community.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { quote: "My monstera arrived flawless. The packaging was unreal — it felt like unboxing a gift.", name: "Amelia R.", role: "Verified buyer" },
              { quote: "Their care team replied to my fiddle leaf questions within hours. Real humans who care.", name: "Daniel S.", role: "Verified buyer" },
              { quote: "Three orders in. Every plant has thrived. Verdura is now my only plant shop.", name: "Priya M.", role: "Verified buyer" },
            ].map((t) => (
              <figure key={t.name} className="rounded-3xl bg-primary-foreground/10 p-6 backdrop-blur">
                <Quote className="h-6 w-6 text-primary-foreground/60" />
                <blockquote className="mt-4 text-base leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-primary-foreground/60"> · {t.role}</span>
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
            Ready to grow your indoor jungle?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Free delivery on orders over $75. Replace-or-refund within 30 days. Plant happy.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Start shopping <ArrowRight className="h-4 w-4" />
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
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>
      <Link
        to={actionTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
      >
        {actionLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
