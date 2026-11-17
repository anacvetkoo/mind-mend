import { expect, test, type Page } from '@playwright/test';
import { login, requireAccount } from './helpers';

// TS-01: Dnevna prijava (F3). Uporabnik odgovori na 10 vprašanj in odda prijavo.
// Predpogoj: testni uporabnik danes še ni oddal dnevne prijave (sicer se test preskoči).

const TOTAL = 10;

/** Počaka na vprašanje n (animacija tipkanja se konča, ko se pokaže gumb Next/Complete). */
async function waitForQuestion(page: Page, n: number) {
  await expect(page.getByText(`Question ${n} of ${TOTAL}`)).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Next|Complete Check-In)/ })).toBeVisible();
}

const nextButton = (page: Page) => page.getByRole('button', { name: /^(Next|Complete Check-In)/ });

test.describe('TS-01 Dnevna prijava', () => {
  test.beforeEach(async ({ page }) => {
    requireAccount('user');
    await login(page, 'user');
    // Kartica na domačem zaslonu, ki odpre dnevno prijavo.
    const card = page.getByText('Take a moment to reflect on your emotions');
    const visible = await card.isVisible({ timeout: 20_000 }).catch(() => false);
    test.skip(!visible, 'Dnevna prijava je danes že oddana (kartica ni prikazana)');
    await card.click();
    await expect(page.getByRole('heading', { name: 'Daily Check-In' })).toBeVisible();
  });

  test('TS-01-A: uspešna oddaja vseh 10 vprašanj', async ({ page }) => {
    // 1 Počutje
    await waitForQuestion(page, 1);
    await page.getByRole('button', { name: /Neutral/ }).click();
    await nextButton(page).click();

    // 2 Čustva (več izbir)
    await waitForQuestion(page, 2);
    await page.getByRole('button', { name: /Calm/ }).click();
    await page.getByRole('button', { name: /Grateful/ }).click();
    await nextButton(page).click();

    // 3 Misli
    await waitForQuestion(page, 3);
    await page.locator('textarea').fill('Avtomatiziran test: misli dneva.');
    await nextButton(page).click();

    // 4 Stres (drsnik)
    await waitForQuestion(page, 4);
    await page.locator('input[type="range"]').fill('7');
    await expect(page.locator('input[type="range"]')).toHaveValue('7');
    await nextButton(page).click();

    // 5 Spanje
    await waitForQuestion(page, 5);
    await page.getByRole('button', { name: /Good/ }).click();
    await nextButton(page).click();

    // 6 Energija
    await waitForQuestion(page, 6);
    await page.locator('textarea').fill('Sprehod.');
    await nextButton(page).click();

    // 7 Težave (neobvezno): naprej brez odgovora
    await waitForQuestion(page, 7);
    await expect(nextButton(page)).toBeEnabled();
    await nextButton(page).click();

    // 8 Povezanost (drsnik)
    await waitForQuestion(page, 8);
    await page.locator('input[type="range"]').fill('4');
    await nextButton(page).click();

    // 9 Hvaležnost
    await waitForQuestion(page, 9);
    await page.locator('textarea').fill('Čaj.');
    await nextButton(page).click();

    // 10 Jutri (zadnje vprašanje: gumb Complete Check-In)
    await waitForQuestion(page, 10);
    await page.locator('textarea').fill('Počitek.');
    await expect(page.getByRole('button', { name: 'Complete Check-In' })).toBeVisible();
    await page.getByRole('button', { name: 'Complete Check-In' }).click();

    // Po shranitvi se zaslon dnevne prijave zapre.
    await expect(page.getByRole('heading', { name: 'Daily Check-In' })).toBeHidden({ timeout: 30_000 });
  });

  test('TS-01-B: Next je onemogočen, dokler ni odgovora', async ({ page }) => {
    await waitForQuestion(page, 1);
    await expect(nextButton(page)).toBeDisabled();
    await page.getByRole('button', { name: /Happy/ }).first().click();
    await expect(nextButton(page)).toBeEnabled();
  });

  test('TS-01-C: Back ohrani prejšnji odgovor', async ({ page }) => {
    await waitForQuestion(page, 1);
    await page.getByRole('button', { name: /Neutral/ }).click();
    await nextButton(page).click();
    await waitForQuestion(page, 2);
    await page.getByRole('button', { name: 'Back' }).click();
    await waitForQuestion(page, 1);
    // Izbran odgovor ima poudarjen rob (razred border-[var(--lavender)]).
    await expect(page.getByRole('button', { name: /Neutral/ })).toHaveClass(/border-\[var\(--lavender\)\]/);
  });

  test('TS-01-D: zaprtje zaslona prekine prijavo', async ({ page }) => {
    await waitForQuestion(page, 1);
    await page.getByRole('button', { name: /Neutral/ }).click();
    await page.locator('button:has(svg.lucide-x)').first().click();
    await expect(page.getByRole('heading', { name: 'Daily Check-In' })).toBeHidden();
  });
});
