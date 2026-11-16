import { test, expect } from '@playwright/test';

test.describe('Flow 3: Admin Governance & Intelligence Analytics', () => {
  test('Admin logs in and accesses user management, moderation, and Intelligence Dashboard', async ({
    page,
  }) => {
    // 1. Visit Login
    await page.goto('/login');
    await page.getByLabel(/Username/i).fill('admin_master');
    await page.getByLabel(/Password/i).fill('AdminSecret123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Access Admin Workspace
    await page.goto('/admin');
    await expect(page.getByText(/Governance & Analytics/i)).toBeVisible();
    await expect(page.getByText(/Marketplace Governance/i)).toBeVisible();

    // 3. Inspect Navigation to User Directory
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /User Directory/i })).toBeVisible();

    // 4. Inspect Navigation to Seller Directory
    await page.goto('/admin/sellers');
    await expect(page.getByRole('heading', { name: /Seller Directory/i })).toBeVisible();

    // 5. Inspect Navigation to Product Moderation
    await page.goto('/admin/products');
    await expect(
      page.getByRole('heading', { name: /Product Moderation/i })
    ).toBeVisible();

    // 6. Access Intelligence Dashboard
    await page.goto('/admin/insights');
    await expect(
      page.getByRole('heading', { name: /Intelligence Dashboard/i })
    ).toBeVisible();
    await expect(page.getByText(/Commerce Conversion Funnel/i)).toBeVisible();
    await expect(page.getByText(/Customer RFM Frequency Cohorts/i)).toBeVisible();
    await expect(page.getByText(/Recommendation System Performance/i)).toBeVisible();

    // 7. Verify no /analyst route exists (redirects to 404 or 403)
    await page.goto('/analyst');
    await expect(page.getByText(/Lost in Decisions|404|403/i)).toBeVisible();
  });
});
