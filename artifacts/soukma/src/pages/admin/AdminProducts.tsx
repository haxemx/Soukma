import { Link } from "wouter";
import { useListAllProductsAdmin } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ProductImage";
import { formatMAD } from "@/lib/format";

export default function AdminProductsPage() {
  const productsQ = useListAllProductsAdmin();
  const products = productsQ.data ?? [];

  return (
    <AdminLayout title="Produits" subtitle="Toute la base produits de soukMA.">
      {productsQ.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">Aucun produit.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              data-testid={`row-admin-product-${p.id}`}
              className="grid grid-cols-[60px_1fr_auto] items-center gap-4 rounded-xl border border-card-border bg-card p-3 hover-elevate"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                <ProductImage src={p.imageUrl ?? undefined} alt={p.title} className="h-full w-full object-cover" iconSize={20} />
              </div>
              <div>
                <p className="line-clamp-1 font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.categoryName} · {p.vendorName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Stock {p.stock}</Badge>
                <span className="font-serif font-semibold text-primary">{formatMAD(p.price)}</span>
              </div>
            </Link>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}
