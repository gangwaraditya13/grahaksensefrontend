import { apiClient, API_ENDPOINTS } from '@/shared/api/client';
import {
  SellerResponseDto,
  UpdateSellerDto,
  ProductResponseDto,
  ProductRequestDto,
  UpdateProductRequestDto,
  UploadUrlRequestDto,
  UploadUrlResponseDto,
} from '@/shared/types/api';

export const sellerApi = {
  /**
   * Fetch seller profile by userId
   */
  async getSellerProfile(userId: number): Promise<SellerResponseDto> {
    const response = await apiClient.get<SellerResponseDto>(
      API_ENDPOINTS.SELLER.BY_USER_ID(userId)
    );
    return response.data;
  },

  /**
   * Update seller business profile
   */
  async updateSellerProfile(data: UpdateSellerDto): Promise<SellerResponseDto> {
    const response = await apiClient.put<SellerResponseDto>(
      API_ENDPOINTS.SELLER.UPDATE,
      data
    );
    return response.data;
  },

  /**
   * Get all products owned by this seller
   */
  async getSellerProducts(sellerId: number): Promise<ProductResponseDto[]> {
    const response = await apiClient.get<ProductResponseDto[]>(
      API_ENDPOINTS.PRODUCT.BY_SELLER(sellerId)
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Request pre-signed S3 upload URL
   * Enforces 2MB max size constraint
   */
  async getUploadUrl(data: UploadUrlRequestDto): Promise<UploadUrlResponseDto> {
    const response = await apiClient.post<UploadUrlResponseDto>(
      API_ENDPOINTS.PRODUCT.UPLOAD_URL,
      data
    );
    return response.data;
  },

  /**
   * Create a new product with uploaded image keys
   */
  async createProduct(data: ProductRequestDto): Promise<ProductResponseDto> {
    const response = await apiClient.post<ProductResponseDto>(
      API_ENDPOINTS.PRODUCT.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update an existing product
   */
  async updateProduct(data: UpdateProductRequestDto): Promise<ProductResponseDto> {
    const response = await apiClient.put<ProductResponseDto>(
      API_ENDPOINTS.PRODUCT.UPDATE,
      data
    );
    return response.data;
  },

  /**
   * Delete product by productId
   */
  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT.DELETE_BY_ID(productId));
  },
};
