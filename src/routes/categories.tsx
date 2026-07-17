import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/api";
import { CategoryCard } from "@/components/CategoryCard";
import { facets } from "@/data/mockData";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { getCategoryText, localizeLabel } from "@/lib/localizeData";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Shop by Category — Verdura" },
      {
        name: "description",
        content:
          "Browse plants, pots, tools, soil, fertilizers, gift kits, and more — everything for the modern plant lover.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const roots = cats.filter((c) => !c.parentId);
  const t = useT();
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t("categories.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("categories.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("categories.subtitle")}</p>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">{t("categories.main")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roots.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-2 font-display text-2xl font-semibold">{t("categories.browse")}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t("categories.browseText")}</p>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["room", t("categories.room")],
              ["light", t("categories.light")],
              ["water", t("categories.water")],
              ["difficulty", t("categories.difficulty")],
              ["benefit", t("categories.benefit")],
              ["occasion", t("categories.occasion")],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-3xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-lg font-semibold">{label}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {facets[key].map((f) => (
                  <Link
                    key={f.value}
                    to="/browse/$facet/$value"
                    params={{ facet: key, value: f.value }}
                    className="rounded-full border border-border px-3 py-1 text-sm transition hover:border-primary hover:text-primary"
                  >
                    {localizeLabel(f.label, lang)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 font-display text-2xl font-semibold">{t("categories.all")}</h2>
        <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {roots.map((root) => {
            const branches = cats.filter((c) => c.parentId === root.id);
            return (
              <div key={root.id}>
                <Link
                  to="/c/$"
                  params={{ _splat: root.slug }}
                  className="font-display text-base font-semibold uppercase tracking-wide text-foreground hover:text-primary"
                >
                  {getCategoryText(root, lang).name}
                </Link>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {branches.map((b) => (
                    <li key={b.id}>
                      <Link
                        to="/c/$"
                        params={{ _splat: b.slug }}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {getCategoryText(b, lang).name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
