import { Link } from "wouter";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@workspace/api-client-react";
import { formatMAD } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100) : 0;

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/products/${product.id}`}
        data-testid={`link-product-${product.id}`}
        className="group block overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ProductImage
            src={product.imageUrl ?? undefined}
            alt={product.title}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          
          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

          {/* Badges */}
          {discount > 0 && (
            <motion.div className="absolute left-3 top-3" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Badge className="bg-primary text-primary-foreground shadow-lg">-{discount}%</Badge>
            </motion.div>
          )}
          {product.viewCount != null && product.viewCount >= 5 && (
            <Badge className="absolute left-3 bottom-3 bg-orange-500 text-white shadow-lg text-[10px]">🔥 Tendance</Badge>
          )}
          {product.isFeatured && (
            <Badge variant="secondary" className="absolute right-3 top-3 bg-accent text-accent-foreground shadow-lg">
              Coup de cœur
            </Badge>
          )}

          {/* Actions au hover */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <motion.button
              onClick={handleCart}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ${addedToCart ? "bg-green-500 text-white" : "bg-background text-foreground hover:bg-primary hover:text-white"}`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {addedToCart ? "Ajouté !" : "Ajouter"}
            </motion.button>
            <motion.button
              onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
              whileTap={{ scale: 0.85 }}
              className="flex items-center justify-center rounded-full bg-background p-2 shadow-lg hover:bg-red-50 transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </motion.button>
          </div>
        </div>

        <div className="space-y-1.5 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.categoryName ?? ""}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-medium leading-snug text-foreground group-hover:text-primary transition-colors duration-200" data-testid={`text-product-title-${product.id}`}>
            {product.title}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-semibold text-primary" data-testid={`text-product-price-${product.id}`}>
                {formatMAD(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through">{formatMAD(product.compareAtPrice)}</span>
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
    </motion.div>
  );
}
