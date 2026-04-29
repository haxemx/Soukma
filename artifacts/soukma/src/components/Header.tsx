import { Link, useLocation } from "wouter";
import { ShoppingCart, User as UserIcon, Search, Menu, LogOut, Store, Shield, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyProfile, useGetMyCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
  { href: "/products?categorySlug=artisanat", label: "Artisanat" },
  { href: "/products?categorySlug=electromenager", label: "Électroménager" },
  { href: "/products?categorySlug=high-tech", label: "High-Tech" },
];

function MoroccanLantern({ color, delay, x }: { color: string; delay: number; x: number }) {
  return (
    <motion.div
      style={{ position: "absolute", top: 0, left: x, transformOrigin: "top center", pointerEvents: "none", zIndex: 0 }}
      animate={{ rotate: [-7, 7, -7] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="32" height="70" viewBox="0 0 32 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Crochet/anneau de suspension */}
        <path d="M16 0 Q20 0 20 4 Q20 7 16 7 Q12 7 12 4 Q12 0 16 0 Z" stroke="#92400e" strokeWidth="1.2" fill="none"/>
        <line x1="16" y1="7" x2="16" y2="11" stroke="#92400e" strokeWidth="1.5"/>
        {/* Couronne haut - style marocain avec pointe */}
        <path d="M10 11 L12 9 L14 11 L16 8 L18 11 L20 9 L22 11 L22 15 L10 15 Z" fill={color}/>
        <path d="M10 15 L22 15 L23 18 L9 18 Z" fill={color} fillOpacity="0.8"/>
        {/* Corps octogonal */}
        <path d="M9 18 L8 22 L8 42 L9 46 L23 46 L24 42 L24 22 L23 18 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1"/>
        {/* Panneaux de verre colorés */}
        <path d="M10 20 L10 44 L16 44 L16 20 Z" fill={color} fillOpacity="0.4"/>
        <path d="M16 20 L16 44 L22 44 L22 20 Z" fill={color} fillOpacity="0.3"/>
        {/* Motifs arabesque fer forgé - rosace centrale */}
        <circle cx="16" cy="32" r="5" stroke={color} strokeWidth="1" fill="none" fillOpacity="0"/>
        <circle cx="16" cy="32" r="3" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.3"/>
        {/* Étoile à 8 branches marocaine */}
        <path d="M16 26 L17 29 L20 29 L18 31 L19 34 L16 32 L13 34 L14 31 L12 29 L15 29 Z" fill={color} fillOpacity="0.7"/>
        {/* Grille arabesque */}
        <path d="M9 22 L23 22" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        <path d="M9 27 L23 27" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        <path d="M9 37 L23 37" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        <path d="M9 42 L23 42" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        <line x1="13" y1="20" x2="13" y2="44" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        <line x1="19" y1="20" x2="19" y2="44" stroke={color} strokeWidth="0.5" opacity="0.6"/>
        {/* Arcs décoratifs */}
        <path d="M10 22 Q13 20 16 22 Q19 20 22 22" stroke={color} strokeWidth="0.7" fill="none"/>
        <path d="M10 42 Q13 44 16 42 Q19 44 22 42" stroke={color} strokeWidth="0.7" fill="none"/>
        {/* Socle bas */}
        <path d="M9 46 L23 46 L22 50 L10 50 Z" fill={color} fillOpacity="0.8"/>
        <path d="M10 50 L12 48 L14 50 L16 47 L18 50 L20 48 L22 50" stroke={color} strokeWidth="0.8" fill="none"/>
        {/* Pendeloque */}
        <line x1="16" y1="50" x2="16" y2="56" stroke="#92400e" strokeWidth="1"/>
        <ellipse cx="16" cy="58" rx="3" ry="4" fill={color} fillOpacity="0.8"/>
        <ellipse cx="16" cy="62" rx="2" ry="2.5" fill={color} fillOpacity="0.5"/>
        <circle cx="16" cy="65" r="1.5" fill={color} fillOpacity="0.4"/>
        {/* Lueur interne flamme */}
        <ellipse cx="16" cy="32" rx="3.5" ry="5" fill="#fef08a" fillOpacity="0.2"/>
      </svg>
    </motion.div>
  );
}


const LANTERNS = [
  { color: "#b45309", delay: 0,   x: -320 },
  { color: "#dc2626", delay: 0.5, x: -284 },
  { color: "#7c3aed", delay: 1.0, x: -248 },
  { color: "#b45309", delay: 0.3, x: -212 },
  { color: "#059669", delay: 1.4, x: -176 },
  { color: "#dc2626", delay: 0.8, x: -140 },
  { color: "#7c3aed", delay: 0.2, x: -104 },
  { color: "#b45309", delay: 1.2, x: -68  },
  { color: "#059669", delay: 0.6, x: -32  },
];

export function Header() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileQ = useGetMyProfile();
  const cartQ = useGetMyCart();
  const profile = profileQ.data;
  const isAuth = !!profile?.user;
  const isVendor = profile?.role === "vendor" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";
  const cartCount = cartQ.data?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) setLocation("/products");
    else setLocation(`/products?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <motion.header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-border shadow-lg bg-background/95 backdrop-blur-xl" : "bg-background/80 backdrop-blur-md"}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="moroccan-gradient h-1 w-full" />

      {/* Lanternes marocaines */}
      <div style={{ position: "relative", height: "34px", overflow: "visible", pointerEvents: "none", marginBottom: "-20px" }}>
        <div style={{ position: "absolute", right: 0, top: 0, width: "320px" }}>
          {LANTERNS.map((l, i) => (
            <MoroccanLantern key={i} color={l.color} delay={l.delay} x={320 + l.x} />
          ))}
        </div>
      </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 group" data-testid="link-home">
          <motion.div
            className="moroccan-gradient flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="font-serif text-lg font-bold">S</span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
              souk<span className="text-primary">MA</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Marketplace marocaine</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={submitSearch} className="hidden flex-1 md:block" data-testid="form-search">
          <motion.div
            className="relative"
            animate={{ scale: searchFocused ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? "text-primary" : "text-muted-foreground"}`} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Rechercher un caftan, une machine à café, un tapis…"
              className={`pl-9 transition-all duration-200 ${searchFocused ? "ring-2 ring-primary/30 border-primary" : ""}`}
              data-testid="input-search"
            />
          </motion.div>
        </form>

        {/* Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.slice(0, 2).map((n) => (
            <Link key={n.href} href={n.href}>
              <motion.span
                className={`relative block rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${location === n.href ? "text-primary" : "text-foreground/80 hover:text-foreground"}`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                {n.label}
                {location === n.href && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary"
                    layoutId="nav-indicator"
                  />
                )}
              </motion.span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/cart" data-testid="link-cart">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1"
                    >
                      <Badge className="h-5 min-w-5 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                        {cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </Link>

          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-user-menu">
                    <div className="moroccan-gradient h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {profile?.user?.firstName?.[0]?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.user?.firstName ?? profile?.user?.email ?? "Mon compte"}</span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.role === "admin" && "Administrateur"}
                      {profile?.role === "vendor" && "Vendeur"}
                      {profile?.role === "customer" && "Client"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/orders")} className="cursor-pointer">Mes commandes</DropdownMenuItem>
                {isVendor ? (
                  <DropdownMenuItem onClick={() => setLocation("/vendor")} className="cursor-pointer">
                    <Store className="mr-2 h-4 w-4" /> Espace vendeur
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setLocation("/vendor/onboarding")} className="cursor-pointer">
                    <Store className="mr-2 h-4 w-4" /> Devenir vendeur
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" /> Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button onClick={() => { localStorage.removeItem("auth_token"); window.location.href = "/"; }} className="flex w-full items-center cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="default" size="sm" className="hidden md:inline-flex gap-1">
                <a href="/login" data-testid="link-login">
                  <Sparkles className="h-3.5 w-3.5" />
                  Se connecter
                </a>
              </Button>
            </motion.div>
          )}

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background/95 lg:hidden"
          >
            <form onSubmit={submitSearch} className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit" className="pl-9" />
              </div>
            </form>
            <nav className="grid gap-1 px-4 pb-4">
              {NAV.map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={n.href} onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              {!isAuth && (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: NAV.length * 0.05 }}>
                  <a href="/login" className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                    Se connecter
                  </a>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
