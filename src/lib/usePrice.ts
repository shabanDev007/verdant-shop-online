import { useLanguage } from "@/i18n/LanguageContext";
import { formatPrice as fmt, formatNumber as fmtNum } from "@/lib/format";

/** Hook that returns a price formatter scoped to the active language. */
export function usePrice() {
  const { lang } = useLanguage();
  return (amount: number) => fmt(amount, lang);
}

export function useNumber() {
  const { lang } = useLanguage();
  return (n: number) => fmtNum(n, lang);
}
