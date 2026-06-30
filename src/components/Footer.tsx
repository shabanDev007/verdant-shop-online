import { Link } from "@tanstack/react-router";
import { Leaf, Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">{t("brand.name")}</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("footer.tagline")}</p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground/70 transition hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title={t("footer.col.shop")}>
          <FLink to="/products">{t("footer.shop.all")}</FLink>
          <FLink to="/categories">{t("footer.shop.categories")}</FLink>
          <FLink to="/products">{t("footer.shop.new")}</FLink>
          <FLink to="/products">{t("footer.shop.best")}</FLink>
        </FooterCol>
        <FooterCol title={t("footer.col.company")}>
          <FLink to="/about">{t("footer.company.about")}</FLink>
          <FLink to="/contact">{t("footer.company.contact")}</FLink>
          <FLink to="/about">{t("footer.company.promise")}</FLink>
          <FLink to="/contact">{t("footer.company.help")}</FLink>
        </FooterCol>
        <FooterCol title={t("footer.col.support")}>
          <p className="text-sm text-muted-foreground">hello@verdura.shop</p>
          <p className="text-sm text-muted-foreground" dir="ltr">+20 100 000 0000</p>
          <p className="text-sm text-muted-foreground">{t("footer.support.hours")}</p>
        </FooterCol>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}</p>
          <p>{t("footer.grown")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-muted-foreground transition hover:text-primary">
        {children}
      </Link>
    </li>
  );
}
