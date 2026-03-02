import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  get cartTotal(): number;
  get itemCount(): number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true,
            };
          }
          
          return {
            items: [...state.items, { product, quantity }],
            isOpen: true,
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: quantity > 0 
            ? state.items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
              )
            : state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      get cartTotal() {
        return get().items.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0
        );
      },
      
      get itemCount() {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "fashion-cart-storage",
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
