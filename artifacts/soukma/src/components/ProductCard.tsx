import { Link } from "wouter";
import { Star } from "lucide-react";
import type { Product } from "@workspace/api-client-react";
import { formatMAD } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      data-testid={`link-product-${product.id}`}
      className="group block overflow-hidden rounded-xl border border-card-border bg-card transition hover-elevate active-elevate-2"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage
          src={product.imageUrl ?? undefined}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge
            className="absolute left-3 top-3 bg-primary text-primary-foreground"
            data-testid={`badge-discount-${product.id}`}
          >
            -{discount}%
          </Badge>
        )}
        {product.isFeatured && (
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 bg-accent text-accent-foreground"
          >
            Coup de cœur
          </Badge>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {product.categoryName ?? ""}
        </p>
        <h3
          className="line-clamp-2 min-h-[2.5rem] font-medium leading-snug text-foreground"
          data-testid={`text-product-title-${product.id}`}
        >
          {product.title}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span
              className="font-serif text-lg font-semibold text-primary"
              data-testid={`text-product-price-${product.id}`}
            >
              {formatMAD(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatMAD(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star size={12} className="fill-accent text-accent" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
