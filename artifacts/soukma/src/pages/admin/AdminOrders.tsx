import { useState } from "react";
import { Link } from "wouter";
import {
  useListAllOrders,
  useUpdateOrderStatus,
  getListAllOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "../Orders";
import { formatDateTime, formatMAD, paymentLabel } from "@/lib/format";
import { ChevronRight } from "lucide-react";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const ordersQ = useListAllOrders();
  const queryClient = useQueryClient();
  const update = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() }),
    },
  });
  const orders = (ordersQ.data ?? []).filter((o) => !filter || o.status === filter);

  return (
    <AdminLayout
      title="Commandes"
      subtitle="Toutes les commandes de la plateforme."
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={filter ?? "all"}
            onValueChange={(v) => setFilter(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-44" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
              <SelectItem value="shipped">Expédiée</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {ordersQ.isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">Aucune commande pour ce filtre.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl border border-card-border bg-card p-4">
              <Link href={`/orders/${o.id}`} className="block min-w-0 hover-elevate" data-testid={`row-admin-order-${o.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">{o.reference}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {paymentLabel(o.paymentMethod)} · {formatDateTime(o.createdAt)} · {o.itemCount} art.
                </p>
              </Link>
              <span className="font-serif text-lg font-semibold text-primary">{formatMAD(o.total)}</span>
              <Select
                value={o.status}
                onValueChange={(v) => update.mutate({ id: o.id, data: { status: v as any } })}
              >
                <SelectTrigger className="w-36" data-testid={`select-status-${o.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}
