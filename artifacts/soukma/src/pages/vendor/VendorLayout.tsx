import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { SidebarNav } from "@/components/SidebarNav";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { loginUrl } from "@/lib/auth";

export function VendorLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const profileQ = useGetMyProfile();
  const role = profileQ.data?.role;

  if (profileQ.isLoading) {
    return <Layout><div className="mx-auto max-w-6xl px-4 py-10">Chargement…</div></Layout>;
  }
  if (!profileQ.data?.user) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Connectez-vous pour accéder à l'espace vendeur.</h1>
          <Button className="mt-6" onClick={() => (window.location.href = loginUrl("/vendor"))}>Se connecter</Button>
        </div>
      </Layout>
    );
  }
  if (role !== "vendor" && role !== "admin") {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Vous n'avez pas encore de boutique.</h1>
          <p className="mt-2 text-muted-foreground">Créez votre boutique soukMA en moins de 2 minutes.</p>
          <Button className="mt-6" onClick={() => (window.location.href = "/vendor/onboarding")}>Devenir vendeur</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Espace vendeur</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <SidebarNav
            title="Vendeur"
            items={[
              { href: "/vendor", label: "Tableau de bord", icon: LayoutDashboard },
              { href: "/vendor/products", label: "Produits", icon: Package },
              { href: "/vendor/orders", label: "Commandes", icon: ShoppingBag },
            ]}
          />
          <div>{children}</div>
        </div>
      </div>
    </Layout>
  );
}
