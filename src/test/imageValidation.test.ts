import { describe, it, expect } from 'vitest';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
  ALLOWED_MIME_TYPES,
} from '@/features/seller/hooks/useImageUpload';

describe('Seller Product Image Constraints Specification', () => {
  it('enforces maximum 2 MB (2,097,152 bytes) per image', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(2097152);
  });

  it('enforces maximum 5 images per product listing', () => {
    expect(MAX_IMAGES_PER_PRODUCT).toBe(5);
  });

  it('allows strictly JPG, PNG, and WEBP image MIME types', () => {
    expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
    expect(ALLOWED_MIME_TYPES).toContain('image/png');
    expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    expect(ALLOWED_MIME_TYPES).not.toContain('image/gif');
    expect(ALLOWED_MIME_TYPES).not.toContain('application/pdf');
    expect(ALLOWED_MIME_TYPES).not.toContain('image/svg+xml');
  });

  it('validates file size checks accurately', () => {
    const validFileSize = 1.9 * 1024 * 1024; // 1.9 MB
    const oversizedFileSize = 2.1 * 1024 * 1024; // 2.1 MB

    expect(validFileSize <= MAX_FILE_SIZE_BYTES).toBe(true);
    expect(oversizedFileSize <= MAX_FILE_SIZE_BYTES).toBe(false);
  });
});
