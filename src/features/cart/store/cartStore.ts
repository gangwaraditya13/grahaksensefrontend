import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductResponseDto, EnrichedCartItem } from '@/shared/types/api';
import { calculateEffectivePrice } from '@/shared/lib/utils';
import { cartApi } from '../api/cartApi';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export interface CartState {
  items: EnrichedCartItem[];
  isLoading: boolean;

  // Actions
  addItem: (product: ProductResponseDto, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
  syncWithServer: (userId: number) => Promise<void>;

  // Getters
  getTotalCount: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (product: ProductResponseDto, quantity = 1) => {
        const { user } = useAuthStore.getState();
        const { finalPrice } = calculateEffectivePrice(
          product.price,
          product.discount,
          product.adminDiscount
        );

        // Telemetry: Log ADD_TO_CART event
        catalogApi.logActivity('ADD_TO_CART', product.id);

        const currentItems = [...get().items];
        const existingIndex = currentItems.findIndex((i) => i.productId === product.id);

        if (existingIndex > -1) {
          // Increase quantity
          const existing = currentItems[existingIndex];
          const newQuantity = existing.quantity + quantity;

          if (user?.id && existing.id > 0) {
            try {
              await cartApi.updateCartItem({
                id: existing.id,
                quantity: newQuantity,
                priceSnapshot: finalPrice,
              });
            } catch {
              // Local update remains
            }
          }

          currentItems[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            priceSnapshot: finalPrice,
            product,
          };

          set({ items: currentItems });
        } else {
          // New cart item
          let serverCartId = -Date.now() - Math.floor(Math.random() * 1000000); // Unique negative id for guest item

          if (user?.id) {
            try {
              const res = await cartApi.createCartItem({
                userId: user.id,
                productId: product.id,
                quantity,
                priceSnapshot: finalPrice,
              });
              serverCartId = res.id;
            } catch {
              // Use local timestamp id
            }
          }

          const newItem: EnrichedCartItem = {
            id: serverCartId,
            userId: user?.id || 0,
            productId: product.id,
            quantity,
            priceSnapshot: finalPrice,
            product,
          };

          set({ items: [...currentItems, newItem] });
        }
      },

      updateQuantity: async (cartItemId: number, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(cartItemId);
          return;
        }

        const currentItems = [...get().items];
        const target = currentItems.find((i) => i.id === cartItemId);
        if (!target) return;

        const { user } = useAuthStore.getState();
        if (user?.id && target.id > 0) {
          try {
            await cartApi.updateCartItem({
              id: target.id,
              quantity,
              priceSnapshot: target.priceSnapshot,
            });
          } catch {
            // Local update retains UX responsiveness
          }
        }

        set({
          items: currentItems.map((i) =>
            i.id === cartItemId ? { ...i, quantity } : i
          ),
        });
      },

      removeItem: async (cartItemId: number) => {
        const target = get().items.find((i) => i.id === cartItemId);
        if (target) {
          catalogApi.logActivity('REMOVE_FROM_CART', target.productId);
        }

        const { user } = useAuthStore.getState();
        if (user?.id && cartItemId > 0) {
          try {
            await cartApi.deleteCartItem(cartItemId);
          } catch {
            // Keep local removal
          }
        }

        set({
          items: get().items.filter((i) => i.id !== cartItemId),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      syncWithServer: async (userId: number) => {
        set({ isLoading: true });
        try {
          const serverItems = await cartApi.getCartByUserId(userId);
          const allProducts = await catalogApi.getAllProducts();

          const enriched: EnrichedCartItem[] = serverItems.map((serverItem) => ({
            ...serverItem,
            product: allProducts.find((p) => p.id === serverItem.productId),
          }));

          set({ items: enriched });
        } catch {
          // Retain local items on network glitch
        } finally {
          set({ isLoading: false });
        }
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const originalPrice = item.product?.price || item.priceSnapshot;
          return sum + originalPrice * item.quantity;
        }, 0);
      },

      getTotalDiscount: () => {
        const subtotal = get().getSubtotal();
        const finalTotal = get().getFinalTotal();
        return Math.max(0, subtotal - finalTotal);
      },

      getFinalTotal: () => {
        return get().items.reduce((sum, item) => {
          return sum + item.priceSnapshot * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'grahaksense-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
