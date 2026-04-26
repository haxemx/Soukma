import { Link } from "wouter";
import { useListMyOrders, useGetMyProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatMAD, paymentLabel, statusLabel } from "@/lib/format";
import { loginUrl } from "@/lib/auth";
import { Package, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const profileQ = useGetMyProfile();
  const ordersQ = useListMyOrders({
    query: { enabled: !!profileQ.data?.user, queryKey: ["/api/orders"] },
  });

  if (!profileQ.data?.user) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Connectez-vous pour voir vos commandes.</h1>
          <Button className="mt-6" onClick={() => (window.location.href = loginUrl("/orders"))}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  const orders = ordersQ.data ?? [];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mon compte</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Mes commandes</h1>
          <p className="mt-1 text-muted-foreground">Retrouvez l'historique et le statut de vos achats.</p>
        </div>

        <div className="mt-8 space-y-3">
          {ordersQ.isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : orders.length === 0
              ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-serif text-lg font-semibold">Aucune commande pour le moment.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Découvrez nos produits et passez votre première commande.</p>
                  <Button asChild className="mt-4">
                    <Link href="/products">Voir le catalogue</Link>
                  </Button>
                </div>
              )
              : orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  data-testid={`row-order-${o.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-card-border bg-card p-4 transition hover-elevate"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium" data-testid={`text-ref-${o.id}`}>{o.reference}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {o.itemCount} article{o.itemCount > 1 ? "s" : ""} · {paymentLabel(o.paymentMethod)} · {formatDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-semibold text-primary">{formatMAD(o.total)}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </Layout>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant: Record<string, string> = {
    pending: "bg-muted text-foreground",
    paid: "bg-secondary text-secondary-foreground",
    shipped: "bg-accent text-accent-foreground",
    delivered: "bg-primary text-primary-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };
  return (
    <Badge className={`${variant[status] ?? "bg-muted"}`} data-testid={`badge-status-${status}`}>
      {statusLabel(status)}
    </Badge>
  );
}
