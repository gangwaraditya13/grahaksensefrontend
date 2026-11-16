import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ProductResponseDto } from '@/shared/types/api';

const mockProductA: ProductResponseDto = {
  id: 1,
  sellerId: 10,
  productName: 'Royal Silk Saree',
  productDescription: 'Pure handwoven silk.',
  price: 5000,
  discount: 20, // Final price = 4000
  adminDiscount: 0,
  imageUrls: ['https://cdn.example.com/saree.jpg'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockProductB: ProductResponseDto = {
  id: 2,
  sellerId: 11,
  productName: 'Kashmiri Walnut Box',
  productDescription: 'Carved walnut wood.',
  price: 2000,
  discount: 0, // Final price = 2000
  adminDiscount: 0,
  imageUrls: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Cart Store Operations & Computations', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart', () => {
    const store = useCartStore.getState();
    expect(store.items).toHaveLength(0);
    expect(store.getTotalCount()).toBe(0);
    expect(store.getFinalTotal()).toBe(0);
  });

  it('adds items and increases total count and calculates totals in INR', async () => {
    await useCartStore.getState().addItem(mockProductA, 2);

    const store = useCartStore.getState();
    expect(store.items).toHaveLength(1);
    expect(store.getTotalCount()).toBe(2);
    // Subtotal = 5000 * 2 = 10,000
    expect(store.getSubtotal()).toBe(10000);
    // Final total = 4000 * 2 = 8,000
    expect(store.getFinalTotal()).toBe(8000);
    // Discount = 2,000
    expect(store.getTotalDiscount()).toBe(2000);
  });

  it('increments quantity when existing item is added again', async () => {
    await useCartStore.getState().addItem(mockProductA, 1);
    await useCartStore.getState().addItem(mockProductA, 2);

    const store = useCartStore.getState();
    expect(store.items).toHaveLength(1);
    expect(store.items[0].quantity).toBe(3);
    expect(store.getTotalCount()).toBe(3);
  });

  it('updates quantity accurately', async () => {
    await useCartStore.getState().addItem(mockProductB, 1);
    const cartItemId = useCartStore.getState().items[0].id;

    await useCartStore.getState().updateQuantity(cartItemId, 4);
    const store = useCartStore.getState();
    expect(store.items[0].quantity).toBe(4);
    expect(store.getFinalTotal()).toBe(8000);
  });

  it('removes item when quantity is reduced to 0', async () => {
    await useCartStore.getState().addItem(mockProductB, 1);
    const cartItemId = useCartStore.getState().items[0].id;

    await useCartStore.getState().updateQuantity(cartItemId, 0);
    const store = useCartStore.getState();
    expect(store.items).toHaveLength(0);
  });

  it('removes item directly via removeItem', async () => {
    await useCartStore.getState().addItem(mockProductA, 1);
    await useCartStore.getState().addItem(mockProductB, 1);
    expect(useCartStore.getState().items).toHaveLength(2);

    const itemAId = useCartStore.getState().items[0].id;
    await useCartStore.getState().removeItem(itemAId);

    const store = useCartStore.getState();
    expect(store.items).toHaveLength(1);
    expect(store.items[0].productId).toBe(mockProductB.id);
  });
});
