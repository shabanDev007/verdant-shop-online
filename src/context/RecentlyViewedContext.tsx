import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface RecentlyViewedContextValue {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "verdura.recentlyViewed";
const MAX = 8;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  return (
    <Ctx.Provider
      value={{
        ids,
        add: (id) =>
          setIds((prev) => {
            const next = [id, ...prev.filter((i) => i !== id)];
            return next.slice(0, MAX);
          }),
        clear: () => setIds([]),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
