import { useEffect } from "react";
import { useSearch } from "wouter";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { loginUrl } from "@/lib/auth";
import { LogIn, ShoppingBag, Truck, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const profileQ = useGetMyProfile();
  const search = useSearch();
  const returnTo = new URLSearchParams(search).get("returnTo") ?? "/";

  useEffect(() => {
    if (profileQ.data?.user) {
      window.location.replace(returnTo);
    }
  }, [profileQ.data, returnTo]);

  return (
    <Layout>
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mon compte</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
            Bienvenue sur soukMA
          </h1>
          <p className="mt-3 text-muted-foreground">
            Connectez-vous en un clic avec votre compte Replit pour suivre vos commandes,
            sauvegarder votre panier et profiter d'une expérience personnalisée.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <ShoppingBag className="mt-0.5 h-5 w-5 text-primary" />
              <span>Sauvegardez votre panier sur tous vos appareils.</span>
            </li>
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-primary" />
              <span>Suivez l'avancement de vos commandes en temps réel.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <span>Connexion sécurisée — aucun mot de passe à retenir.</span>
            </li>
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-8 shadow-lg">
          <div className="moroccan-gradient absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-40 blur-3xl" />
          <div className="relative">
            <h2 className="font-serif text-2xl font-semibold">Se connecter</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Utilise votre compte Replit pour entrer dans la marketplace.
            </p>
            <Button asChild size="lg" className="mt-6 w-full" data-testid="button-login">
              <a href={loginUrl(returnTo)}>
                <LogIn className="mr-2 h-4 w-4" /> Continuer avec Replit
              </a>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              En vous connectant, vous acceptez les conditions générales d'utilisation
              et la politique de confidentialité de soukMA.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
