import { Link, useParams, useSearch } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/ProductImage";
import { StatusBadge } from "./Orders";
import { formatDateTime, formatMAD, paymentLabel } from "@/lib/format";
import { CheckCircle2, ChevronLeft, MapPin, Phone, Truck } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const search = useSearch();
  const placed = new URLSearchParams(search).get("placed") === "1";
  const orderQ = useGetOrder(id);

  if (orderQ.isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="mt-6 h-72" />
        </div>
      </Layout>
    );
  }

  if (orderQ.isError || !orderQ.data) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Commande introuvable.</h1>
          <Button asChild className="mt-6">
            <Link href="/orders">Mes commandes</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const o = orderQ.data;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Mes commandes
        </Link>

        {placed && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-secondary">
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium text-secondary">Merci pour votre commande !</p>
              <p className="text-sm text-secondary/80">Vous recevrez un email de confirmation. Suivez l'avancement ci-dessous.</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Référence</p>
            <h1 className="font-mono text-2xl font-semibold" data-testid="text-order-ref">{o.reference}</h1>
            <p className="text-sm text-muted-foreground">Passée le {formatDateTime(o.createdAt)}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={o.status} />
            <p className="mt-1 text-sm text-muted-foreground">{paymentLabel(o.paymentMethod)}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-card-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-serif text-lg font-semibold">Articles ({o.itemCount})</h2>
            </header>
            <ul className="divide-y divide-border">
              {o.items.map((it) => (
                <li key={it.id} className="grid grid-cols-[64px_1fr_auto] gap-4 px-5 py-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <ProductImage src={it.productImage ?? undefined} alt={it.productTitle} className="h-full w-full object-cover" iconSize={20} />
                  </div>
                  <div>
                    <p className="line-clamp-2 font-medium">{it.productTitle}</p>
                    <p className="text-xs text-muted-foreground">Vendu par {it.vendorName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">x{it.quantity} · {formatMAD(it.unitPrice)}</p>
                  </div>
                  <p className="self-center font-serif font-semibold text-primary">{formatMAD(it.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <footer className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatMAD(o.total - 30)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>{formatMAD(30)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <span className="font-medium">Total</span>
                <span className="font-serif text-xl font-semibold text-primary" data-testid="text-order-total">{formatMAD(o.total)}</span>
              </div>
            </footer>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-card-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Truck className="h-4 w-4 text-primary" /> Livraison
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">{o.shipping.fullName}</p>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span>
                    {o.shipping.address}
                    <br />
                    {o.shipping.city}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {o.shipping.phone}
                </p>
                {o.shipping.notes && (
                  <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
                    {o.shipping.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-5 text-sm">
              <p className="font-semibold">Avancement</p>
              <ol className="mt-3 space-y-3">
                <Step done label="Commande reçue" />
                <Step done={o.status !== "pending"} label="Paiement validé" />
                <Step done={o.status === "shipped" || o.status === "delivered"} label="Expédiée" />
                <Step done={o.status === "delivered"} label="Livrée" />
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {done ? "✓" : ""}
      </span>
      <span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}
