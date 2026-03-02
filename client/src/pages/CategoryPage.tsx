import { useRoute } from "wouter";
import { useProductsByCategory } from "@/hooks/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Filter, ChevronDown } from "lucide-react";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category || "";
  
  const { data: products, isLoading, error } = useProductsByCategory(category);

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Category Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter mb-4">
            {category}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Discover the latest styles and essentials in our {category.toLowerCase()} collection. 
            Designed for the modern aesthetic.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-4 border-y border-border mb-8">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {products?.length || 0} items
            </span>
          </div>
          
          <button className="flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors">
            Sort by: Featured
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        {error ? (
          <div className="py-20 text-center text-destructive">
            <p>Failed to load products. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {isLoading 
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products?.length === 0 
                ? (
                  <div className="col-span-full py-24 text-center">
                    <p className="text-lg text-muted-foreground">No products found in this category.</p>
                  </div>
                )
                : products?.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
