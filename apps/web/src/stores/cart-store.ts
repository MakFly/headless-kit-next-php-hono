import { create } from 'zustand';
import { toast } from 'sonner';
import type { Cart, CartItem } from '@/types/shop';
import {
  getCartAction,
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
} from '@/lib/actions/shop/cart';

type CartState = {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearError: () => void;

  // Derived
  itemCount: number;
  items: CartItem[];
  total: number;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,
  items: [],
  total: 0,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getCartAction();
      set({
        cart,
        items: cart.items ?? [],
        itemCount: cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
        total: cart.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load cart', isLoading: false });
      toast.error('Failed to load cart');
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await addToCartAction(productId, quantity);
      set({
        cart,
        items: cart.items ?? [],
        itemCount: cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
        total: cart.total ?? 0,
        isLoading: false,
      });
      toast.success('Added to bag');
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add item', isLoading: false });
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await updateCartItemAction(itemId, quantity);
      set({
        cart,
        items: cart.items ?? [],
        itemCount: cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
        total: cart.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update item', isLoading: false });
      toast.error(err instanceof Error ? err.message : 'Failed to update item');
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await removeCartItemAction(itemId);
      set({
        cart,
        items: cart.items ?? [],
        itemCount: cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
        total: cart.total ?? 0,
        isLoading: false,
      });
      toast('Item removed');
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove item', isLoading: false });
      toast.error(err instanceof Error ? err.message : 'Failed to remove item');
    }
  },

  clearError: () => set({ error: null }),
}));
