import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="moroccan-gradient flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg">
          <Compass className="h-10 w-10" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">Erreur 404</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Vous vous êtes perdu·e dans le souk.
        </h1>
        <p className="mt-3 text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Voir le catalogue</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
