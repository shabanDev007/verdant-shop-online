import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { PlantPotCombination } from "@/types";
import { useCart } from "@/context/CartContext";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { getProductText } from "@/lib/localizeData";
import { usePrice } from "@/lib/usePrice";

export function CombinationProductCard({ combination }: { combination: PlantPotCombination }) {
  const { lang } = useLanguage();
  const t = useT();
  const price = usePrice();
  const { add } = useCart();
  const plantName = getProductText(combination.plant, lang).name;
  const potName = getProductText(combination.pot, lang).name;
  const name =
    (lang === "ar" ? combination.nameAr : combination.name) ?? `${plantName} + ${potName}`;
  const totalPrice = combination.totalPrice ?? combination.plant.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <Link
        to="/products/$id"
        params={{ id: combination.plant.id }}
        search={{ combo: combination.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={combination.previewImage}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute start-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          {t("catalog.potOption")}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{potName}</p>
        <Link
          to="/products/$id"
          params={{ id: combination.plant.id }}
          search={{ combo: combination.id }}
          className="font-display text-lg font-semibold leading-tight hover:text-primary"
        >
          {name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <span className="text-lg font-semibold text-primary">{price(totalPrice)}</span>
            <p className="text-[11px] text-moss">{t("product.inStock")}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              add(combination.plant, 1, {
                combinationId: combination.id,
                name,
                image: combination.previewImage,
                unitPrice: totalPrice,
              });
              toast.success(t("product.comboAdded"));
            }}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"
            aria-label={t("product.addCombo")}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
