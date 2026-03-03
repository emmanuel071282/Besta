import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { ShoppingBag, Search, Menu, X, Heart, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SUBCATEGORIES, isGroupedSubcategories } from "@shared/schema";
import type { SubcategorySection } from "@shared/schema";

const CATEGORIES = ["Mens", "Ladies", "Kids", "Accessories", "Footwear"];

export function Navbar() {
  const [location, navigate] = useLocation();
  const { itemCount: cartCount, setIsOpen: setCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedMobileCategory(null);
  }, [location]);

  const renderDesktopDropdown = (cat: string) => {
    const config = SUBCATEGORIES[cat];
    if (!config) return null;

    if (isGroupedSubcategories(config)) {
      return (
        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="bg-background border border-border shadow-lg py-4 px-6 flex gap-8 min-w-[480px]">
            {(config as SubcategorySection[]).map((group) => (
              <div key={group.section} className="min-w-[120px]">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-foreground mb-3">
                  {group.section}
                </span>
                {group.items.map((sub) => (
                  <button
                    key={sub}
                    data-testid={`nav-subcategory-${cat.toLowerCase()}-${sub.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => navigate(`/category/${cat}?sub=${encodeURIComponent(sub)}`)}
                    className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-background border border-border shadow-lg min-w-[200px] py-3">
          <Link
            href={`/category/${cat}`}
            className="block px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            View All {cat}
          </Link>
          <div className="h-px bg-border mx-4 my-2" />
          {(config as string[]).map((sub) => (
            <button
              key={sub}
              data-testid={`nav-subcategory-${cat.toLowerCase()}-${sub.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => navigate(`/category/${cat}?sub=${encodeURIComponent(sub)}`)}
              className="block w-full text-left px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {sub}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMobileSubmenu = (cat: string) => {
    const config = SUBCATEGORIES[cat];
    if (!config || expandedMobileCategory !== cat) return null;

    if (isGroupedSubcategories(config)) {
      return (
        <div className="pb-4 pl-4 space-y-4">
          {(config as SubcategorySection[]).map((group) => (
            <div key={group.section}>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-foreground mb-2">
                {group.section}
              </span>
              <div className="space-y-1 pl-2">
                {group.items.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      navigate(`/category/${cat}?sub=${encodeURIComponent(sub)}`);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="pb-4 pl-4 space-y-1">
        {(config as string[]).map((sub) => (
          <button
            key={sub}
            onClick={() => {
              navigate(`/category/${cat}?sub=${encodeURIComponent(sub)}`);
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {sub}
          </button>
        ))}
      </div>
    );
  };

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background/90 backdrop-blur-md border-border py-4 shadow-sm" 
          : "bg-background border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <button 
          data-testid="button-mobile-menu"
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="relative group">
              <Link 
                href={`/category/${cat}`}
                className={cn(
                  "text-xs uppercase tracking-widest font-medium transition-colors hover:text-foreground py-2",
                  location.startsWith(`/category/${cat}`) ? "text-foreground border-b border-foreground" : "text-muted-foreground"
                )}
              >
                {cat}
              </Link>
              {renderDesktopDropdown(cat)}
            </div>
          ))}
        </nav>

        <Link 
          href="/" 
          className="font-display text-2xl md:text-3xl font-bold tracking-tighter text-center flex-1 md:flex-none"
        >
          BESTA
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-6 flex-1">
          <button className="hidden sm:block p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/wishlist" className="p-2 relative text-foreground hover:opacity-70 transition-opacity">
            <Heart className={cn("w-5 h-5", wishlistItems.length > 0 && "fill-foreground")} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <button 
            data-testid="button-cart"
            className="p-2 relative text-foreground hover:opacity-70 transition-opacity"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-display text-xl font-bold tracking-tighter">BESTA</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2" data-testid="button-close-mobile-menu">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-6">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/category/${cat}`}
                    className="flex-1 text-xl font-display font-light tracking-tight py-4"
                  >
                    {cat}
                  </Link>
                  {SUBCATEGORIES[cat] && (
                    <button
                      onClick={() => setExpandedMobileCategory(expandedMobileCategory === cat ? null : cat)}
                      className="p-3"
                    >
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        expandedMobileCategory === cat && "rotate-180"
                      )} />
                    </button>
                  )}
                </div>
                {renderMobileSubmenu(cat)}
              </div>
            ))}
            <div className="mt-6 space-y-4">
              <Link href="/" className="block text-sm uppercase tracking-widest text-muted-foreground py-2">Home</Link>
              <Link href="/wishlist" className="block text-sm uppercase tracking-widest text-muted-foreground py-2">Wishlist</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
