import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPills } from "@/components/CategoryPills";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();

  const [q, setQ] = useState(params.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [sort, setSort] = useState<string>(params.get("sort") ?? "newest");
  const categorySlug = params.get("categorySlug") ?? undefined;

  useEffect(() => {
    setQ(params.get("search") ?? "");
    setMinPrice(params.get("minPrice") ?? "");
    setMaxPrice(params.get("maxPrice") ?? "");
    setSort(params.get("sort") ?? "newest");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const queryParams = useMemo(
    () => ({
      search: params.get("search") ?? undefined,
      categorySlug,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      sort: (params.get("sort") as any) ?? undefined,
      limit: 48,
      offset: 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  );

  const productsQ = useListProducts(queryParams);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set("search", q);
    if (categorySlug) next.set("categorySlug", categorySlug);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (sort && sort !== "newest") next.set("sort", sort);
    setLocation(`/products${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function clearAll() {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setLocation("/products");
  }

  const items = productsQ.data?.items ?? [];

  return (
    <Layout>
      <section className="zellige-pattern border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Catalogue</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {categorySlug ? labelize(categorySlug) : "Tous les produits"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {productsQ.data ? `${productsQ.data.total} produit${productsQ.data.total > 1 ? "s" : ""} trouvé${productsQ.data.total > 1 ? "s" : ""}` : "Chargement…"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6">
          <CategoryPills activeSlug={categorySlug} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-xl border border-card-border bg-card p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtres
              </p>
              <form onSubmit={applyFilters} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Mot clé…"
                      className="pl-8"
                      data-testid="input-filter-search"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Min (MAD)</label>
                    <Input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      data-testid="input-filter-min"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Max (MAD)</label>
                    <Input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      data-testid="input-filter-max"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Trier par</label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger data-testid="select-filter-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Plus récents</SelectItem>
                      <SelectItem value="popular">Plus populaires</SelectItem>
                      <SelectItem value="priceAsc">Prix croissant</SelectItem>
                      <SelectItem value="priceDesc">Prix décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" data-testid="button-apply-filters">
                    Appliquer
                  </Button>
                  <Button type="button" variant="outline" onClick={clearAll} data-testid="button-clear-filters">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </aside>

          <div>
            {productsQ.isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-serif text-lg font-semibold">Aucun produit ne correspond.</p>
                <p className="mt-1 text-sm text-muted-foreground">Essayez d'élargir vos filtres ou changez de catégorie.</p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>Réinitialiser</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function labelize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
