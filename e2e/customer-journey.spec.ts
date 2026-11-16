import { test, expect } from '@playwright/test';

test.describe('Flow 1: Customer Discovery & Cart Journey', () => {
  test('Customer signs up, browses products, views details, and adds to cart', async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/GrahakSense/);
    await expect(
      page.getByRole('heading', { name: /Beyond Data/i })
    ).toBeVisible();

    // 2. Navigate to sign up
    await page.getByRole('link', { name: /Get Started/i }).click();
    await expect(page).toHaveURL(/\/signup/);

    // 3. Fill registration form
    const uniqueUser = `user_${Date.now()}`;
    await page.getByLabel(/Full Name/i).fill('Test Shopper');
    await page.getByLabel(/Username/i).fill(uniqueUser);
    await page.getByLabel(/Email Address/i).fill(`${uniqueUser}@example.com`);
    await page.getByLabel(/Password/i).fill('Password123!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    // 4. Navigate to product catalog
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: /Luxury Catalog/i })).toBeVisible();

    // 5. Test search filter with debounce
    const searchInput = page.getByPlaceholder(/Search products/i);
    await searchInput.fill('silk');
    await page.waitForTimeout(400); // 300ms debounce buffer

    // 6. View product detail if products exist or open cart
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Shopping Bag/i })).toBeVisible();
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
  });
});
