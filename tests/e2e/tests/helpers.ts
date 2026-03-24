import { type Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@randall.local';
export const ADMIN_PASSWORD = 'Admin@123';
export const ADMIN_NAME = 'Admin';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByPlaceholder('jane@company.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/');
  await page.getByText('Reserve your workspace up to 2 weeks ahead').waitFor();
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
}

/** Returns today's date offset by `days` in yyyy-MM-dd format */
export function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
