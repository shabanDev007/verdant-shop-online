import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/services/api";
import { popularSearches } from "@/data/reviewsCoupons";

const RECENT_KEY = "verdura.recentSearches";
const MAX_RECENT = 6;

export function SearchDropdown({ onClose }: { onClose?: () => void }) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const suggestions = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return { products: [], categories: [] };
    return {
      products: products
        .filter((p) => p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query))
        .slice(0, 6),
      categories: categories
        .filter((c) => c.name.toLowerCase().includes(query))
        .slice(0, 4),
    };
  }, [q, products, categories]);

  const commit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    navigate({ to: "/products", search: { q: t } });
    onClose?.();
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search plants, pots, tools..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(q);
            if (e.key === "Escape") onClose?.();
          }}
          className="w-full rounded-full border border-input bg-background py-3 ps-10 pe-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {onClose && (
          <button
            type="button" onClick={onClose} aria-label="Close"
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {q.trim() === "" ? (
          <div className="space-y-4">
            {recent.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Recent
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRecent([]);
                      try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => commit(r)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Popular
              </p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {popularSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => commit(s)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.categories.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/products"
                      search={{ category: c.id }}
                      onClick={() => onClose?.()}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {suggestions.products.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Products</p>
                <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card">
                  {suggestions.products.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/products/$id"
                        params={{ id: p.id }}
                        onClick={() => onClose?.()}
                        className="flex items-center gap-3 p-2.5 hover:bg-accent/40"
                      >
                        <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.categoryName}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{p.price} EGP</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.products.length === 0 && suggestions.categories.length === 0 && (
              <p className="px-1 text-sm text-muted-foreground">No matches for "{q}". Press Enter to search anyway.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
