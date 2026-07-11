import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { LANGUAGES, translations, type Language, type TranslationKey } from "./translations";
import { usePersistentState } from "@/hooks/usePersistentState";

interface LanguageContextValue {
  lang: Language;
  dir: "ltr" | "rtl";
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "verdura.lang";

const isLanguage = (value: unknown): value is Language => value === "en" || value === "ar";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = usePersistentState<Language>(STORAGE_KEY, "en", isLanguage);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle("rtl", dir === "rtl");
  }, [lang, dir]);

  const setLang = useCallback(
    (next: Language) => {
      setLangState(next);
    },
    [setLangState],
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = translations[lang] ?? translations.en;
      let str: string = (dict[key] ?? translations.en[key] ?? key) as string;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, setLang, t }),
    [lang, dir, setLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
