import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  UserResponseDto,
  SellerResponseDto,
  ProductResponseDto,
  CartResponseDto,
  ActivityResponseDto,
} from '@/shared/types/api';

export const adminApi = {
  /**
   * Fetch all registered users
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const response = await apiClient.get<UserResponseDto[]>(
      API_ENDPOINTS.USER.GET_ALL
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch all registered sellers
   */
  async getAllSellers(): Promise<SellerResponseDto[]> {
    const response = await apiClient.get<SellerResponseDto[]>(
      API_ENDPOINTS.SELLER.GET_ALL
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch complete marketplace product catalog
   */
  async getAllProducts(): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      API_ENDPOINTS.PRODUCT.ALL
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch all active shopping carts
   */
  async getAllCarts(): Promise<CartResponseDto[]> {
    const response = await apiClient.get<CartResponseDto[]>(
      API_ENDPOINTS.CART.GET_ALL
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch all customer and platform activities for intelligence analytics
   */
  async getAllActivities(): Promise<ActivityResponseDto[]> {
    const response = await apiClient.get<ActivityResponseDto[]>(
      API_ENDPOINTS.ACTIVITY.GET_ALL
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Moderate and delete a product listing from the platform
   */
  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT.DELETE_BY_ID(productId));
  },
};
