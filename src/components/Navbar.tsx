import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, Heart, GitCompareArrows } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useT } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchDropdown } from "@/components/SearchDropdown";

export function Navbar() {
  const t = useT();
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { ids: cmpIds } = useCompare();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setSearchOpen(false);
    setOpen(false);
  }, [pathname]);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/products", label: t("nav.shop") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center" aria-label={t("brand.name")}>
          <img
            src="/brand/jothour-logo.png"
            alt={t("brand.name")}
            className="h-14 w-auto max-w-[112px] object-contain sm:h-16 sm:max-w-[130px]"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-foreground/70"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("nav.search")}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-accent hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/compare"
            aria-label={t("nav.compare")}
            title={t("nav.compare")}
            className="relative hidden h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-accent hover:text-primary sm:grid"
          >
            <GitCompareArrows className="h-5 w-5" />
            {cmpIds.length > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cmpIds.length}
              </span>
            )}
          </Link>
          <Link
            to="/wishlist"
            aria-label={t("nav.wishlist")}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-accent hover:text-primary"
          >
            <Heart className="h-5 w-5" />
            {ids.length > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-semibold text-primary-foreground">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label={t("nav.cart")}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-accent hover:text-primary"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-accent md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border/60 px-3 py-3">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative mx-auto mt-16 max-w-2xl rounded-3xl bg-background p-5 shadow-2xl">
            <SearchDropdown onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
