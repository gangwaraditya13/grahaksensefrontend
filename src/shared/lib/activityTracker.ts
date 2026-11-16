import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ActivityEventType, ActivityResponseDto } from '@/shared/types/api';

/**
 * Centralized Activity & Telemetry Tracking Service
 * Tracks customer journey, product discovery, and user engagement events.
 */
export async function trackActivity(
  event: ActivityEventType,
  productId?: number
): Promise<ActivityResponseDto | null> {
  try {
    const { user } = useAuthStore.getState();
    const userId = user?.id || 1; // Default to guest/session id 1 if not logged in

    const payload = {
      userId,
      productId: productId && productId > 0 ? productId : undefined,
      event,
    };

    try {
      const response = await apiClient.post<ActivityResponseDto>(
        API_ENDPOINTS.PUBLIC.ACTIVITY,
        payload
      );
      return response.data;
    } catch (err: any) {
      // Fallback to /activity/create if public endpoint returns 404 or 403
      if (err.response?.status === 404 || err.response?.status === 403) {
        const fallback = await apiClient.post<ActivityResponseDto>(
          API_ENDPOINTS.ACTIVITY.CREATE,
          payload
        );
        return fallback.data;
      }
      return null;
    }
  } catch {
    // Telemetry is non-blocking; never disrupt user interaction on tracking failures
    return null;
  }
}

export const activityTracker = {
  // Generic track method
  track: trackActivity,

  // Product interaction
  viewProduct: (productId: number) => trackActivity('VIEW_PRODUCT', productId),
  clickProduct: (productId: number) => trackActivity('CLICK_PRODUCT', productId),
  searchProduct: (_query?: string) => trackActivity('SEARCH_PRODUCT'),
  addToCart: (productId: number) => trackActivity('ADD_TO_CART', productId),
  removeFromCart: (productId: number) => trackActivity('REMOVE_FROM_CART', productId),

  // Purchase journey
  beginCheckout: () => trackActivity('BEGIN_CHECKOUT'),
  purchase: (productId?: number) => trackActivity('PURCHASE', productId),
  cancelPurchase: (productId?: number) => trackActivity('CANCEL_PURCHASE', productId),
  refund: (productId?: number) => trackActivity('REFUND', productId),

  // User engagement
  login: () => trackActivity('LOGIN'),
  logout: () => trackActivity('LOGOUT'),
  signUp: () => trackActivity('SIGN_UP'),

  // Category / seller interaction
  viewCategory: () => trackActivity('VIEW_CATEGORY'),
  viewSeller: () => trackActivity('VIEW_SELLER'),

  // Recommendation interaction
  viewRecommendation: (productId?: number) => trackActivity('VIEW_RECOMMENDATION', productId),
  clickRecommendation: (productId: number) => trackActivity('CLICK_RECOMMENDATION', productId),
};
