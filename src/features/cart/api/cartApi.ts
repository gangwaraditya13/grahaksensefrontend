import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  CartRequestDto,
  CartResponseDto,
  UpdateCartRequestDto,
} from '@/shared/types/api';

export const cartApi = {
  /**
   * Fetch all cart items for a specific user
   */
  async getCartByUserId(userId: number): Promise<CartResponseDto[]> {
    const response = await apiClient.get<CartResponseDto[]>(
      API_ENDPOINTS.CART.BY_USER_ID(userId)
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Add item to user's server cart
   */
  async createCartItem(data: CartRequestDto): Promise<CartResponseDto> {
    const response = await apiClient.post<CartResponseDto>(
      API_ENDPOINTS.CART.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update quantity and price snapshot for a cart item
   */
  async updateCartItem(data: UpdateCartRequestDto): Promise<void> {
    await apiClient.put(API_ENDPOINTS.CART.UPDATE, data);
  },

  /**
   * Remove a cart item by cart ID
   */
  async deleteCartItem(cartId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CART.DELETE_BY_ID(cartId));
  },
};
