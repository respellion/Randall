import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin user sees the Admin button in the header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
  });

  test('navigates to the admin portal', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.waitForURL('/admin');

    await expect(page.getByRole('heading', { name: /Who can book/i })).toBeVisible();
    await expect(page.getByText(/Users.*The Hague HQ/i)).toBeVisible();
  });

  test('admin portal lists the admin account', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.waitForURL('/admin');

    await expect(page.getByText('admin@randall.local')).toBeVisible();
    const adminRow = page.locator('[data-testid="user-row"]').filter({ hasText: 'admin@randall.local' });
    await expect(adminRow.locator('[data-testid="role-badge"]').filter({ hasText: /^admin$/i })).toBeVisible();
  });

  test('admin account has the admin role badge and no make-admin button', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.waitForURL('/admin');

    const adminRow = page.locator('[data-testid="user-row"]').filter({ hasText: 'admin@randall.local' });
    await expect(adminRow.locator('[data-testid="role-badge"]').filter({ hasText: /^admin$/i })).toBeVisible();
    // The make-admin action button is not rendered for users who are already admin
    await expect(adminRow.getByRole('button', { name: 'Admin' })).not.toBeVisible();
  });

  test('wordmark navigates back to the planner', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.waitForURL('/admin');
    await page.locator('span', { hasText: 'randall' }).first().click();

    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: /Where to sit/i })).toBeVisible();
  });
});
