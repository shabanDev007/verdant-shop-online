import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGES } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const other = LANGUAGES.find((l) => l.code !== lang)!;
  return (
    <button
      type="button"
      onClick={() => setLang(other.code)}
      aria-label={t("nav.language")}
      title={other.nativeLabel}
      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-foreground/70 transition hover:bg-accent hover:text-primary"
    >
      <Globe className="h-4 w-4" />
      <span>{other.nativeLabel}</span>
    </button>
  );
}
