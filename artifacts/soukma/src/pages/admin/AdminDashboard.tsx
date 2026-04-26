import { Link } from "wouter";
import { useGetAdminStats } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMAD, statusLabel } from "@/lib/format";
import { Users, Store, Package, ShoppingBag, Wallet } from "lucide-react";

export default function AdminDashboardPage() {
  const statsQ = useGetAdminStats();
  const stats = statsQ.data;

  return (
    <AdminLayout title="Vue d'ensemble" subtitle="Toute l'activité de la marketplace en temps réel.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Stat label="Utilisateurs" value={stats?.totalUsers} icon={<Users className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Vendeurs" value={stats?.totalVendors} icon={<Store className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Produits" value={stats?.totalProducts} icon={<Package className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Commandes" value={stats?.totalOrders} icon={<ShoppingBag className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Chiffre d'affaires" value={stats ? formatMAD(stats.revenue) : ""} icon={<Wallet className="h-5 w-5" />} loading={statsQ.isLoading} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-card-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-semibold">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">Tout voir</Link>
          </header>
          {statsQ.isLoading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <ul className="divide-y divide-border">
              {(stats?.recentOrders ?? []).map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover-elevate">
                    <div>
                      <p className="font-mono text-sm font-medium">{o.reference}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)} · {o.itemCount} art.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{statusLabel(o.status)}</Badge>
                      <span className="font-serif font-semibold text-primary">{formatMAD(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
              {(stats?.recentOrders ?? []).length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune commande pour le moment.</p>
              )}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-card-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-semibold">Top catégories</h2>
          </header>
          {statsQ.isLoading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <ul className="divide-y divide-border">
              {(stats?.topCategories ?? []).map((c) => (
                <li key={c.slug} className="flex items-center justify-between px-5 py-3">
                  <Link href={`/products?categorySlug=${c.slug}`} className="text-sm font-medium hover:text-primary">{c.name}</Link>
                  <span className="text-xs text-muted-foreground">{c.productCount} produits</span>
                </li>
              ))}
              {(stats?.topCategories ?? []).length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune catégorie disponible.</p>
              )}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value?: number | string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5" data-testid={`stat-admin-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-3 font-serif text-2xl font-semibold">
        {loading ? <Skeleton className="h-8 w-24" /> : value ?? 0}
      </p>
    </div>
  );
}
