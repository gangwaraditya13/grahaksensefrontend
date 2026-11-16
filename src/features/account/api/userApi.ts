import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  UserResponseDto,
  UpdateUserRequestDto,
  UserDeleteRequestDto,
  SellerResponseDto,
} from '@/shared/types/api';

export const userApi = {
  /**
   * Get user details by username
   */
  async getUserByUserName(userName: string): Promise<UserResponseDto> {
    const response = await apiClient.get<UserResponseDto>(
      API_ENDPOINTS.USER.BY_USERNAME(userName)
    );
    return response.data;
  },

  /**
   * Update user profile information
   */
  async updateUser(data: UpdateUserRequestDto): Promise<UserResponseDto> {
    const response = await apiClient.put<UserResponseDto>(
      API_ENDPOINTS.USER.UPDATE,
      data
    );
    return response.data;
  },

  /**
   * Delete user account
   */
  async deleteUser(data: UserDeleteRequestDto): Promise<void> {
    await apiClient.post(API_ENDPOINTS.USER.DELETE, data);
  },

  /**
   * Get seller profile by userId
   */
  async getSellerByUserId(userId: number): Promise<SellerResponseDto> {
    const response = await apiClient.get<SellerResponseDto>(
      API_ENDPOINTS.SELLER.BY_USER_ID(userId)
    );
    return response.data;
  },
};
