import { describe, it, expect } from 'vitest';
import { extractS3Key } from '@/shared/lib/s3Utils';

describe('extractS3Key', () => {
  it('extracts key from CloudFront URLs', () => {
    const url =
      'https://d3g9inapudxs30.cloudfront.net/products/6903eb94-ab12-4c43-8c37-277f9e4eaa20.png';
    expect(extractS3Key(url)).toBe(
      'products/6903eb94-ab12-4c43-8c37-277f9e4eaa20.png'
    );
  });

  it('extracts key from S3 URLs', () => {
    const url =
      'https://grahaksense-media.s3.ap-southeast-2.amazonaws.com/products/test-item.webp?X-Amz-Algorithm=AWS4';
    expect(extractS3Key(url)).toBe('products/test-item.webp');
  });

  it('returns raw key if already relative', () => {
    expect(extractS3Key('products/item-123.jpg')).toBe('products/item-123.jpg');
  });

  it('handles empty or blank input gracefully', () => {
    expect(extractS3Key('')).toBe('');
  });
});
