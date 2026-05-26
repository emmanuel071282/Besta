import { useRoute } from "wouter";
import { useProduct, useProductsByCategory } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Check, Heart, MapPin, Star, AlertTriangle, ChevronDown, ChevronUp, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSizesForProduct } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@shared/schema";

type SizeStock = { size: string; available: number };
type StoreStock = { id: number; name: string; city: string; address: string; availableQty: number };
type ReviewData = { id: number; userId: number; rating: number; comment: string; createdAt: string };
type OutfitData = { id: number; name: string; description: string; imageUrl: string; products: Product[] };

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-4 h-4 transition-colors",
            (readonly ? s <= value : s <= (hovered || value)) ? "fill-amber-400 stroke-amber-400" : "stroke-muted-foreground",
            !readonly && "cursor-pointer"
          )}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
        />
      ))}
    </div>
  );
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-background w-full md:max-w-2xl max-h-[90vh] overflow-y-auto md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Size Guide</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">Men's Tops</h3>
            <table className="w-full text-xs border border-border">
              <thead className="bg-secondary">
                <tr>{["Size","Chest (in)","Waist (in)","Shoulder (in)"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[["S","36-38","30-32","17"],["M","38-40","32-34","17.5"],["L","40-42","34-36","18"],["XL","42-44","36-38","18.5"],["XXL","44-46","38-40","19"]].map(r => (
                  <tr key={r[0]} className="border-t border-border">{r.map((c,i) => <td key={i} className="px-3 py-2">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">Women's Tops</h3>
            <table className="w-full text-xs border border-border">
              <thead className="bg-secondary">
                <tr>{["Size","Chest (in)","Waist (in)","Hips (in)"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[["XS","30-32","24-26","33-35"],["S","32-34","26-28","35-37"],["M","34-36","28-30","37-39"],["L","36-38","30-32","39-41"],["XL","38-40","32-34","41-43"]].map(r => (
                  <tr key={r[0]} className="border-t border-border">{r.map((c,i) => <td key={i} className="px-3 py-2">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">Footwear</h3>
            <table className="w-full text-xs border border-border">
              <thead className="bg-secondary">
                <tr>{["UK","EU","US (M)","US (F)","CM"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[["6","39","7","8","24.5"],["7","40","8","9","25.5"],["8","41","9","10","26.5"],["9","42","10","11","27.5"],["10","43","11","12","28.5"],["11","44","12","13","29.5"]].map(r => (
                  <tr key={r[0]} className="border-t border-border">{r.map((c,i) => <td key={i} className="px-3 py-2">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">All measurements are approximate. When between sizes, we recommend sizing up.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: product, isLoading, error } = useProduct(id);
  const { data: relatedProducts } = useProductsByCategory(product?.category || "");
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  usePageMeta({
    title: product ? `${product.name} — BESTA` : "BESTA - Fashion Shopping",
    description: product?.description ?? undefined,
    ogImage: product?.imageUrl ?? undefined,
  });

  // Size-wise inventory
  const { data: sizeStock } = useQuery<SizeStock[]>({
    queryKey: ["/api/products", id, "inventory"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/inventory`);
      return res.json();
    },
    enabled: id > 0,
  });

  // Store stock
  const { data: storeStock } = useQuery<StoreStock[]>({
    queryKey: ["/api/products", id, "stores"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/stores`);
      return res.json();
    },
    enabled: id > 0 && showStores,
  });

  // Reviews
  const { data: productReviews } = useQuery<ReviewData[]>({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/reviews`);
      return res.json();
    },
    enabled: id > 0,
  });

  // Outfit bundles for this product
  const { data: outfitData } = useQuery<OutfitData[]>({
    queryKey: ["/api/products", id, "outfits"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/outfits`);
      return res.json();
    },
    enabled: id > 0,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", id, "reviews"] });
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
    },
  });

  const availableSizes = product
    ? (product.sizes && product.sizes.length > 0
      ? product.sizes
      : getSizesForProduct(product.category, product.subcategory))
    : [];

  const isFreeSize = availableSizes.length === 1 && availableSizes[0] === "Free Size";

  // Build a map of size → available stock
  const sizeStockMap = new Map((sizeStock ?? []).map(s => [s.size, s.available]));

  const getSelectedSizeStock = () => {
    if (!selectedSize || sizeStockMap.size === 0) return null;
    return sizeStockMap.get(selectedSize) ?? null;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isFreeSize && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addItem(product, 1, isFreeSize ? "Free Size" : selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isFavorited = product ? isInWishlist(product.id) : false;

  const avgRating = productReviews && productReviews.length > 0
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center">
        <p className="text-destructive text-lg">Product not found.</p>
      </div>
    );
  }

  const filteredRelated = relatedProducts
    ?.filter(p => p.id !== product?.id)
    .slice(0, 4) || [];

  const selectedStock = getSelectedSizeStock();

  return (
    <>
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-24">

            {/* Product image */}
            <div className="w-full lg:w-3/5 bg-secondary relative aspect-[3/4] md:aspect-[4/5] lg:aspect-auto lg:h-[80vh]">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : (
                <img
                  src={product?.imageUrl}
                  alt={product?.name}
                  width={800} height={1067}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Product info */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-14 w-full mt-8" />
                </div>
              ) : product ? (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                      {product.category}
                    </span>
                    {avgRating > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                        {avgRating.toFixed(1)} ({productReviews!.length})
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight mb-4" data-testid="text-product-name">
                    {product.name}
                  </h1>

                  <p className="text-2xl font-semibold mb-8" data-testid="text-product-price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {product.description}
                  </p>

                  {/* Size selector */}
                  {!isFreeSize && availableSizes.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-widest font-semibold">Select Size</span>
                        <button
                          onClick={() => setShowSizeGuide(true)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Ruler className="w-3 h-3" /> Size Guide
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2" data-testid="size-selector">
                        {availableSizes.map((size) => {
                          const stock = sizeStockMap.get(size) ?? null;
                          const outOfStock = sizeStockMap.size > 0 && stock !== null && stock === 0;
                          const lowStock = stock !== null && stock > 0 && stock < 5;
                          return (
                            <button
                              key={size}
                              onClick={() => !outOfStock && setSelectedSize(size)}
                              disabled={outOfStock}
                              data-testid={`button-size-${size.replace(/\s+/g, "-").toLowerCase()}`}
                              aria-pressed={selectedSize === size}
                              title={outOfStock ? "Out of stock" : lowStock ? `Only ${stock} left` : undefined}
                              className={cn(
                                "min-w-[48px] px-3 py-2.5 text-sm font-medium border transition-colors text-center relative",
                                selectedSize === size
                                  ? "border-foreground bg-foreground text-background"
                                  : outOfStock
                                    ? "border-border/40 text-muted-foreground/40 cursor-not-allowed line-through"
                                    : "border-border hover:border-foreground",
                                lowStock && selectedSize !== size && "border-amber-400"
                              )}
                            >
                              {size}
                              {lowStock && (
                                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Low stock warning for selected size */}
                      {selectedSize && selectedStock !== null && selectedStock > 0 && selectedStock < 5 && (
                        <p className="mt-2 text-xs font-semibold text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Only {selectedStock} left in your size — order soon!
                        </p>
                      )}
                      {selectedSize && selectedStock === 0 && (
                        <p className="mt-2 text-xs font-semibold text-red-600">Out of stock in this size</p>
                      )}
                    </div>
                  )}

                  {/* Add to bag + wishlist */}
                  <div className="flex gap-4 mb-6">
                    <Button
                      onClick={handleAddToCart}
                      data-testid="button-add-to-bag"
                      className="flex-1 h-14 rounded-none text-sm uppercase tracking-widest font-bold relative overflow-hidden transition-all duration-300"
                      variant={isAdded ? "secondary" : "default"}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-2 text-green-800">
                          <Check className="w-5 h-5" /> Added to Bag
                        </span>
                      ) : (
                        "Add to Bag"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 w-14 rounded-none border-border hover:bg-secondary transition-colors"
                      onClick={() => product && toggleItem(product)}
                      data-testid="button-toggle-wishlist"
                      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={isFavorited}
                    >
                      <Heart className={cn("w-5 h-5 transition-colors", isFavorited ? "fill-red-500 stroke-red-500" : "stroke-foreground")} />
                    </Button>
                  </div>

                  {/* Check store availability */}
                  <button
                    onClick={() => setShowStores(!showStores)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Check Store Availability
                    {showStores ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showStores && (
                    <div className="mb-8 border border-border">
                      {!storeStock ? (
                        <p className="p-4 text-xs text-muted-foreground">Loading…</p>
                      ) : storeStock.length === 0 ? (
                        <p className="p-4 text-xs text-muted-foreground">No stores currently have stock for this product.</p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {storeStock.map((store) => (
                            <li key={store.id} className="px-4 py-3 flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium">{store.name}</p>
                                <p className="text-xs text-muted-foreground">{store.city}</p>
                              </div>
                              <span className={cn(
                                "text-xs font-semibold shrink-0 mt-0.5",
                                store.availableQty < 5 ? "text-amber-600" : "text-green-600"
                              )}>
                                {store.availableQty < 5 ? `Only ${store.availableQty} left` : "In Stock"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <Accordion type="single" collapsible className="w-full border-t border-border">
                    <AccordionItem value="details" className="border-border">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline uppercase tracking-wide">
                        Details & Fit
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Regular fit. True to size. Designed with a clean silhouette for versatile styling.
                        The model is 185cm and wearing size Medium.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="materials" className="border-border">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline uppercase tracking-wide">
                        Materials & Care
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        100% Premium Cotton. Machine wash cold with like colors. Do not bleach. Tumble dry low. Warm iron if needed.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping" className="border-border">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline uppercase tracking-wide">
                        Shipping & Returns
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Free standard shipping on orders over ₹1500. Free returns within 30 days of purchase.
                        Items must be unworn with tags attached.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              ) : null}
            </div>
          </div>

          {/* Complete the Look */}
          {outfitData && outfitData.length > 0 && (
            <div className="border-t border-border pt-16 mt-0 mb-16">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-2">Complete the Look</h3>
              <p className="text-sm text-muted-foreground mb-8">Styled to go with this piece</p>
              {outfitData.map((outfit) => (
                <div key={outfit.id} className="mb-12">
                  {outfit.name && <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">{outfit.name}</p>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
                    {outfit.products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* You May Also Like */}
          {!isLoading && filteredRelated.length > 0 && (
            <div className="border-t border-border pt-16 mb-16">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-8">
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
                {filteredRelated.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {!isLoading && product && (
            <div className="border-t border-border pt-16">
              <h3 className="text-2xl font-display font-medium tracking-tight mb-8">
                Customer Reviews
                {avgRating > 0 && (
                  <span className="ml-3 text-base font-normal text-muted-foreground flex items-center gap-1 inline-flex">
                    <StarRating value={Math.round(avgRating)} readonly />
                    <span className="ml-1">{avgRating.toFixed(1)} / 5</span>
                  </span>
                )}
              </h3>

              {user && (
                <form
                  className="bg-secondary/30 border border-border p-6 mb-8"
                  onSubmit={(e) => {
                    e.preventDefault();
                    reviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
                  }}
                >
                  <p className="text-xs uppercase tracking-widest font-semibold mb-4">Write a Review</p>
                  <div className="mb-4">
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none resize-none mb-4"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}

              {!productReviews || productReviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product.</p>
              ) : (
                <div className="space-y-6">
                  {productReviews.map((review) => (
                    <div key={review.id} className="border-b border-border/50 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating value={review.rating} readonly />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
