import { describe, it, expect } from 'vitest';
import { calculateEffectivePrice, formatINR } from '@/shared/lib/utils';

describe('Pricing & Discount Calculation Utilities', () => {
  it('correctly calculates effective price with 0% discount', () => {
    const result = calculateEffectivePrice(1000, 0, 0);
    expect(result.originalPrice).toBe(1000);
    expect(result.finalPrice).toBe(1000);
    expect(result.totalDiscountAmount).toBe(0);
    expect(result.effectiveDiscountPercent).toBe(0);
  });

  it('correctly calculates price with seller discount only', () => {
    const result = calculateEffectivePrice(2000, 20, 0); // 20% off
    expect(result.originalPrice).toBe(2000);
    expect(result.finalPrice).toBe(1600);
    expect(result.totalDiscountAmount).toBe(400);
    expect(result.effectiveDiscountPercent).toBe(20);
  });

  it('correctly applies sequential seller and admin platform discounts', () => {
    // ₹10,000 with 10% seller discount = ₹9,000; then 10% admin discount on remainder = ₹8,100
    const result = calculateEffectivePrice(10000, 10, 10);
    expect(result.originalPrice).toBe(10000);
    expect(result.finalPrice).toBe(8100);
    expect(result.totalDiscountAmount).toBe(1900);
    expect(result.effectiveDiscountPercent).toBe(19);
  });

  it('formats currency in Indian Rupees (INR) correctly', () => {
    const formatted = formatINR(149999);
    // Should include currency symbol ₹ and Indian comma grouping
    expect(formatted).toContain('1,49,999');
    expect(formatted).toContain('₹');
  });

  it('gracefully handles 0 or invalid amounts in formatINR', () => {
    expect(formatINR(0)).toContain('0');
    expect(formatINR(NaN)).toBe('₹0');
  });
});
