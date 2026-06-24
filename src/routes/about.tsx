import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Sprout, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Verdura" },
      { name: "description", content: "Verdura is a family-run plant shop with a 30-day plant promise and a passion for healthy greenery." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our story</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Plants, with people in mind.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
          Verdura started in a tiny greenhouse, with one obsession: helping people fall in love with
          plants — and keep them alive. Today, we deliver across the country with the same care.
        </p>
      </header>

      <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Sprout, title: "Hand-grown", text: "Every plant is raised by our nursery team." },
          { icon: ShieldCheck, title: "30-day promise", text: "Free replacement if your plant doesn't thrive." },
          { icon: HeartHandshake, title: "Real support", text: "Talk to a plant expert any day of the week." },
          { icon: Leaf, title: "Eco packaging", text: "100% recyclable boxes and biodegradable padding." },
        ].map(({ icon: Icon, title, text }) => (
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
        <h2 className="font-display text-3xl font-semibold tracking-tight">Our Plant Care Promise</h2>
        <p className="mt-4 text-muted-foreground">
          We believe a plant should arrive looking even better than the photo. If it doesn't —
          or if it doesn't survive the first 30 days — we'll replace it. No questions, no fuss.
          That's our promise to every plant parent who chooses Verdura.
        </p>
        <div className="mt-6">
          <Link to="/products" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Shop with confidence
          </Link>
        </div>
      </section>
    </div>
  );
}
