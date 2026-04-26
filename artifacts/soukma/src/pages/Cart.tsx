import { Link } from "wouter";
import {
  useGetMyCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearMyCart,
  getGetMyCartQueryKey,
  useGetMyProfile,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMAD } from "@/lib/format";
import { loginUrl } from "@/lib/auth";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const cartQ = useGetMyCart();
  const profileQ = useGetMyProfile();
  const isAuth = !!profileQ.data?.user;
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetMyCartQueryKey() });

  const updateItem = useUpdateCartItem({ mutation: { onSuccess: invalidate } });
  const removeItem = useRemoveCartItem({ mutation: { onSuccess: invalidate } });
  const clear = useClearMyCart({ mutation: { onSuccess: invalidate } });

  const cart = cartQ.data;

  if (!isAuth) {
    return (
      <Layout>
        <Empty
          title="Connectez-vous pour voir votre panier"
          subtitle="Vos articles sont sauvegardés et liés à votre compte."
          actionLabel="Se connecter"
          onAction={() => (window.location.href = loginUrl("/cart"))}
        />
      </Layout>
    );
  }

  if (cartQ.isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
          <Skeleton className="h-10 w-48" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <Empty
          title="Votre panier est vide"
          subtitle="Parcourez le catalogue pour découvrir des produits qui vont vous plaire."
          actionLabel="Voir le catalogue"
          actionHref="/products"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mon panier</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
              {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clear.mutate()}
            disabled={clear.isPending}
            data-testid="button-clear-cart"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Vider
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-3">
            {cart.items.map((it) => (
              <li
                key={it.id}
                data-testid={`row-cart-item-${it.id}`}
                className="grid grid-cols-[80px_1fr_auto] gap-4 rounded-xl border border-card-border bg-card p-3 sm:grid-cols-[100px_1fr_auto]"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <ProductImage src={it.productImage ?? undefined} alt={it.productTitle} className="h-full w-full object-cover" iconSize={28} />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/products/${it.productId}`}
                    className="line-clamp-2 font-medium hover:text-primary"
                    data-testid={`link-cart-product-${it.id}`}
                  >
                    {it.productTitle}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMAD(it.unitPrice)} <span className="text-muted-foreground/60">/ unité</span>
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-input">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateItem.mutate({ itemId: it.id, data: { quantity: Math.max(1, it.quantity - 1) } })}
                        data-testid={`button-decrement-${it.id}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`text-qty-${it.id}`}>{it.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateItem.mutate({ itemId: it.id, data: { quantity: Math.min(99, it.quantity + 1) } })}
                        data-testid={`button-increment-${it.id}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem.mutate({ itemId: it.id })}
                      data-testid={`button-remove-${it.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="self-start text-right">
                  <p className="font-serif text-lg font-semibold text-primary" data-testid={`text-line-total-${it.id}`}>
                    {formatMAD(it.lineTotal)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-card-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-semibold">Récapitulatif</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium" data-testid="text-subtotal">{formatMAD(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="text-muted-foreground">Calculée à l'étape suivante</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-medium">Total estimé</span>
              <span className="font-serif text-2xl font-semibold text-primary" data-testid="text-cart-total">
                {formatMAD(cart.subtotal)}
              </span>
            </div>
            <Button asChild size="lg" className="mt-5 w-full" data-testid="button-checkout">
              <Link href="/checkout">
                Passer à la caisse <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/products">Continuer mes achats</Link>
            </Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function Empty({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
      {actionHref ? (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : (
        <Button className="mt-6" onClick={onAction} data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
