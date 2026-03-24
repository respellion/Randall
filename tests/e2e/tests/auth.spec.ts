import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the sign-in form on initial load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Office Planner' })).toBeVisible();
    await expect(page.getByPlaceholder('jane@company.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in');
  });

  test('signs in with valid credentials and reaches the planner', async ({ page }) => {
    await page.getByPlaceholder('jane@company.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Reserve your workspace up to 2 weeks ahead')).toBeVisible();
  });

  test('shows an error for an unknown email', async ({ page }) => {
    await page.getByPlaceholder('jane@company.com').fill('nobody@example.com');
    await page.getByPlaceholder('••••••••').fill('anything');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.getByPlaceholder('jane@company.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('registers a new account and shows pending approval message', async ({ page }) => {
    // Switch to register mode
    await page.locator('button').filter({ hasText: 'Create account' }).first().click();

    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('jane@company.com').fill(`testuser+${Date.now()}@example.com`);
    await page.getByPlaceholder('••••••••').fill('Test@1234');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Account pending approval')).toBeVisible();
    await expect(page.getByText(/administrator will review/i)).toBeVisible();
  });

  test('signs out and returns to the sign-in form', async ({ page }) => {
    await page.getByPlaceholder('jane@company.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');

    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in');
  });
});
