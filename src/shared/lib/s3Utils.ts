/**
 * AWS S3 Key Extraction Utility
 * Handles CloudFront CDN URLs, raw S3 URLs, and relative product keys
 */
export function extractS3Key(urlOrKey: string): string {
  if (!urlOrKey) return '';

  const clean = urlOrKey.trim();

  // If already a relative S3 key like 'products/xyz.png'
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return clean;
  }

  // If URL contains '/products/'
  if (clean.includes('/products/')) {
    return 'products/' + clean.split('/products/')[1].split('?')[0];
  }

  // Parse generic URL pathname
  try {
    const parsed = new URL(clean);
    return parsed.pathname.replace(/^\/+/, '');
  } catch {
    return clean;
  }
}
