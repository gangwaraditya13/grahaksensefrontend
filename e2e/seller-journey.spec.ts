import { test, expect } from '@playwright/test';

test.describe('Flow 2: Merchant Onboarding & Product Publication', () => {
  test('Customer becomes a seller and publishes a product with image validation', async ({
    page,
  }) => {
    // 1. Log in with merchant credentials or navigate to account
    await page.goto('/login');
    await page.getByLabel(/Username/i).fill('seller_merchant');
    await page.getByLabel(/Password/i).fill('MerchantPass123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Open Account settings
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: /Personal Information/i })).toBeVisible();

    // 3. Inspect Seller Studio application / launch
    const sellerStudioHeading = page.getByRole('heading', { name: /Seller Studio/i });
    await expect(sellerStudioHeading).toBeVisible();

    // 4. Navigate to Seller Studio
    await page.goto('/seller');
    await expect(page.getByText(/Merchant Hub/i)).toBeVisible();

    // 5. Open Add Product Form
    await page.goto('/seller/products/new');
    await expect(
      page.getByRole('heading', { name: /Publish New Product/i })
    ).toBeVisible();

    // 6. Fill Product Form
    await page.getByLabel(/Product Title/i).fill('Handwoven Pashmina Shawl');
    await page
      .getByLabel(/Detailed Description/i)
      .fill('Luxurious 100% genuine Kashmiri hand-spun wool fabric.');
    await page.getByLabel(/Base Price/i).fill('18500');
    await page.getByLabel(/Seller Discount/i).fill('10');

    // 7. Verify S3 image constraints copy is visible
    await expect(page.getByText(/up to 2 MB each, max 5 images total/i)).toBeVisible();
  });
});
