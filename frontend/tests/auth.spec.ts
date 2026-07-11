import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/VisionKirana/);
});

test('login page elements exist', async ({ page }) => {
  await page.goto('/login');

  // Verify the Email and Password fields exist
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();

  // Verify the Login button exists
  await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
});
