import { Link } from "wouter";
import { useGetVendorStats } from "@workspace/api-client-react";
import { VendorLayout } from "./VendorLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { formatDateTime, formatMAD, statusLabel } from "@/lib/format";
import { Package, ShoppingBag, Wallet, AlertTriangle, Plus, ChevronRight } from "lucide-react";

export default function VendorDashboardPage() {
  const statsQ = useGetVendorStats();

  return (
    <VendorLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre activité sur soukMA."
      actions={
        <Button asChild data-testid="button-add-product">
          <Link href="/vendor/products?new=1"><Plus className="mr-1 h-4 w-4" />Nouveau produit</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produits" value={statsQ.data?.totalProducts ?? 0} icon={<Package className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Commandes" value={statsQ.data?.totalOrders ?? 0} icon={<ShoppingBag className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Chiffre d'affaires" value={formatMAD(statsQ.data?.revenue ?? 0)} icon={<Wallet className="h-5 w-5" />} loading={statsQ.isLoading} />
        <Stat label="Stock faible" value={statsQ.data?.lowStockCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} loading={statsQ.isLoading} accent />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-card-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-semibold">Commandes récentes</h2>
            <Link href="/vendor/orders" className="text-sm text-primary hover:underline">Tout voir</Link>
          </header>
          {statsQ.isLoading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (statsQ.data?.recentOrders ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(statsQ.data?.recentOrders ?? []).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-mono font-medium">{o.reference}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)} · {o.itemCount} article{o.itemCount > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{statusLabel(o.status)}</Badge>
                    <span className="font-serif font-semibold text-primary">{formatMAD(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-card-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-semibold">Top produits</h2>
            <Link href="/vendor/products" className="text-sm text-primary hover:underline">Gérer</Link>
          </header>
          {statsQ.isLoading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (statsQ.data?.topProducts ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Ajoutez votre premier produit pour commencer à vendre.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(statsQ.data?.topProducts ?? []).map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 px-5 py-3 hover-elevate">
                    <div className="aspect-square overflow-hidden rounded-md bg-muted">
                      <ProductImage src={p.imageUrl ?? undefined} alt={p.title} className="h-full w-full object-cover" iconSize={18} />
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">Stock: {p.stock} · {formatMAD(p.price)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </VendorLayout>
  );
}

function Stat({
  label,
  value,
  icon,
  loading,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${accent ? "border-accent/60" : "border-card-border"}`} data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={accent ? "text-accent" : "text-primary"}>{icon}</span>
      </div>
      <p className="mt-3 font-serif text-2xl font-semibold">
        {loading ? <Skeleton className="h-8 w-20" /> : value}
      </p>
    </div>
  );
}
