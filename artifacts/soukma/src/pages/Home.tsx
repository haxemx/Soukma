import { Link } from "wouter";
import { ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";
import {
  useListCategories,
  useListFeaturedProducts,
  useListTrendingProducts,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const featuredQ = useListFeaturedProducts();
  const trendingQ = useListTrendingProducts();
  const catsQ = useListCategories();

  return (
    <Layout>
      <Hero />

      <Section
        eyebrow="Catégories"
        title="Explorer la marketplace"
        subtitle="De l'artisanat traditionnel au high-tech, tout le Maroc en un clic."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catsQ.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            : (catsQ.data ?? []).map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/products?categorySlug=${c.slug}`}
                  data-testid={`link-category-${c.slug}`}
                  className="group relative flex h-28 items-end overflow-hidden rounded-xl border border-card-border bg-card p-4 transition hover-elevate"
                >
                  <div
                    className={`absolute inset-0 opacity-90 ${
                      i % 2 === 0 ? "moroccan-gradient" : "atlas-gradient"
                    }`}
                  />
                  <div className="zellige-pattern absolute inset-0 mix-blend-overlay opacity-30" />
                  <div className="relative">
                    <p className="font-serif text-lg font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-white/85">{c.productCount} produits</p>
                  </div>
                </Link>
              ))}
        </div>
      </Section>

      <Section
        eyebrow="Coups de cœur"
        icon={<Sparkles className="h-4 w-4" />}
        title="Sélection soukMA"
        subtitle="Les produits préférés de notre équipe, soigneusement choisis."
        action={
          <Button asChild variant="outline">
            <Link href="/products" data-testid="link-see-all-featured">
              Tout voir <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <ProductGrid products={featuredQ.data ?? []} loading={featuredQ.isLoading} />
      </Section>

      <ValueProps />

      <Section
        eyebrow="Tendances"
        icon={<TrendingUp className="h-4 w-4" />}
        title="Les plus vendus de la semaine"
        subtitle="Ce que les marocain·es achètent en ce moment sur soukMA."
      >
        <ProductGrid products={trendingQ.data ?? []} loading={trendingQ.isLoading} />
      </Section>

      <VendorCTA />
    </Layout>
  );
}

function Hero() {
  return (
    <section className="zellige-pattern relative overflow-hidden border-b border-border">
      <div className="moroccan-gradient absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl" />
      <div className="atlas-gradient absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-8 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Marketplace 100% marocaine
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Le souk, <span className="text-primary">réinventé</span>
            <br />
            pour le Maroc moderne.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Caftans, électroménager, high-tech, artisanat… Plus de 8 catégories,
            des centaines de marques et d'artisans, livrés partout au Maroc.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="text-base" data-testid="button-hero-explore">
              <Link href="/products">
                Découvrir le catalogue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base" data-testid="button-hero-vendor">
              <Link href="/vendor/onboarding">Vendre sur soukMA</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <Stat value="8+" label="catégories" />
            <Stat value="500+" label="produits" />
            <Stat value="48h" label="livraison express" />
            <Stat value="0 DH" label="frais d'inscription" />
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4">
            <div className="moroccan-gradient col-span-2 row-span-1 rounded-2xl shadow-xl">
              <div className="zellige-pattern h-full w-full rounded-2xl mix-blend-overlay opacity-40" />
            </div>
            <div className="atlas-gradient rounded-2xl shadow-xl">
              <div className="zellige-pattern h-full w-full rounded-2xl mix-blend-overlay opacity-40" />
            </div>
            <div className="rounded-2xl border-4 border-accent bg-card p-6 shadow-xl">
              <p className="font-serif text-2xl font-semibold text-foreground">
                Soutenez les artisans <span className="text-primary">d'ici</span>.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Chaque achat soutient une coopérative ou un commerçant marocain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {icon} {eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({
  products,
  loading,
}: {
  products: { id: string }[] | any[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        Aucun produit disponible pour le moment.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function ValueProps() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-3 lg:px-8">
        <div className="rounded-xl border border-card-border bg-card p-6">
          <Award className="h-7 w-7 text-primary" />
          <h3 className="mt-3 font-serif text-lg font-semibold">Authenticité garantie</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Chaque vendeur est vérifié. Les produits artisanaux sont sourcés directement
            auprès des coopératives.
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-6">
          <TrendingUp className="h-7 w-7 text-primary" />
          <h3 className="mt-3 font-serif text-lg font-semibold">Prix justes en MAD</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pas de surprise au paiement. Les prix affichés sont en dirhams, TVA comprise.
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-6">
          <Sparkles className="h-7 w-7 text-primary" />
          <h3 className="mt-3 font-serif text-lg font-semibold">Expérience moderne</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Recherche fluide, filtres puissants, paiement CMI/CIH Pay et suivi en temps
            réel de vos commandes.
          </p>
        </div>
      </div>
    </section>
  );
}

function VendorCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="atlas-gradient relative overflow-hidden rounded-3xl px-8 py-12 text-white shadow-xl lg:px-16 lg:py-16">
        <div className="zellige-pattern absolute inset-0 mix-blend-overlay opacity-30" />
        <div className="relative grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Vendeurs &amp; Artisans</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Vendez vos créations à tout le Maroc, sans frais d'inscription.
            </h2>
            <p className="mt-3 max-w-2xl text-white/90">
              Créez votre boutique en 2 minutes, gérez vos produits et commandes depuis
              un espace simple, et touchez de nouveaux clients.
            </p>
          </div>
          <div className="lg:text-right">
            <Button asChild size="lg" className="bg-white text-secondary hover:bg-white/90" data-testid="button-cta-vendor">
              <Link href="/vendor/onboarding">
                Ouvrir ma boutique <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
