import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "verdura.compare";
const MAX = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
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
    <CompareContext.Provider
      value={{
        ids,
        toggle: (id) =>
          setIds((prev) =>
            prev.includes(id)
              ? prev.filter((i) => i !== id)
              : prev.length >= MAX
                ? prev
                : [...prev, id],
          ),
        has: (id) => ids.includes(id),
        clear: () => setIds([]),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
