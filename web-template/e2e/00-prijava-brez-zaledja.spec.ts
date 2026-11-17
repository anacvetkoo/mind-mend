import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

// TC-00: preverjanje prijavnega zaslona. Ne potrebuje Firebase računa ali omrežja do zaledja,
// zato se izvede tudi v cevovodu brez skrivnosti.
test.describe('TC-00 Prijavni zaslon (brez zaledja)', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('prikaže obrazec za prijavo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeVisible();
  });

  test('geslo je privzeto skrito in ga je mogoče pokazati', async ({ page }) => {
    const password = page.getByPlaceholder('Password');
    await expect(password).toHaveAttribute('type', 'password');
    // Gumb z ikono očesa je edini gumb v istem polju za geslo.
    await password.locator('xpath=following-sibling::button').click();
    await expect(page.getByPlaceholder('Password')).toHaveAttribute('type', 'text');
  });

  test('prazen obrazec se ne odda (obvezni polji)', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    const missing = await page.getByPlaceholder('Email').evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(missing).toBe(true);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });

  test('pozabljeno geslo: prazno polje pokaže napako', async ({ page }) => {
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.getByText('Please enter your email address.')).toBeVisible();
  });

  test('povezava Sign up odpre izbiro vloge', async ({ page }) => {
    await page.getByRole('button', { name: /Don't have an account\?/ }).click();
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeHidden();
  });
});
