import { Link } from "wouter";
import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 border-b border-sidebar-border pb-10 md:grid-cols-4">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-6 w-6 text-accent" />
            <div>
              <p className="font-medium">Livraison partout au Maroc</p>
              <p className="text-sm text-sidebar-foreground/70">Casablanca, Rabat, Marrakech, Tanger…</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 text-accent" />
            <div>
              <p className="font-medium">Paiement sécurisé</p>
              <p className="text-sm text-sidebar-foreground/70">CMI · CIH Pay · Espèces à la livraison</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-6 w-6 text-accent" />
            <div>
              <p className="font-medium">Achat 100% protégé</p>
              <p className="text-sm text-sidebar-foreground/70">Retours sous 7 jours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-6 w-6 text-accent" />
            <div>
              <p className="font-medium">Service client 6j/7</p>
              <p className="text-sm text-sidebar-foreground/70">Du lundi au samedi · 9h–19h</p>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="moroccan-gradient flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground">
                <span className="font-serif text-lg font-bold">S</span>
              </div>
              <span className="font-serif text-xl font-semibold">soukMA</span>
            </Link>
            <p className="mt-4 text-sm text-sidebar-foreground/70">
              La marketplace moderne des artisans, vendeurs et marques du Maroc.
              Acheter beau, acheter local.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Catalogue</p>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li><Link href="/products?categorySlug=vetements-femme" className="hover:text-accent">Vêtements Femme</Link></li>
              <li><Link href="/products?categorySlug=vetements-homme" className="hover:text-accent">Vêtements Homme</Link></li>
              <li><Link href="/products?categorySlug=electromenager" className="hover:text-accent">Électroménager</Link></li>
              <li><Link href="/products?categorySlug=high-tech" className="hover:text-accent">High-Tech</Link></li>
              <li><Link href="/products?categorySlug=artisanat" className="hover:text-accent">Artisanat</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Compte</p>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li><Link href="/orders" className="hover:text-accent">Mes commandes</Link></li>
              <li><Link href="/cart" className="hover:text-accent">Mon panier</Link></li>
              <li><Link href="/vendor/onboarding" className="hover:text-accent">Devenir vendeur</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">À propos</p>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li>soukMA — SARL au capital de 100 000 MAD</li>
              <li>Siège : Casablanca, Maroc</li>
              <li>contact@soukma.ma</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} soukMA — Tous droits réservés.</p>
          <p>Fait avec passion à Casablanca.</p>
        </div>
      </div>
    </footer>
  );
}
