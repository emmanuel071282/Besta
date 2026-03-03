import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logoBesta from "@assets/photo_2025-11-29_23.46.39_copy_1772478243583.jpeg";

const CATEGORIES = ["Mens", "Ladies", "Kids", "Accessories", "Footwear"];

export function Navbar() {
  const [location] = useLocation();
  const { itemCount: cartCount, setIsOpen: setCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat} 
              href={`/category/${cat}`}
              className={cn(
                "text-xs uppercase tracking-widest font-medium transition-colors hover:text-foreground",
                location === `/category/${cat}` ? "text-foreground border-b border-foreground pb-1" : "text-muted-foreground"
              )}
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link 
          href="/" 
          className="font-display text-2xl md:text-3xl font-bold tracking-tighter text-center flex-1 md:flex-none"
        >
          BESTA
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-6 flex-1">
          <button className="hidden sm:block p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/wishlist">
            <a className="p-2 relative text-foreground hover:opacity-70 transition-opacity">
              <Heart className={cn("w-5 h-5", wishlistItems.length > 0 && "fill-foreground")} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                  {wishlistItems.length}
                </span>
              )}
            </a>
          </Link>

          <button 
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-display text-xl font-bold tracking-tighter">BESTA</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col py-8 px-6 gap-6">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat} 
                href={`/category/${cat}`}
                className="text-2xl font-display font-light tracking-tight hover:pl-2 transition-all"
              >
                {cat}
              </Link>
            ))}
            <div className="h-px bg-border my-4" />
            <Link href="/" className="text-sm uppercase tracking-widest text-muted-foreground">Home</Link>
            <Link href="/" className="text-sm uppercase tracking-widest text-muted-foreground">Search</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
