import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListAllProductsAdmin } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImage } from "@/components/ProductImage";
import { formatMAD } from "@/lib/format";
import { apiBase } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Star, Package, TrendingDown, Tag, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Product = {
  id: string; title: string; description?: string; price: number;
  compareAtPrice?: number; stock: number; categoryId: string;
  categoryName?: string; imageUrl?: string; isFeatured: boolean;
  vendorName?: string; rating: number; viewCount?: number;
};

type Category = { id: string; name: string; slug: string; };

function ProductModal({ product, categories, onClose, onSaved }: {
  product?: Product; categories: Category[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: product?.title ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    compareAtPrice: product?.compareAtPrice?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    imageUrl: product?.imageUrl ?? "",
    isFeatured: product?.isFeatured ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const url = product ? `${apiBase}/admin/products/${product.id}` : `${apiBase}/admin/products`;
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          stock: parseInt(form.stock),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      onSaved();
      onClose();
    } catch { setError("Erreur de connexion"); }
    finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
      >
        <div className="moroccan-gradient h-1.5 w-full" />
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{product ? "Modifier le produit" : "Ajouter un produit"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nom du produit" required />
            </div>
            <div className="space-y-1.5">
              <Label>Prix (MAD) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="299" required min="0" step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label>Prix barré (MAD)</Label>
              <Input type="number" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} placeholder="399" min="0" step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock *</Label>
              <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" min="0" required />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>URL Image</Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description du produit..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-border accent-primary" />
              <Label htmlFor="featured" className="cursor-pointer">Coup de cœur (mis en avant)</Label>
            </div>
          </div>

          {form.imageUrl && (
            <div className="rounded-xl border border-border overflow-hidden h-32 w-32">
              <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1 moroccan-gradient text-white" disabled={loading}>
              {loading ? "Enregistrement..." : product ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProductsPage() {
  const productsQ = useListAllProductsAdmin();
  const products = (productsQ.data ?? []) as Product[];
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | "low-stock" | "promo">("all");
  const [viewsModal, setViewsModal] = useState<{ open: boolean; productId: string | null; productName: string }>({ open: false, productId: null, productName: "" });
  const [viewers, setViewers] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  async function loadCategories() {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${apiBase}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setCategories(await res.json());
  }

  async function openModal(product?: Product) {
    await loadCategories();
    setModal({ open: true, product });
  }

  async function loadProductViews(productId: string, productName: string) {
    setViewsModal({ open: true, productId, productName });
    setLoadingViewers(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${apiBase}/admin/products/${productId}/views`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setViewers(data);
      } else setViewers([]);
    } catch { setViewers([]); }
    finally { setLoadingViewers(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${apiBase}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      productsQ.refetch();
    } finally { setDeleting(null); }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "featured") return matchSearch && p.isFeatured;
    if (filter === "low-stock") return matchSearch && p.stock < 5;
    if (filter === "promo") return matchSearch && p.compareAtPrice && p.compareAtPrice > p.price;
    return matchSearch;
  });

  const stats = {
    total: products.length,
    featured: products.filter(p => p.isFeatured).length,
    lowStock: products.filter(p => p.stock < 5).length,
    promo: products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).length,
  };

  return (
    <AdminLayout title="Produits" subtitle="Gérez tous les produits de soukMA.">
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-5">
        {[
          { label: "Vues totales", value: products.reduce((a, p) => a + (p.viewCount ?? 0), 0), icon: Eye, color: "text-purple-500", key: "all-views" },
          { label: "Total", value: stats.total, icon: Package, color: "text-blue-500", key: "all" },
          { label: "Coup de cœur", value: stats.featured, icon: Star, color: "text-yellow-500", key: "featured" },
          { label: "Stock faible", value: stats.lowStock, icon: TrendingDown, color: "text-red-500", key: "low-stock" },
          { label: "En promo", value: stats.promo, icon: Tag, color: "text-green-500", key: "promo" },
        ].map((s) => (
          <motion.button
            key={s.key}
            onClick={() => setFilter(s.key as any)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`rounded-xl border p-4 text-left transition-all ${filter === s.key ? "border-primary bg-primary/5" : "border-card-border bg-card hover:border-primary/50"}`}
          >
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="flex-1" />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => openModal()} className="moroccan-gradient text-white gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </motion.div>
      </div>

      {productsQ.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">Aucun produit trouvé.</p>
      ) : (
        <motion.ul className="space-y-2" layout>
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-xl border border-card-border bg-card p-3 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <ProductImage src={p.imageUrl ?? undefined} alt={p.title} className="h-full w-full object-cover" iconSize={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{p.title}</p>
                    {p.isFeatured && <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">★ Coup de cœur</Badge>}
                    {p.stock < 5 && <Badge variant="destructive" className="text-[10px]">Stock faible</Badge>}
                    {p.compareAtPrice && p.compareAtPrice > p.price && <Badge className="bg-green-100 text-green-700 text-[10px]">Promo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.categoryName} · Stock: {p.stock}</p>
                  <p className="font-serif text-sm font-semibold text-primary mt-1">
                    {formatMAD(p.price)}
                    {p.compareAtPrice && <span className="text-xs text-muted-foreground line-through ml-2">{formatMAD(p.compareAtPrice)}</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:border-primary hover:text-primary" onClick={() => loadProductViews(p.id, p.title)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:border-primary hover:text-primary" onClick={() => openModal(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:border-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence>
        {modal.open && (
          <ProductModal
            product={modal.product}
            categories={categories}
            onClose={() => setModal({ open: false })}
            onSaved={() => productsQ.refetch()}
          />
        )}
      </AnimatePresence>

      <Dialog open={viewsModal.open} onOpenChange={(open) => !open && setViewsModal({ open: false, productId: null, productName: "" })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Utilisateurs ayant vu « {viewsModal.productName} »</DialogTitle>
          </DialogHeader>
          {loadingViewers ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : viewers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun utilisateur connecté n'a consulté ce produit.</p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {viewers.map((viewer) => (
                <div key={viewer.userId} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{viewer.firstName} {viewer.lastName}</p>
                    <p className="text-xs text-muted-foreground">{viewer.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(viewer.viewedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
