import { Link } from "@tanstack/react-router";
import { Leaf, Instagram, Facebook, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">Verdura</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Premium plants delivered with care. Greener homes, happier humans.
          </p>
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

        <FooterCol title="Shop">
          <FLink to="/products">All Plants</FLink>
          <FLink to="/categories">Categories</FLink>
          <FLink to="/products">New Arrivals</FLink>
          <FLink to="/products">Best Sellers</FLink>
        </FooterCol>
        <FooterCol title="Company">
          <FLink to="/about">About Us</FLink>
          <FLink to="/contact">Contact</FLink>
          <FLink to="/about">Plant Care Promise</FLink>
          <FLink to="/contact">Help Center</FLink>
        </FooterCol>
        <FooterCol title="Support">
          <p className="text-sm text-muted-foreground">hello@verdura.shop</p>
          <p className="text-sm text-muted-foreground">+1 (555) 010-9090</p>
          <p className="text-sm text-muted-foreground">Mon–Sat · 9am–6pm</p>
        </FooterCol>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Verdura. All rights reserved.</p>
          <p>Grown with love · Shipped with care 🌿</p>
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
