import { Link, useLocation } from "wouter";
import { ShoppingCart, User as UserIcon, Search, Menu, LogOut, Store, Shield, X } from "lucide-react";
import { useState } from "react";
import { useGetMyProfile, useGetMyCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { loginUrl } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
  { href: "/products?categorySlug=artisanat", label: "Artisanat" },
  { href: "/products?categorySlug=electromenager", label: "Électroménager" },
  { href: "/products?categorySlug=high-tech", label: "High-Tech" },
];

export function Header() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const profileQ = useGetMyProfile();
  const cartQ = useGetMyCart();

  const profile = profileQ.data;
  const isAuth = !!profile?.user;
  const isVendor = profile?.role === "vendor" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";
  const cartCount = cartQ.data?.itemCount ?? 0;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) {
      setLocation("/products");
    } else {
      setLocation(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="moroccan-gradient h-1 w-full" />
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" data-testid="link-home">
          <div className="moroccan-gradient flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-md">
            <span className="font-serif text-lg font-bold">S</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold tracking-tight">
              souk<span className="text-primary">MA</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Marketplace marocaine</span>
          </div>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block" data-testid="form-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un caftan, une machine à café, un tapis…"
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.slice(0, 2).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover-elevate"
              data-testid={`link-nav-${n.label.toLowerCase()}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/cart" data-testid="link-cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {profile?.user?.firstName ?? profile?.user?.email ?? "Mon compte"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.role === "admin" && "Administrateur"}
                      {profile?.role === "vendor" && "Vendeur"}
                      {profile?.role === "customer" && "Client"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/orders")} data-testid="menu-orders">
                  Mes commandes
                </DropdownMenuItem>
                {isVendor ? (
                  <DropdownMenuItem onClick={() => setLocation("/vendor")} data-testid="menu-vendor">
                    <Store className="mr-2 h-4 w-4" /> Espace vendeur
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setLocation("/vendor/onboarding")} data-testid="menu-become-vendor">
                    <Store className="mr-2 h-4 w-4" /> Devenir vendeur
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} data-testid="menu-admin">
                    <Shield className="mr-2 h-4 w-4" /> Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button onClick={() => { localStorage.removeItem("auth_token"); window.location.href = "/"; }} data-testid="link-logout" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
              <a href="/login" data-testid="link-login">Se connecter</a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            data-testid="button-mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 lg:hidden">
          <form onSubmit={submitSearch} className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit"
                className="pl-9"
              />
            </div>
          </form>
          <nav className="grid gap-1 px-4 pb-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover-elevate"
              >
                {n.label}
              </Link>
            ))}
            {!isAuth && (
              <a
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-primary hover-elevate"
              >
                Se connecter
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
