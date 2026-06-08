import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import { Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

type OutfitData = { id: number; name: string; description: string; imageUrl: string; products: Product[] };

export default function LookbookPage() {
  const { data: outfits, isLoading } = useQuery<OutfitData[]>({
    queryKey: ["/api/outfits"],
    queryFn: async () => (await fetch("/api/outfits")).json(),
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Editorial</p>
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-4">Lookbook</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Curated outfits styled by our team. Shop the complete look or mix and match.</p>
        </div>
        {isLoading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
          : !outfits?.length ? <div className="text-center py-24"><p className="text-muted-foreground">No looks yet — check back soon.</p></div>
          : <div className="space-y-24">{outfits.map((outfit, idx) => (
            <section key={outfit.id} className={`flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center`}>
              <div className="w-full lg:w-2/5 aspect-[3/4] bg-secondary shrink-0">
                {outfit.imageUrl ? <img src={outfit.imageUrl} alt={outfit.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>}
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">The Look</p>
                <h2 className="text-3xl font-display font-medium tracking-tight mb-3">{outfit.name}</h2>
                {outfit.description && <p className="text-muted-foreground mb-8 leading-relaxed">{outfit.description}</p>}
                <div className="grid grid-cols-2 gap-4">{outfit.products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div>
              </div>
            </section>))}</div>}
      </div>
    </div>
  );
}
