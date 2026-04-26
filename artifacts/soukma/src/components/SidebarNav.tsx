import { Link, useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function SidebarNav({
  title,
  items,
}: {
  title: string;
  items: SidebarItem[];
}) {
  const [location] = useLocation();
  return (
    <nav className="rounded-xl border border-card-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = location === it.href || (it.href !== "/" && location.startsWith(it.href));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                data-testid={`sidebar-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover-elevate ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground/80"
                }`}
              >
                <Icon className="h-4 w-4" /> {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
