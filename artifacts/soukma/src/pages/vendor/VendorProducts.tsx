import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import {
  useListVendorProducts,
  useCreateVendorProduct,
  useUpdateVendorProduct,
  useDeleteVendorProduct,
  useListCategories,
  getListVendorProductsQueryKey,
  getGetVendorStatsQueryKey,
  type Product,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { VendorLayout } from "./VendorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProductImage } from "@/components/ProductImage";
import { formatMAD } from "@/lib/format";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function VendorProductsPage() {
  const productsQ = useListVendorProducts();
  const search = useSearch();
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(search).get("new") === "1") setOpenNew(true);
  }, [search]);

  const editingProduct = productsQ.data?.find((p) => p.id === editingId) ?? null;

  return (
    <VendorLayout
      title="Mes produits"
      subtitle="Ajoutez, modifiez et publiez vos produits."
      actions={
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-product"><Plus className="mr-1 h-4 w-4" />Nouveau produit</Button>
          </DialogTrigger>
          <ProductFormDialog onClose={() => setOpenNew(false)} />
        </Dialog>
      }
    >
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        {editingProduct && (
          <ProductFormDialog product={editingProduct} onClose={() => setEditingId(null)} />
        )}
      </Dialog>

      {productsQ.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (productsQ.data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-serif text-lg font-semibold">Aucun produit pour l'instant.</p>
          <p className="mt-1 text-sm text-muted-foreground">Cliquez sur « Nouveau produit » pour commencer.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {(productsQ.data ?? []).map((p) => (
            <li
              key={p.id}
              data-testid={`row-vendor-product-${p.id}`}
              className="grid grid-cols-[64px_1fr_auto] gap-4 rounded-xl border border-card-border bg-card p-3 sm:grid-cols-[80px_1fr_auto]"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                <ProductImage src={p.imageUrl ?? undefined} alt={p.title} className="h-full w-full object-cover" iconSize={20} />
              </div>
              <div>
                <p className="line-clamp-1 font-medium">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.categoryName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-serif font-semibold text-primary">{formatMAD(p.price)}</span>
                  <Badge variant="secondary">Stock: {p.stock}</Badge>
                  {p.isFeatured && <Badge className="bg-accent text-accent-foreground">À la une</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1 self-start">
                <Button size="icon" variant="ghost" onClick={() => setEditingId(p.id)} data-testid={`button-edit-${p.id}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteButton id={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </VendorLayout>
  );
}

function DeleteButton({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const del = useDeleteVendorProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVendorProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVendorStatsQueryKey() });
        toast({ title: "Produit supprimé" });
      },
    },
  });
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => {
        if (confirm("Supprimer ce produit ?")) del.mutate({ id });
      }}
      data-testid={`button-delete-${id}`}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}

function ProductFormDialog({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const catsQ = useListCategories();
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAt, setCompareAt] = useState(product?.compareAtPrice ? String(product.compareAtPrice) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "1");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  const create = useCreateVendorProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVendorProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVendorStatsQueryKey() });
        toast({ title: "Produit ajouté" });
        onClose();
      },
      onError: (err: any) =>
        toast({ title: "Erreur", description: err?.message ?? "", variant: "destructive" }),
    },
  });
  const update = useUpdateVendorProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVendorProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVendorStatsQueryKey() });
        toast({ title: "Produit mis à jour" });
        onClose();
      },
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title,
      description: description || undefined,
      price: Number(price),
      compareAtPrice: compareAt ? Number(compareAt) : undefined,
      stock: Number(stock),
      categorySlug,
      isFeatured,
      // REMPLACER ICI: l'imageUrl pourra être renseignée via votre CDN.
      imageUrl: undefined,
    };
    if (product) update.mutate({ id: product.id, data });
    else create.mutate({ data });
  }

  const pending = create.isPending || update.isPending;

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-product-title" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={3} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Prix MAD *</Label>
            <Input id="price" required type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} data-testid="input-product-price" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compare">Prix barré</Label>
            <Input id="compare" type="number" min="0" step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock *</Label>
            <Input id="stock" required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} data-testid="input-product-stock" />
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie *</Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger data-testid="select-product-category"><SelectValue placeholder="Choisir…" /></SelectTrigger>
              <SelectContent>
                {(catsQ.data ?? []).map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
          Mettre à la une
        </label>
        <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
          {/* REMPLACER ICI: ajout d'images via CDN ou storage à brancher plus tard. */}
          Les images seront ajoutées dans une prochaine version (placez votre URL dans le champ imageUrl en base).
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={pending || !categorySlug} data-testid="button-save-product">
            {pending ? "Enregistrement…" : product ? "Mettre à jour" : "Publier"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
