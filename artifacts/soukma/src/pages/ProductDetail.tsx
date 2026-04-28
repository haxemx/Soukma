import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  useGetProduct,
  useAddCartItem,
  getGetMyCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { apiBase } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatMAD } from "@/lib/format";
import { loginUrl } from "@/lib/auth";
import {
  ChevronLeft,
  Star,
  Truck,
  ShieldCheck,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function SimilarProducts({ productId }: { productId: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${apiBase}/products/${productId}/similar`)
      .then(r => r.json()).then(setItems).catch(() => {});
  }, [productId]);
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const productQ = useGetProduct(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const addCart = useAddCartItem({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() });
        toast({ title: "Ajouté au panier", description: "Votre article a été ajouté avec succès." });
      },
      onError: (err: any) => {
        if (err?.status === 401) {
          window.location.href = loginUrl(`/products/${id}`);
          return;
        }
        toast({
          title: "Impossible d'ajouter",
          description: err?.message ?? "Une erreur est survenue.",
          variant: "destructive",
        });
      },
    },
  });

  // Save to recently viewed
  useEffect(() => {
    if (!p) return;
    const key = "soukma_recently_viewed";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
    const updated = [
      { id: p.id, title: p.title, price: p.price, imageUrl: p.imageUrl, categoryName: p.categoryName },
      ...prev.filter((x: any) => x.id !== p.id)
    ].slice(0, 6);
    localStorage.setItem(key, JSON.stringify(updated));
  }, [productQ.data?.id]);

  if (productQ.isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <Skeleton className="h-6 w-40" />
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (productQ.isError || !productQ.data) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Produit introuvable.</h1>
          <p className="mt-2 text-muted-foreground">
            Ce produit n'existe plus ou a été retiré du catalogue.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Retour au catalogue</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const p = productQ.data;
  const discount = p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round(100 - (p.price / p.compareAtPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <button
          onClick={() => setLocation("/products")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          data-testid="button-back-products"
        >
          <ChevronLeft className="h-4 w-4" /> Retour au catalogue
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl border border-card-border bg-card">
              <ProductImage src={p.imageUrl ?? undefined} alt={p.title} className="h-full w-full object-cover" iconSize={80} />
            </div>
            {p.images && p.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {p.images.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border">
                    <ProductImage src={src} alt={`${p.title} - ${i + 1}`} className="h-full w-full object-cover" iconSize={20} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-muted">
                {p.categoryName ?? "Catégorie"}
              </Badge>
              {p.isFeatured && (
                <Badge className="bg-accent text-accent-foreground">Coup de cœur</Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-primary text-primary-foreground">-{discount}%</Badge>
              )}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl" data-testid="text-product-title">
              {p.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {p.rating.toFixed(1)} <span className="text-muted-foreground/70">({p.reviewCount} avis)</span>
              </span>
              <span>·</span>
              <span>Vendu par <span className="font-medium text-foreground">{p.vendorName}</span></span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-4xl font-semibold text-primary" data-testid="text-product-price">
                {formatMAD(p.price)}
              </span>
              {p.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatMAD(p.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="mt-4 leading-relaxed text-foreground/85">{p.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-card-border bg-card p-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Livré 24-72h
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Garantie soukMA
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> {p.stock} en stock
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-input">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-testid="button-qty-minus"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium" data-testid="text-quantity">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity((q) => Math.min(p.stock || 99, q + 1))}
                  data-testid="button-qty-plus"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1"
                disabled={p.stock <= 0 || addCart.isPending}
                onClick={() => addCart.mutate({ data: { productId: p.id, quantity } })}
                data-testid="button-add-to-cart"
              >
                {addCart.isPending ? "Ajout en cours…" : p.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
              </Button>
            </div>

            <div className="mt-8">
              <Tabs defaultValue="specs">
                <TabsList>
                  <TabsTrigger value="specs" data-testid="tab-specs">Caractéristiques</TabsTrigger>
                  <TabsTrigger value="shipping" data-testid="tab-shipping">Livraison</TabsTrigger>
                  <TabsTrigger value="returns" data-testid="tab-returns">Retours</TabsTrigger>
                </TabsList>
                <TabsContent value="specs" className="pt-4">
                  {p.specs && p.specs.length > 0 ? (
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {p.specs.map((s, i) => (
                        <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-medium">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune caractéristique fournie.</p>
                  )}
                </TabsContent>
                <TabsContent value="shipping" className="pt-4 text-sm text-muted-foreground">
                  Livraison express 24h à Casablanca, 48-72h dans les autres villes du Maroc.
                  Frais de livraison estimés à 30 MAD, gratuits dès 800 MAD d'achat.
                </TabsContent>
                <TabsContent value="returns" className="pt-4 text-sm text-muted-foreground">
                  Vous disposez de 7 jours pour retourner votre article. Le remboursement
                  est effectué sous 5 jours ouvrés après réception.
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <h2 className="text-xl font-semibold mb-6">Produits similaires</h2>
      <SimilarProducts productId={id} />
    </div>
    </Layout>
  );
}
