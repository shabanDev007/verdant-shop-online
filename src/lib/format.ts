import type { Language } from "@/i18n/translations";

/**
 * Currency formatter for Egyptian Pound (EGP).
 *
 * English: "1,250 EGP"
 * Arabic:  "١٬٢٥٠ ج.م" (uses Arabic-Indic digits via Intl)
 *
 * Switch currency in one place by changing CURRENCY_CODE.
 */
export const CURRENCY_CODE = "EGP";

const formatters: Partial<Record<Language, Intl.NumberFormat>> = {};

function getFormatter(lang: Language) {
  if (!formatters[lang]) {
    const locale = lang === "ar" ? "ar-EG" : "en-EG";
    formatters[lang] = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY_CODE,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
  return formatters[lang]!;
}

export function formatPrice(amount: number, lang: Language = "en"): string {
  if (Number.isNaN(amount)) return "";
  return getFormatter(lang).format(amount);
}

export function formatNumber(n: number, lang: Language = "en"): string {
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(locale).format(n);
}
