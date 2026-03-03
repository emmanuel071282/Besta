import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  const trendingProducts = products?.slice(0, 4) || [];

  const bestSellerNames = [
    "High-Rise Skinny Jeans",
    "Relaxed Fit Women's T-Shirt",
    "Classic Oxford Shirt",
    "Embroidered Anarkali Kurta",
    "White Canvas Sneakers",
    "Cotton Printed Kurta",
    "Slim Fit Chinos",
    "Boys Dinosaur Print Tee",
  ];
  const bestSellers = products
    ?.filter((p) => bestSellerNames.includes(p.name))
    .slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-secondary overflow-hidden pt-20">
        <div className="absolute inset-0 flex">
          <div className="relative flex-1">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop" 
              alt="Ladies Fashion" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
          <div className="relative flex-1 hidden md:block border-l border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000&auto=format&fit=crop" 
              alt="Mens Fashion" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
          <div className="relative flex-1 hidden lg:block border-l border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop" 
              alt="Kids Fashion" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold text-white tracking-tighter leading-none">
            BESTA
          </h1>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 md:py-32 container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link href="/category/Kids" className="group relative aspect-[4/5] overflow-hidden bg-secondary">
            <img 
              src="https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=1000&auto=format&fit=crop" 
              alt="Kids" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <h2 className="text-white text-xl md:text-2xl font-display font-medium tracking-tight mb-2">Kids</h2>
              <span className="text-white/80 text-[10px] md:text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Discover <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/category/Accessories" className="group relative aspect-[4/5] overflow-hidden bg-secondary">
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop" 
              alt="Accessories" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <h2 className="text-white text-xl md:text-2xl font-display font-medium tracking-tight mb-2">Accessories</h2>
              <span className="text-white/80 text-[10px] md:text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Discover <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          
          <Link href="/category/Footwear" className="group relative aspect-[4/5] overflow-hidden bg-secondary col-span-2 lg:col-span-1">
            <img 
              src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop" 
              alt="Footwear" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <h2 className="text-white text-xl md:text-2xl font-display font-medium tracking-tight mb-2">Footwear</h2>
              <span className="text-white/80 text-[10px] md:text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Discover <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Trending Products */}
      <section className="pb-24 container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Trending Now</h2>
          <Link href="/category/Ladies" className="text-xs uppercase tracking-widest font-semibold hover:text-muted-foreground transition-colors hidden sm:block">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {isLoading 
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : trendingProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
        
        <div className="mt-12 text-center sm:hidden">
          <Link href="/category/Ladies" className="inline-block border border-foreground px-8 py-3 text-xs uppercase tracking-widest font-semibold w-full">
            View All Trending
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="pb-24 container mx-auto px-4 md:px-6" data-testid="section-best-sellers">
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight" data-testid="text-best-sellers-title">Best Sellers</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
      </section>
    </div>
  );
}
