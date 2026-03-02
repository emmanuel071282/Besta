import { Link } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  // Pick some items for the "trending" section
  const trendingProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-secondary overflow-hidden pt-20">
        {/* landing page hero fashion aesthetic */}
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Hero" 
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-white text-xs font-semibold tracking-[0.3em] uppercase mb-4 opacity-90">
            Fall/Winter Collection
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tighter mb-8 max-w-4xl leading-none">
            THE NEW MINIMAL.
          </h1>
          <div className="flex gap-4">
            <Link 
              href="/category/Ladies" 
              className="bg-white text-black px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-white/90 transition-colors"
            >
              Shop Ladies
            </Link>
            <Link 
              href="/category/Mens" 
              className="bg-transparent border border-white text-white px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors backdrop-blur-sm"
            >
              Shop Mens
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 md:py-32 container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/category/Accessories" className="group relative aspect-[4/5] overflow-hidden bg-secondary">
            {/* minimal accessories */}
            <img 
              src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1000&auto=format&fit=crop" 
              alt="Accessories" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8">
              <h2 className="text-white text-2xl font-display font-medium tracking-tight mb-2">Accessories</h2>
              <span className="text-white/80 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Discover <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/category/Kids" className="group relative aspect-[4/5] overflow-hidden bg-secondary">
            {/* kids fashion */}
            <img 
              src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop" 
              alt="Kids" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8">
              <h2 className="text-white text-2xl font-display font-medium tracking-tight mb-2">Kids</h2>
              <span className="text-white/80 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Discover <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          
          <Link href="/category/Footwear" className="group relative aspect-[4/5] overflow-hidden bg-secondary md:col-span-2 lg:col-span-1">
            {/* fashion footwear */}
            <img 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop" 
              alt="Footwear" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8">
              <h2 className="text-white text-2xl font-display font-medium tracking-tight mb-2">Footwear</h2>
              <span className="text-white/80 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
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
        
        {/* Mobile View All */}
        <div className="mt-12 text-center sm:hidden">
          <Link href="/category/Ladies" className="inline-block border border-foreground px-8 py-3 text-xs uppercase tracking-widest font-semibold w-full">
            View All Trending
          </Link>
        </div>
      </section>
    </div>
  );
}
