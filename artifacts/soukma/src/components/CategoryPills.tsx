import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";

export function CategoryPills({ activeSlug }: { activeSlug?: string }) {
  const q = useListCategories();
  const cats = q.data ?? [];
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
      <PillLink href="/products" active={!activeSlug} label="Tous" />
      {cats.map((c) => (
        <PillLink
          key={c.slug}
          href={`/products?categorySlug=${c.slug}`}
          active={activeSlug === c.slug}
          label={c.name}
          count={c.productCount}
        />
      ))}
    </div>
  );
}

function PillLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => setLocation(href)}
      data-testid={`pill-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition hover-elevate ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/80"
      }`}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span className={`ml-2 text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
