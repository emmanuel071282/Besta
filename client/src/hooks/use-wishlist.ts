import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { Product } from "@shared/schema";

interface LocalWishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

const useLocalWishlist = create<LocalWishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
      },
      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      isInWishlist: (productId) => get().items.some((item) => item.id === productId),
    }),
    { name: "besta-wishlist-storage" }
  )
);

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const local = useLocalWishlist();

  const serverQuery = useQuery<Product[]>({
    queryKey: ["/api/wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to add to wishlist");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
  });

  if (user) {
    const serverItems = serverQuery.data ?? [];
    return {
      items: serverItems,
      isInWishlist: (productId: number) => serverItems.some((p) => p.id === productId),
      toggleItem: (product: Product) => {
        if (serverItems.some((p) => p.id === product.id)) {
          removeMutation.mutate(product.id);
        } else {
          addMutation.mutate(product.id);
        }
      },
      addItem: (product: Product) => addMutation.mutate(product.id),
      removeItem: (productId: number) => removeMutation.mutate(productId),
    };
  }

  return local;
}
