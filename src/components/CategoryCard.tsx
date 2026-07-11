import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeDescription, localizeLabel } from "@/lib/localizeData";

export function CategoryCard({ category }: { category: Category }) {
  const { lang } = useLanguage();
  const name = localizeLabel(category.name, lang);
  const description = localizeDescription(category.description, lang, name);
  return (
    <Link
      to="/c/$"
      params={{ _splat: category.slug }}
      className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={category.image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-background">
          <div>
            <h3 className="font-display text-xl font-semibold">{name}</h3>
            <p className="mt-1 text-xs text-background/80">{description}</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background text-primary transition group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
