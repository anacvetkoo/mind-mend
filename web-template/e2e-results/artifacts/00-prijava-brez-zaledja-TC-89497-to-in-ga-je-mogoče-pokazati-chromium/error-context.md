# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 00-prijava-brez-zaledja.spec.ts >> TC-00 Prijavni zaslon (brez zaledja) >> geslo je privzeto skrito in ga je mogoče pokazati
- Location: e2e/00-prijava-brez-zaledja.spec.ts:19:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByPlaceholder('Password')
Expected: "text"
Received: "password"
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" getByPlaceholder('Password') with timeout 15000ms
  - waiting for getByPlaceholder('Password')
    34 × locator resolved to <input value="" required="" type="password" placeholder="Password" class="w-full h-12 pl-12 pr-12 rounded-2xl bg-card border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none shadow-md transition-all"/>
       - unexpected value "password"

```

```yaml
- textbox "Password"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { openApp } from './helpers';
  3  | 
  4  | // TC-00: preverjanje prijavnega zaslona. Ne potrebuje Firebase računa ali omrežja do zaledja,
  5  | // zato se izvede tudi v cevovodu brez skrivnosti.
  6  | test.describe('TC-00 Prijavni zaslon (brez zaledja)', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await openApp(page);
  9  |   });
  10 | 
  11 |   test('prikaže obrazec za prijavo', async ({ page }) => {
  12 |     await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  13 |     await expect(page.getByPlaceholder('Email')).toBeVisible();
  14 |     await expect(page.getByPlaceholder('Password')).toBeVisible();
  15 |     await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
  16 |     await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeVisible();
  17 |   });
  18 | 
  19 |   test('geslo je privzeto skrito in ga je mogoče pokazati', async ({ page }) => {
  20 |     const password = page.getByPlaceholder('Password');
  21 |     await expect(password).toHaveAttribute('type', 'password');
  22 |     // Gumb z ikono očesa je edini gumb v istem polju za geslo.
  23 |     await password.locator('xpath=following-sibling::button').click();
> 24 |     await expect(page.getByPlaceholder('Password')).toHaveAttribute('type', 'text');
     |                                                     ^ Error: expect(locator).toHaveAttribute(expected) failed
  25 |   });
  26 | 
  27 |   test('prazen obrazec se ne odda (obvezni polji)', async ({ page }) => {
  28 |     await page.getByRole('button', { name: 'Log in', exact: true }).click();
  29 |     const missing = await page.getByPlaceholder('Email').evaluate((el: HTMLInputElement) => el.validity.valueMissing);
  30 |     expect(missing).toBe(true);
  31 |     await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  32 |   });
  33 | 
  34 |   test('pozabljeno geslo: prazno polje pokaže napako', async ({ page }) => {
  35 |     await page.getByRole('button', { name: 'Forgot password?' }).click();
  36 |     await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  37 |     await page.getByRole('button', { name: 'Send reset link' }).click();
  38 |     await expect(page.getByText('Please enter your email address.')).toBeVisible();
  39 |   });
  40 | 
  41 |   test('povezava Sign up odpre izbiro vloge', async ({ page }) => {
  42 |     await page.getByRole('button', { name: /Don't have an account\?/ }).click();
  43 |     await expect(page.getByRole('heading', { name: 'Log in' })).toBeHidden();
  44 |   });
  45 | });
  46 | 
```