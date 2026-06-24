import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/api";
import { CategoryCard } from "@/components/CategoryCard";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Verdura" },
      { name: "description", content: "Browse plants by category: indoor, outdoor, succulents, flowering, office, and accessories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Plant Categories</h1>
        <p className="mt-3 text-muted-foreground">
          From sun-loving succulents to leafy office companions — find the right green friend for every space.
        </p>
      </header>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
    </div>
  );
}
