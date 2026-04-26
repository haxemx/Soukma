import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetMyProfile,
  useBecomeVendor,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { loginUrl } from "@/lib/auth";
import { Store, TrendingUp, Globe, Wallet } from "lucide-react";

export default function VendorOnboardingPage() {
  const [, setLocation] = useLocation();
  const profileQ = useGetMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [description, setDescription] = useState("");

  const become = useBecomeVendor({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        toast({ title: "Boutique créée", description: "Bienvenue parmi les vendeurs soukMA." });
        setLocation("/vendor");
      },
      onError: (err: any) =>
        toast({
          title: "Erreur",
          description: err?.message ?? "Création impossible.",
          variant: "destructive",
        }),
    },
  });

  if (profileQ.isLoading) {
    return <Layout><div className="mx-auto max-w-3xl px-4 py-10">Chargement…</div></Layout>;
  }
  if (!profileQ.data?.user) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Connectez-vous pour créer votre boutique.</h1>
          <Button className="mt-6" onClick={() => (window.location.href = loginUrl("/vendor/onboarding"))}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }
  if (profileQ.data?.role === "vendor" || profileQ.data?.role === "admin") {
    setLocation("/vendor");
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    become.mutate({ data: { shopName, phone, city, description: description || undefined } });
  }

  return (
    <Layout>
      <section className="zellige-pattern border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Espace vendeur</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
            Lancez votre boutique en quelques minutes
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Rejoignez des centaines de vendeurs et artisans qui développent leur activité
            sur soukMA. Pas de frais d'inscription, vous ne payez qu'une commission sur les ventes.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        <form onSubmit={submit} className="rounded-xl border border-card-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Informations de la boutique</h2>
          <div className="mt-5 grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shop">Nom de la boutique *</Label>
              <Input id="shop" required value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Ex: Atelier Atlas" data-testid="input-shop-name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" data-testid="input-shop-phone" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville *</Label>
                <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} data-testid="input-shop-city" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Présentation de votre activité</Label>
              <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quelques lignes sur ce que vous vendez, votre histoire, vos savoir-faire…" data-testid="input-shop-desc" />
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={become.isPending} data-testid="button-create-shop">
            {become.isPending ? "Création en cours…" : "Créer ma boutique"}
          </Button>
        </form>

        <aside className="space-y-3">
          <Bullet icon={<Store className="h-5 w-5 text-primary" />} title="Boutique vitrine">
            Une page publique pour présenter vos produits et votre marque.
          </Bullet>
          <Bullet icon={<TrendingUp className="h-5 w-5 text-primary" />} title="Visibilité instantanée">
            Vos produits remontent dès l'ajout dans le moteur de recherche soukMA.
          </Bullet>
          <Bullet icon={<Globe className="h-5 w-5 text-primary" />} title="Toute la clientèle marocaine">
            Touchez les acheteurs de Casablanca à Tanger en passant par Marrakech.
          </Bullet>
          <Bullet icon={<Wallet className="h-5 w-5 text-primary" />} title="Versements simples">
            Recevez vos paiements par virement bancaire, sans paperasse inutile.
          </Bullet>
        </aside>
      </div>
    </Layout>
  );
}

function Bullet({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-medium">{title}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
