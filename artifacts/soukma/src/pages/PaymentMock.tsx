import { useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { useConfirmPayment } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Lock } from "lucide-react";

/**
 * Page simulée du portail bancaire CMI / CIH Pay.
 * REMPLACER ICI: en production, cette page n'existe pas — l'utilisateur sera
 * redirigé directement vers `https://payment.cmi.co.ma/...` ou CIH Pay,
 * et la confirmation se fera côté serveur via l'IPN du fournisseur.
 */
export default function PaymentMockPage() {
  const params = useParams();
  const search = useSearch();
  const sp = new URLSearchParams(search);
  const sessionId = sp.get("session") ?? "";
  const provider = sp.get("provider") ?? "cmi";
  const orderId = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [card, setCard] = useState("4111 1111 1111 1111");
  const [exp, setExp] = useState("12/29");
  const [cvv, setCvv] = useState("123");
  const confirm = useConfirmPayment();

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    try {
      await confirm.mutateAsync({ data: { orderId, sessionId } });
      setLocation(`/orders/${orderId}?placed=1`);
    } catch (err: any) {
      toast({
        title: "Paiement refusé",
        description: err?.message ?? "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <div className="moroccan-gradient flex h-10 w-10 items-center justify-center rounded-lg text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Portail sécurisé · {provider === "cih_pay" ? "CIH Pay" : "CMI"}
              </p>
              <h1 className="font-serif text-lg font-semibold">Paiement 3D-Secure</h1>
            </div>
          </div>
          <form onSubmit={pay} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Numéro de carte</Label>
              <Input value={card} onChange={(e) => setCard(e.target.value)} data-testid="input-card" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Expiration</Label>
                <Input value={exp} onChange={(e) => setExp(e.target.value)} data-testid="input-exp" />
              </div>
              <div className="space-y-1.5">
                <Label>CVV</Label>
                <Input value={cvv} onChange={(e) => setCvv(e.target.value)} data-testid="input-cvv" />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={confirm.isPending} data-testid="button-confirm-payment">
              {confirm.isPending ? "Traitement…" : "Valider le paiement"}
            </Button>
            <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Connexion chiffrée — démo
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
