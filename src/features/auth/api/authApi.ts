import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  UserLoginRequestDto,
  TokenResponseDto,
  UserRequestDto,
  UserResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  SellerRequestDto,
  SellerResponseDto,
} from '@/shared/types/api';

export const authApi = {
  /**
   * Authenticate with username and password
   */
  async login(credentials: UserLoginRequestDto): Promise<TokenResponseDto> {
    const response = await apiClient.post<TokenResponseDto>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  /**
   * Register a new user
   */
  async signup(data: UserRequestDto): Promise<UserResponseDto> {
    const response = await apiClient.post<UserResponseDto>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    return response.data;
  },

  /**
   * Request password reset OTP via email
   * Backend path has typo: /Auth/fotget/password
   */
  async forgotPassword(data: ForgotPasswordRequestDto): Promise<{ message?: string }> {
    try {
      const response = await apiClient.post<{ message?: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data
      );
      return response.data;
    } catch (err: any) {
      // Fallback in case backend fixes typo to /Auth/forget/password
      if (err.response?.status === 404) {
        const fallback = await apiClient.post<{ message?: string }>(
          API_ENDPOINTS.AUTH.FORGOT_PASSWORD_FALLBACK,
          data
        );
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordRequestDto): Promise<{ message?: string }> {
    const response = await apiClient.post<{ message?: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Register as a Seller (Become a Seller)
   */
  async registerSeller(data: SellerRequestDto): Promise<SellerResponseDto> {
    const response = await apiClient.post<SellerResponseDto>(
      API_ENDPOINTS.AUTH.SELLER_REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Logout session
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  },
};
