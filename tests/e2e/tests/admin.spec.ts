import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin user sees the Admin portal button in the header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Admin portal' })).toBeVisible();
  });

  test('navigates to the admin portal', async ({ page }) => {
    await page.getByRole('button', { name: 'Admin portal' }).click();
    await page.waitForURL('/admin');

    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    await expect(page.getByText('Manage user accounts')).toBeVisible();
  });

  test('admin portal lists the admin account under Approved accounts', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByText('Approved accounts')).toBeVisible();
    // Target the name paragraph inside the admin's list item
    const adminRow = page.locator('li').filter({ hasText: 'admin@randall.local' });
    await expect(adminRow.getByRole('paragraph').filter({ hasText: /^Admin$/ })).toBeVisible();
  });

  test('admin account has the Admin badge and no Make admin button', async ({ page }) => {
    await page.goto('/admin');

    const adminRow = page.locator('li').filter({ hasText: 'admin@randall.local' });
    // The badge is a <span> with class bg-amber-100
    await expect(adminRow.locator('span').filter({ hasText: /^Admin$/ })).toBeVisible();
    await expect(adminRow.getByRole('button', { name: 'Make admin' })).not.toBeVisible();
  });

  test('Back to planner link returns to the planner', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: '← Back to planner' }).click();

    await page.waitForURL('/');
    await expect(page.getByText('Reserve your workspace up to 2 weeks ahead')).toBeVisible();
  });
});
