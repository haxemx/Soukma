import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { SidebarNav } from "@/components/SidebarNav";
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({
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
  const [, navigate] = useLocation();
  const adminAuth = localStorage.getItem("admin_auth") === "true";

  useEffect(() => {
    if (!adminAuth) {
      window.location.href = "/admin/login";
    }
  }, []);

  if (!adminAuth) return null;

  function handleLogout() {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("auth_token");
    window.location.href = "/admin/login";
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Administration</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </header>
        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <SidebarNav
            title="Admin"
            items={[
              { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
              { href: "/admin/users", label: "Utilisateurs", icon: Users },
              { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
              { href: "/admin/products", label: "Produits", icon: Package },
            ]}
          />
          <div>{children}</div>
        </div>
      </div>
    </Layout>
  );
}
