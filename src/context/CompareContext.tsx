import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "verdura.compare";
const MAX = 4;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = usePersistentState<string[]>(STORAGE_KEY, [], isStringArray);

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
