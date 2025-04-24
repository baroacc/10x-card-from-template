import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Example assertions
    await expect(page).toHaveTitle(/10x/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /./);
  });
}); 