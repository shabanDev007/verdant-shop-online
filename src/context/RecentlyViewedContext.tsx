import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

interface RecentlyViewedContextValue {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "verdura.recentlyViewed";
const MAX = 8;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = usePersistentState<string[]>(STORAGE_KEY, [], isStringArray);

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
