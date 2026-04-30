import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the sign-in form on initial load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Find your desk/i })).toBeVisible();
    await expect(page.getByPlaceholder('you@randall.local')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in →');
  });

  test('signs in with valid credentials and reaches the planner', async ({ page }) => {
    await page.getByPlaceholder('you@randall.local').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: /Where to sit/i })).toBeVisible();
  });

  test('shows an error for an unknown email', async ({ page }) => {
    await page.getByPlaceholder('you@randall.local').fill('nobody@example.com');
    await page.getByPlaceholder('••••••••').fill('anything');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.getByPlaceholder('you@randall.local').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('registers a new account and shows pending approval message', async ({ page }) => {
    // Switch to register mode
    await page.locator('button').filter({ hasText: 'Register' }).first().click();

    await page.getByPlaceholder('you@randall.local').fill(`testuser+${Date.now()}@example.com`);
    await page.getByPlaceholder('••••••••').fill('Test@1234');
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Almost there.')).toBeVisible();
    await expect(page.getByText(/administrator will review/i)).toBeVisible();
  });

  test('signs out and returns to the sign-in form', async ({ page }) => {
    await page.getByPlaceholder('you@randall.local').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in →');
  });
});
