import { expect, test } from '@playwright/test';
import { E2E_CONTENT_TITLE, E2E_STEPS, deleteE2eContent, login, openTab, requireAccount } from './helpers';

// TS-02: Terapevt doda vsebino s koraki (F11). Brez nalaganja datotek (Storage) in brez Stripe.
test.describe('TS-02 Terapevt doda vsebino s koraki', () => {
  test.beforeEach(async ({ page }) => {
    requireAccount('therapist');
    await login(page, 'therapist');
  });

  test('TS-02-A: objava vsebine z 3 koraki se pojavi na seznamu', async ({ page }) => {
    // Počisti ostanek prejšnjega zagona, da je rezultat enoznačen.
    await deleteE2eContent(page);

    await page.locator('[data-add-content-trigger]').click();
    await expect(page.getByRole('heading', { name: 'Add New Content' })).toBeVisible();

    await page.getByPlaceholder('e.g., Ocean Waves Meditation').fill(E2E_CONTENT_TITLE);
    await page.getByRole('button', { name: 'Breathing', exact: true }).click();
    await page.getByRole('button', { name: 'Easy', exact: true }).click();
    await page.getByRole('button', { name: 'Add Steps' }).click();
    await page.getByPlaceholder('Example: 10').fill('5');

    // Prvi korak je že prikazan, ostala dva dodamo.
    await page.getByRole('button', { name: 'Add Step', exact: true }).click();
    await page.getByRole('button', { name: 'Add Step', exact: true }).click();
    const titles = page.getByPlaceholder('Step title');
    const descs = page.getByPlaceholder('Description');
    await expect(titles).toHaveCount(3);
    for (let i = 0; i < E2E_STEPS.length; i++) {
      await titles.nth(i).fill(E2E_STEPS[i].title);
      await descs.nth(i).fill(E2E_STEPS[i].description);
    }
    await page.getByPlaceholder('Describe what this session includes...').fill('Vsebina, ustvarjena z avtomatskim testom.');

    await page.getByRole('button', { name: 'Publish Session' }).click();

    // Urejevalnik se zapre in vsebina se pokaže na seznamu objavljenih (brez oznake Draft).
    await expect(page.getByRole('heading', { name: 'Add New Content' })).toBeHidden({ timeout: 30_000 });
    const card = page.locator('div.relative.bg-card', { hasText: E2E_CONTENT_TITLE }).first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card).not.toContainText('Draft');
    await expect(card).toContainText('Breathing');
  });

  test('TS-02-B: brez naslova vsebine ni mogoče objaviti', async ({ page }) => {
    let alertText = '';
    page.on('dialog', async (d) => {
      alertText = d.message();
      await d.accept();
    });
    await openTab(page, 'My Content');
    await page.locator('[data-add-content-trigger]').click();
    await page.getByRole('button', { name: 'Publish Session' }).click();
    await expect.poll(() => alertText).toContain('Please fill in all required fields');
    await expect(page.getByRole('heading', { name: 'Add New Content' })).toBeVisible();
  });

  test('TS-02-C: brez trajanja vsebine s koraki ni mogoče objaviti', async ({ page }) => {
    let alertText = '';
    page.on('dialog', async (d) => {
      alertText = d.message();
      await d.accept();
    });
    await openTab(page, 'My Content');
    await page.locator('[data-add-content-trigger]').click();
    await page.getByPlaceholder('e.g., Ocean Waves Meditation').fill('E2E brez trajanja');
    await page.getByRole('button', { name: 'Add Steps' }).click();
    await page.getByRole('button', { name: 'Publish Session' }).click();
    await expect.poll(() => alertText).toContain('Please enter duration');
  });
});
