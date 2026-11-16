import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activityTracker, trackActivity } from '@/shared/lib/activityTracker';
import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/authStore';

describe('activityTracker Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 42,
        name: 'Aditya',
        userName: 'aditya13',
        email: 'test@example.com',
        roles: ['USER'],
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });
  });

  it('tracks VIEW_PRODUCT with userId and productId', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 1, userId: 42, productId: 101, event: 'VIEW_PRODUCT' },
    });

    const result = await activityTracker.viewProduct(101);

    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 101,
      event: 'VIEW_PRODUCT',
    });
    expect(result?.event).toBe('VIEW_PRODUCT');
  });

  it('tracks CLICK_PRODUCT', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 2, userId: 42, productId: 102, event: 'CLICK_PRODUCT' },
    });

    await activityTracker.clickProduct(102);

    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 102,
      event: 'CLICK_PRODUCT',
    });
  });

  it('tracks SEARCH_PRODUCT', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 3, userId: 42, event: 'SEARCH_PRODUCT' },
    });

    await activityTracker.searchProduct('shawl');

    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'SEARCH_PRODUCT',
    });
  });

  it('tracks ADD_TO_CART and REMOVE_FROM_CART', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 4, userId: 42, productId: 200, event: 'ADD_TO_CART' },
    });

    await activityTracker.addToCart(200);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 200,
      event: 'ADD_TO_CART',
    });

    await activityTracker.removeFromCart(200);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 200,
      event: 'REMOVE_FROM_CART',
    });
  });

  it('tracks purchase journey: BEGIN_CHECKOUT, PURCHASE, CANCEL_PURCHASE, REFUND', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 5, userId: 42 },
    });

    await activityTracker.beginCheckout();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'BEGIN_CHECKOUT',
    });

    await activityTracker.purchase(301);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 301,
      event: 'PURCHASE',
    });

    await activityTracker.cancelPurchase(301);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 301,
      event: 'CANCEL_PURCHASE',
    });

    await activityTracker.refund(301);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 301,
      event: 'REFUND',
    });
  });

  it('tracks user engagement: LOGIN, LOGOUT, SIGN_UP', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 6, userId: 42 },
    });

    await activityTracker.login();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'LOGIN',
    });

    await activityTracker.logout();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'LOGOUT',
    });

    await activityTracker.signUp();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'SIGN_UP',
    });
  });

  it('tracks VIEW_CATEGORY and VIEW_SELLER', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 7, userId: 42 },
    });

    await activityTracker.viewCategory();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'VIEW_CATEGORY',
    });

    await activityTracker.viewSeller();
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: undefined,
      event: 'VIEW_SELLER',
    });
  });

  it('tracks VIEW_RECOMMENDATION and CLICK_RECOMMENDATION', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 8, userId: 42, productId: 505 },
    });

    await activityTracker.viewRecommendation(505);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 505,
      event: 'VIEW_RECOMMENDATION',
    });

    await activityTracker.clickRecommendation(505);
    expect(postSpy).toHaveBeenCalledWith(API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 505,
      event: 'CLICK_RECOMMENDATION',
    });
  });

  it('falls back to /activity/create when /public/activity is unavailable (404/403)', async () => {
    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({
        data: { id: 9, userId: 42, productId: 10, event: 'VIEW_PRODUCT' },
      });

    const res = await trackActivity('VIEW_PRODUCT', 10);

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(postSpy).toHaveBeenNthCalledWith(1, API_ENDPOINTS.PUBLIC.ACTIVITY, {
      userId: 42,
      productId: 10,
      event: 'VIEW_PRODUCT',
    });
    expect(postSpy).toHaveBeenNthCalledWith(2, API_ENDPOINTS.ACTIVITY.CREATE, {
      userId: 42,
      productId: 10,
      event: 'VIEW_PRODUCT',
    });
    expect(res?.id).toBe(9);
  });
});
