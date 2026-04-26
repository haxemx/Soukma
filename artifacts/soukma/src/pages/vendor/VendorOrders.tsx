import { Link } from "wouter";
import { useListVendorOrders } from "@workspace/api-client-react";
import { VendorLayout } from "./VendorLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "../Orders";
import { formatDateTime, formatMAD, paymentLabel } from "@/lib/format";
import { ChevronRight, Inbox } from "lucide-react";

export default function VendorOrdersPage() {
  const ordersQ = useListVendorOrders();
  const orders = ordersQ.data ?? [];

  return (
    <VendorLayout title="Commandes" subtitle="Toutes les commandes contenant vos produits.">
      {ordersQ.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold">Pas encore de commandes.</p>
          <p className="mt-1 text-sm text-muted-foreground">Vos premières ventes apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              data-testid={`row-vendor-order-${o.id}`}
              className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-card-border bg-card p-4 transition hover-elevate"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">{o.reference}</span>
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
        </ul>
      )}
    </VendorLayout>
  );
}
