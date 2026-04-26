import { Package } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  /**
   * REMPLACER ICI : quand vous fournirez `src` (URL CDN), l'image réelle
   * sera affichée à la place du dégradé décoratif.
   */
  iconSize?: number;
};

export function ProductImage({ src, alt, className, iconSize = 48 }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        data-testid="img-product"
      />
    );
  }
  return (
    <div
      className={`placeholder-product flex items-center justify-center text-foreground/40 ${className ?? ""}`}
      data-testid="img-placeholder"
      role="img"
      aria-label={alt}
    >
      <Package size={iconSize} strokeWidth={1.2} />
    </div>
  );
}
