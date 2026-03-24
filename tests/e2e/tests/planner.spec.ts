import { test, expect } from '@playwright/test';
import { loginAsAdmin, offsetDate } from './helpers';

test.describe('Planner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('displays both pods with 8 desks each', async ({ page }) => {
    // Wait for floor plan to load — at least one free desk must be visible
    await expect(page.getByRole('button', { name: 'D1 Free' })).toBeVisible();

    // All 16 desk buttons contain a desk label (D1–D16) in their text content
    const allDesks = page.getByRole('button').filter({ hasText: /D\d+/ });
    await expect(allDesks).toHaveCount(16);
  });

  test('date picker is constrained to today and 14 days ahead', async ({ page }) => {
    const input = page.locator('input[type="date"]');
    const today = offsetDate(0);
    const max = offsetDate(14);

    await expect(input).toHaveAttribute('min', today);
    await expect(input).toHaveAttribute('max', max);
  });

  test('previous-day button is disabled when on today', async ({ page }) => {
    await expect(page.getByRole('button', { name: '←' })).toBeDisabled();
  });

  test('next-day button is disabled when on the maximum date', async ({ page }) => {
    const input = page.locator('input[type="date"]');
    await input.fill(offsetDate(14));
    await input.dispatchEvent('change');

    await expect(page.getByRole('button', { name: '→' })).toBeDisabled();
  });

  test('reserves a desk and shows it as Mine', async ({ page }) => {
    const targetDate = offsetDate(7);
    const input = page.locator('input[type="date"]');
    await input.fill(targetDate);
    await input.dispatchEvent('change');

    await page.getByRole('button', { name: 'D1 Free' }).click();
    await expect(page.getByRole('heading', { name: 'Reserve desk' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('button', { name: /^D1\s+Mine/ })).toBeVisible();

    // Clean up
    await page.getByRole('button', { name: /^D1\s+Mine/ }).click();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
  });

  test('reserved desk appears in My reservations', async ({ page }) => {
    const targetDate = offsetDate(8);
    const input = page.locator('input[type="date"]');
    await input.fill(targetDate);
    await input.dispatchEvent('change');

    await page.getByRole('button', { name: 'D2 Free' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('heading', { name: 'My reservations' })).toBeVisible();
    await expect(page.locator('section').filter({ hasText: 'My reservations' }).getByText('D2')).toBeVisible();

    // Clean up
    await page.getByRole('button', { name: /^D2\s+Mine/ }).click();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
  });

  test('cancels a reservation and desk returns to Free', async ({ page }) => {
    const targetDate = offsetDate(9);
    const input = page.locator('input[type="date"]');
    await input.fill(targetDate);
    await input.dispatchEvent('change');

    // Reserve
    await page.getByRole('button', { name: 'D3 Free' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('button', { name: /^D3\s+Mine/ })).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /^D3\s+Mine/ }).click();
    await expect(page.getByRole('heading', { name: 'Cancel reservation' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();

    await expect(page.getByRole('button', { name: 'D3 Free' })).toBeVisible();
  });

  test('dismisses the reservation modal when clicking Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'D4 Free' }).click();
    await expect(page.getByRole('heading', { name: 'Reserve desk' })).toBeVisible();

    // Scope to the modal overlay to avoid matching Cancel buttons in My reservations
    await page.locator('.fixed.inset-0').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Reserve desk' })).not.toBeVisible();
  });
});
