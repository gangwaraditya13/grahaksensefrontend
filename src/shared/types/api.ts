/**
 * GrahakSense API Contract Types
 * Directly derived from OpenAPI 3.0.1 specification (CityHub – Grahak Sense API)
 */

export type Role = 'USER' | 'SELLER' | 'ADMIN';

export interface UserResponseDto {
  id: number;
  name: string;
  userName: string;
  email: string;
  fullAddress?: string;
  phone?: string;
  roles: Role[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequestDto {
  name: string;
  userName: string;
  password?: string;
  email: string;
  fullAddress?: string;
  phone?: string;
}

export interface UpdateUserRequestDto {
  name: string;
  userName: string;
  email: string;
  fullAddress?: string;
  phone?: string;
}

export interface UserDeleteRequestDto {
  userId: number;
  password?: string;
}

export interface UserLoginRequestDto {
  userName: string;
  password?: string;
}

export interface TokenResponseDto {
  jwtToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  userName: string;
  otp: string;
  newPassword?: string;
}

export interface SellerResponseDto {
  id: number;
  userId: number;
  companyName: string;
  businessAddress: string;
  businessPhone: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerRequestDto {
  userId: number;
  companyName: string;
  businessAddress: string;
  businessPhone: string;
}

export interface UpdateSellerDto {
  companyName: string;
  businessAddress: string;
  businessPhone: string;
}

export interface SellerDeleteRequestDto {
  userId: number;
  password?: string;
}

export interface ProductResponseDto {
  id: number;
  sellerId: number;
  productName: string;
  productDescription: string;
  price: number;
  discount: number;
  adminDiscount: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequestDto {
  sellerId: number;
  productName: string;
  productDescription: string;
  price: number;
  discount: number;
  adminDiscount: number;
  imageKeys: string[];
}

export interface UpdateProductRequestDto {
  id: number;
  productName: string;
  productDescription: string;
  price: number;
  discount: number;
  adminDiscount: number;
  imageKeys: string[];
}

export interface UploadUrlRequestDto {
  contentType: string;
  size: number;
}

export interface UploadUrlResponseDto {
  uploadUrl: string;
  key: string;
  imageUrl: string;
  expiresInSeconds: number;
}

export interface CartResponseDto {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  priceSnapshot: number;
}

export interface CartRequestDto {
  userId: number;
  productId: number;
  quantity: number;
  priceSnapshot: number;
}

export interface UpdateCartRequestDto {
  id: number;
  quantity: number;
  priceSnapshot: number;
}

export type ActivityEventType =
  | 'VIEW_PRODUCT'
  | 'CLICK_PRODUCT'
  | 'SEARCH_PRODUCT'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'BEGIN_CHECKOUT'
  | 'PURCHASE'
  | 'CANCEL_PURCHASE'
  | 'REFUND'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SIGN_UP'
  | 'VIEW_CATEGORY'
  | 'VIEW_SELLER'
  | 'VIEW_RECOMMENDATION'
  | 'CLICK_RECOMMENDATION';

export interface ActivityRequestDto {
  userId: number;
  productId?: number;
  event: ActivityEventType;
}

export interface ActivityResponseDto {
  id: number;
  userId: number;
  productId?: number;
  event: ActivityEventType;
  createdAt: string;
}

// Client-side enriched cart item that includes product details for display
export interface EnrichedCartItem extends CartResponseDto {
  product?: ProductResponseDto;
}
