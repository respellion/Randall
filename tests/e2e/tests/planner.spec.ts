import { test, expect } from '@playwright/test';
import { loginAsAdmin, offsetDate, selectDate } from './helpers';

test.describe('Planner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('displays both pods with 8 desks each', async ({ page }) => {
    // Wait for floor plan to load — at least one free desk must be visible
    await expect(page.getByRole('button', { name: /^D1 free$/i })).toBeVisible();

    // All 16 desk buttons contain a desk label (D1–D16) in their text content
    const allDesks = page.getByRole('button').filter({ hasText: /^D\d+/ });
    await expect(allDesks).toHaveCount(16);
  });

  test('date strip shows 14 days and respects boundaries', async ({ page }) => {
    // 14 day-strip cells are rendered (one per bookable day)
    await expect(page.locator('[data-date]')).toHaveCount(14);

    // Today and the last bookable day are both present
    await expect(page.locator(`[data-date="${offsetDate(0)}"]`)).toBeVisible();
    await expect(page.locator(`[data-date="${offsetDate(13)}"]`)).toBeVisible();

    // Clicking the last day disables the forward arrow
    await page.locator(`[data-date="${offsetDate(13)}"]`).click();
    await expect(page.getByRole('button', { name: '→' })).toBeDisabled();
  });

  test('previous-day button is disabled when on today', async ({ page }) => {
    await expect(page.getByRole('button', { name: '←' })).toBeDisabled();
  });

  test('next-day button is disabled when on the maximum date', async ({ page }) => {
    await page.locator(`[data-date="${offsetDate(13)}"]`).click();

    await expect(page.getByRole('button', { name: '→' })).toBeDisabled();
  });

  test('reserves a desk and shows it as yours', async ({ page }) => {
    await selectDate(page, 7);

    await page.getByRole('button', { name: /^D1 free$/i }).click();
    await expect(page.getByRole('dialog').getByText('Reserve desk')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('button', { name: /^D1 yours$/i })).toBeVisible();

    // Clean up
    await page.getByRole('button', { name: /^D1 yours$/i }).click();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
  });

  test('reserved desk appears in My reservations', async ({ page }) => {
    await selectDate(page, 8);

    await page.getByRole('button', { name: /D2.*free/i }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('My reservations')).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'D2' })).toBeVisible();

    // Clean up
    await page.getByRole('button', { name: /D2.*yours/i }).click();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
  });

  test('cancels a reservation and desk returns to free', async ({ page }) => {
    await selectDate(page, 9);

    // Reserve
    await page.getByRole('button', { name: /D3.*free/i }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('button', { name: /D3.*yours/i })).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /D3.*yours/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();

    await expect(page.getByRole('button', { name: /D3.*free/i })).toBeVisible();
  });

  test('dismisses the reservation modal when clicking Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /D4.*free/i }).click();
    await expect(page.getByRole('dialog').getByText('Reserve desk')).toBeVisible();

    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
