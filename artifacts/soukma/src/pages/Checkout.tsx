import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useGetMyCart,
  useGetMyProfile,
  usePlaceOrder,
  useInitiatePayment,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { formatMAD, paymentLabel } from "@/lib/format";
import { loginUrl } from "@/lib/auth";
import { CreditCard, Banknote, Building2, ShoppingBag, ChevronLeft } from "lucide-react";

const SHIPPING_FEE = 30;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const cartQ = useGetMyCart();
  const profileQ = useGetMyProfile();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cmi" | "cih_pay" | "cash_on_delivery">("cmi");

  const placeOrder = usePlaceOrder();
  const initiatePay = useInitiatePayment();

  const cart = cartQ.data;
  const isAuth = !!profileQ.data?.user;

  if (!isAuth) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold">Connectez-vous pour finaliser votre commande.</h1>
          <Button className="mt-6" onClick={() => (window.location.href = loginUrl("/checkout"))}>
            Se connecter
          </Button>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl font-semibold">Votre panier est vide.</h1>
          <Button asChild className="mt-6">
            <Link href="/products">Découvrir le catalogue</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !city || !address) {
      toast({ title: "Champs requis", description: "Renseignez vos coordonnées de livraison.", variant: "destructive" });
      return;
    }
    try {
      const order = await placeOrder.mutateAsync({
        data: {
          paymentMethod,
          shipping: {
            fullName,
            phone,
            city,
            address,
            notes: notes || undefined,
          },
        },
      });

      if (paymentMethod === "cash_on_delivery") {
        setLocation(`/orders/${order.id}?placed=1`);
        return;
      }

      // Lancer la session de paiement (CMI ou CIH Pay) — placeholder.
      const pay = await initiatePay.mutateAsync({ data: { orderId: order.id } });
      // REMPLACER ICI: rediriger vers pay.redirectUrl externe quand l'intégration sera réelle.
      setLocation(`/checkout/${order.id}/pay?session=${pay.sessionId}&provider=${pay.provider}`);
    } catch (err: any) {
      toast({
        title: "Commande impossible",
        description: err?.message ?? "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  }

  const total = cart.subtotal + SHIPPING_FEE;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <button
          onClick={() => setLocation("/cart")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Retour au panier
        </button>
        <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Finaliser ma commande</h1>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-card-border bg-card p-5">
              <h2 className="font-serif text-xl font-semibold">Adresse de livraison</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required data-testid="input-name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} required data-testid="input-phone" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input id="address" placeholder="N° 12, Rue Ibn Sina, quartier…" value={address} onChange={(e) => setAddress(e.target.value)} required data-testid="input-address" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ville *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required data-testid="input-city" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">Instructions de livraison</Label>
                  <Textarea id="notes" placeholder="Étage, code, horaire…" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-card-border bg-card p-5">
              <h2 className="font-serif text-xl font-semibold">Mode de paiement</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as any)}
                className="mt-4 grid gap-3"
              >
                <PaymentOption
                  value="cmi"
                  selected={paymentMethod === "cmi"}
                  icon={<CreditCard className="h-5 w-5 text-primary" />}
                  title="Carte bancaire CMI"
                  subtitle="Visa, Mastercard, CMI 3D-Secure"
                />
                <PaymentOption
                  value="cih_pay"
                  selected={paymentMethod === "cih_pay"}
                  icon={<Building2 className="h-5 w-5 text-primary" />}
                  title="CIH Pay"
                  subtitle="Paiement via votre application CIH"
                />
                <PaymentOption
                  value="cash_on_delivery"
                  selected={paymentMethod === "cash_on_delivery"}
                  icon={<Banknote className="h-5 w-5 text-primary" />}
                  title="Paiement à la livraison"
                  subtitle="Réglez en espèces à la réception"
                />
              </RadioGroup>
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                {/* REMPLACER ICI: intégration réelle CMI/CIH Pay (HMAC-SHA512, callback IPN). */}
                Démo : un écran simulera l'écran bancaire avant validation.
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-xl border border-card-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-semibold">Votre commande</h2>
            <ul className="mt-4 divide-y divide-border">
              {cart.items.map((it) => (
                <li key={it.id} className="flex items-start gap-3 py-3 text-sm">
                  <div className="flex-1">
                    <p className="line-clamp-1 font-medium">{it.productTitle}</p>
                    <p className="text-xs text-muted-foreground">x{it.quantity}</p>
                  </div>
                  <span className="font-medium">{formatMAD(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatMAD(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>{formatMAD(SHIPPING_FEE)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-medium">Total</span>
              <span className="font-serif text-2xl font-semibold text-primary" data-testid="text-checkout-total">{formatMAD(total)}</span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={placeOrder.isPending || initiatePay.isPending}
              data-testid="button-place-order"
            >
              {placeOrder.isPending || initiatePay.isPending
                ? "Traitement…"
                : paymentMethod === "cash_on_delivery"
                  ? "Confirmer la commande"
                  : `Payer ${formatMAD(total)}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              En passant commande, vous acceptez les conditions générales de vente de soukMA.
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Méthode sélectionnée : <span className="font-medium">{paymentLabel(paymentMethod)}</span>
            </p>
          </aside>
        </form>
      </div>
    </Layout>
  );
}

function PaymentOption({
  value,
  selected,
  icon,
  title,
  subtitle,
}: {
  value: string;
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Label
      htmlFor={`pay-${value}`}
      data-testid={`option-payment-${value}`}
      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition hover-elevate ${
        selected ? "border-primary bg-primary/5" : "border-border bg-background"
      }`}
    >
      <RadioGroupItem id={`pay-${value}`} value={value} />
      {icon}
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Label>
  );
}
