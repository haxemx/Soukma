import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { HeaderTabs } from "@/components/HeaderTabs";
import { MobileMenu } from "@/components/MobileMenu";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-serif text-2xl font-bold text-primary">soukMA</span>
          </div>
        </Link>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <HeaderTabs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Catalogue", href: "/products" },
              { label: "Artisanat", href: "/products?category=artisanat" },
              { label: "High-Tech", href: "/products?category=high-tech" },
            ]}
            isActive={isActive}
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <div className="relative cursor-pointer">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {itemCount}
                </span>
              )}
            </div>
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </motion.header>
  );
}
