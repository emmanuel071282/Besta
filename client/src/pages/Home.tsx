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
        <div className="absolute top-20 inset-x-0 bottom-0 flex">
          <div className="relative flex-1">
            <img 
              src="/products/cordset-07-mustard-anarkali.jpeg" 
              alt="Indian Cord Sets — New Launch" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
          <div className="relative flex-1 hidden md:block border-l border-white/20">
            <img 
              src="/products/jewel-02-square-stud-model.png" 
              alt="Gold Statement Jewellery — New Launch" 
              className="absolute inset-0 w-full h-full object-cover object-center"
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
              src="https://images.unsplash.com/photo-1622290319238-b8144c78f3a0?q=80&w=1000&auto=format&fit=crop" 
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
              src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop" 
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
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop" 
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

      {/* New Launches Banner */}
      <section className="pb-20 md:pb-24 container mx-auto px-4 md:px-6" data-testid="section-new-launches">
        <div className="flex items-end justify-between mb-8 md:mb-10 border-b border-border pb-6">
          <div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-muted-foreground block mb-2">
              Just Dropped
            </span>
            <h2 data-testid="text-new-launches-title" className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              New Launches
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link
            href="/category/Ladies?sub=Cord+Sets"
            data-testid="link-launch-cord-sets"
            className="group relative block aspect-[4/5] md:aspect-[4/5] overflow-hidden bg-secondary"
          >
            <img
              src="/products/cordset-07-mustard-anarkali.jpeg"
              alt="Indian Cord Sets Collection"
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="text-white/85 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-2 md:mb-3 block">
                New Drop · Ladies
              </span>
              <h3 className="text-white text-3xl md:text-5xl font-display font-bold tracking-tighter leading-[0.95] mb-2 md:mb-3">
                Indian Cord Sets
              </h3>
              <p className="text-white/90 text-sm md:text-base font-medium mb-4 md:mb-6 max-w-md">
                Festive embroidered kurta sets — starting at ₹899.
              </p>
              <span className="inline-flex items-center gap-2 bg-white text-black px-5 md:px-7 py-2.5 md:py-3 text-xs uppercase tracking-widest font-semibold w-fit group-hover:gap-4 transition-all">
                Shop Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link
            href="/category/Accessories?sub=Jewellery"
            data-testid="link-launch-jewellery"
            className="group relative block aspect-[4/5] md:aspect-[4/5] overflow-hidden bg-secondary"
          >
            <img
              src="/products/jewel-02-square-stud-model.png"
              alt="Gold Jewellery Collection"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="text-white/85 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-2 md:mb-3 block">
                New Drop · Accessories
              </span>
              <h3 className="text-white text-3xl md:text-5xl font-display font-bold tracking-tighter leading-[0.95] mb-2 md:mb-3">
                Gold Statement Jewellery
              </h3>
              <p className="text-white/90 text-sm md:text-base font-medium mb-4 md:mb-6 max-w-md">
                Hammered studs, hoops & teardrops — only ₹299.
              </p>
              <span className="inline-flex items-center gap-2 bg-white text-black px-5 md:px-7 py-2.5 md:py-3 text-xs uppercase tracking-widest font-semibold w-fit group-hover:gap-4 transition-all">
                Shop Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Muscle Tees Promotional Banner */}
      <section className="pb-20 md:pb-24 container mx-auto px-4 md:px-6" data-testid="section-muscle-tees-banner">
        <Link
          href="/category/Mens?sub=Muscle+Tees"
          data-testid="link-muscle-tees-banner"
          className="group relative block w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-secondary"
        >
          <img
            src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1800&auto=format&fit=crop"
            alt="Muscle Tees Collection"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-2xl">
            <span data-testid="text-muscle-tees-eyebrow" className="text-white/80 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-3 md:mb-4">
              New Drop · Mens
            </span>
            <h2 data-testid="text-muscle-tees-title" className="text-white text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.95] mb-3 md:mb-5">
              Muscle Tees
            </h2>
            <p data-testid="text-muscle-tees-tagline" className="text-white/90 text-sm md:text-lg font-medium mb-5 md:mb-8 max-w-md">
              Built for the gym. Made for the streets.
            </p>
            <span
              data-testid="button-muscle-tees-shop"
              className="inline-flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-3.5 text-xs uppercase tracking-widest font-semibold w-fit group-hover:gap-4 transition-all"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
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
          <Link href="/category/Ladies" className="inline-block border border-foreground px-8 py-3.5 text-xs uppercase tracking-widest font-semibold w-full">
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
