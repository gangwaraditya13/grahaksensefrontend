import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  ProductResponseDto,
  ActivityEventType,
  ActivityResponseDto,
} from '@/shared/types/api';
import { trackActivity } from '@/shared/lib/activityTracker';

export const catalogApi = {
  /**
   * Fetch all products from public endpoint /public/all
   * Fallback to /product/all if needed
   */
  async getAllProducts(): Promise<ProductResponseDto[]> {
    try {
      const response = await apiClient.get<ProductResponseDto[]>(
        API_ENDPOINTS.PUBLIC.ALL_PRODUCTS
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        const fallback = await apiClient.get<ProductResponseDto[]>(
          API_ENDPOINTS.PRODUCT.ALL
        );
        return Array.isArray(fallback.data) ? fallback.data : [];
      }
      throw err;
    }
  },

  /**
   * Fetch a single product by ID from /public/{productId}
   */
  async getProductById(productId: number): Promise<ProductResponseDto> {
    try {
      const response = await apiClient.get<ProductResponseDto>(
        API_ENDPOINTS.PUBLIC.PRODUCT_BY_ID(productId)
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        const fallback = await apiClient.get<ProductResponseDto>(
          API_ENDPOINTS.PRODUCT.BY_ID(productId)
        );
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Fetch all products published by a specific seller
   */
  async getProductsBySeller(sellerId: number): Promise<ProductResponseDto[]> {
    try {
      const response = await apiClient.get<ProductResponseDto[]>(
        API_ENDPOINTS.PUBLIC.PRODUCTS_BY_SELLER(sellerId)
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        const fallback = await apiClient.get<ProductResponseDto[]>(
          API_ENDPOINTS.PRODUCT.BY_SELLER(sellerId)
        );
        return Array.isArray(fallback.data) ? fallback.data : [];
      }
      throw err;
    }
  },

  /**
   * Log customer interaction activity to /public/activity (with /activity/create fallback)
   */
  async logActivity(
    event: ActivityEventType,
    productId?: number
  ): Promise<ActivityResponseDto | null> {
    return trackActivity(event, productId);
  },
};
