import { Link } from "wouter";
import { ShieldCheck, Truck, CreditCard, Headphones, ArrowRight, Instagram, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "Livraison partout au Maroc", desc: "Casablanca, Rabat, Marrakech, Tanger…" },
  { icon: ShieldCheck, title: "Paiement sécurisé", desc: "CMI · CIH Pay · Espèces à la livraison" },
  { icon: CreditCard, title: "Achat 100% protégé", desc: "Retours sous 7 jours" },
  { icon: Headphones, title: "Service client 6j/7", desc: "Du lundi au samedi · 9h–19h" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-sidebar text-sidebar-foreground overflow-hidden">
      
      {/* Features strip */}
      <div className="border-b border-sidebar-border">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-6 md:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="moroccan-gradient p-2 rounded-lg group-hover:shadow-lg transition-shadow duration-200">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-sidebar-foreground/70 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                className="moroccan-gradient flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <span className="font-serif text-lg font-bold">S</span>
              </motion.div>
              <span className="font-serif text-xl font-semibold group-hover:text-primary transition-colors">soukMA</span>
            </Link>
            <p className="mt-4 text-sm text-sidebar-foreground/70 leading-relaxed">
              La marketplace moderne des artisans, vendeurs et marques du Maroc. Acheter beau, acheter local.
            </p>
            {/* Social links */}
            <div className="mt-4 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.button
                  key={i}
                  className="p-2 rounded-lg bg-sidebar-border/50 hover:bg-primary hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {[
            {
              title: "Catalogue",
              links: [
                { href: "/products?categorySlug=vetements-femme", label: "Vêtements Femme" },
                { href: "/products?categorySlug=vetements-homme", label: "Vêtements Homme" },
                { href: "/products?categorySlug=electromenager", label: "Électroménager" },
                { href: "/products?categorySlug=high-tech", label: "High-Tech" },
                { href: "/products?categorySlug=artisanat", label: "Artisanat" },
              ]
            },
            {
              title: "Compte",
              links: [
                { href: "/orders", label: "Mes commandes" },
                { href: "/cart", label: "Mon panier" },
                { href: "/vendor/onboarding", label: "Devenir vendeur" },
              ]
            },
          ].map((col, ci) => (
            <motion.div key={ci} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }}>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      <motion.span
                        className="flex items-center gap-1 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors duration-200 cursor-pointer group"
                        whileHover={{ x: 4 }}
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                        {l.label}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider">À propos</p>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li>soukMA — SARL</li>
              <li>Siège : Casablanca/rabat, Maroc</li>
              <li className="hover:text-primary transition-colors cursor-pointer">contact@soukma.ma</li>
            </ul>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input type="email" placeholder="votre@email.com" className="flex-1 rounded-lg border border-sidebar-border bg-sidebar-border/30 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                <motion.button
                  className="moroccan-gradient rounded-lg px-3 py-2 text-xs text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-sidebar-border pt-6 mt-8 text-xs text-sidebar-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} soukMA — Tous droits réservés.</p>
          <p className="flex items-center gap-1">Fait avec <span className="text-primary">♥</span> à Casablanca.</p>
        </div>
      </div>
    </footer>
  );
}
