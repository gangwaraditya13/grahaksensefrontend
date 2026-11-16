import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (INR)
 * e.g., ₹1,49,999 or ₹499.00
 */
export const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return inrFormatter.format(amount);
}

/**
 * Calculate effective price after seller and admin discounts
 */
export function calculateEffectivePrice(
  price: number,
  discount: number = 0,
  adminDiscount: number = 0
): {
  originalPrice: number;
  totalDiscountAmount: number;
  finalPrice: number;
  effectiveDiscountPercent: number;
} {
  const sellerDiscountAmount = (price * (discount || 0)) / 100;
  const afterSellerDiscount = Math.max(0, price - sellerDiscountAmount);
  const adminDiscountAmount = (afterSellerDiscount * (adminDiscount || 0)) / 100;
  const finalPrice = Math.max(0, afterSellerDiscount - adminDiscountAmount);
  const totalDiscountAmount = price - finalPrice;
  const effectiveDiscountPercent = price > 0 ? Math.round((totalDiscountAmount / price) * 100) : 0;

  return {
    originalPrice: price,
    totalDiscountAmount,
    finalPrice,
    effectiveDiscountPercent,
  };
}

/**
 * Format ISO date string into human readable format
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
