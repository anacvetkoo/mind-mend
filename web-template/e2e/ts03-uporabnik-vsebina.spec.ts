import { expect, test, Page } from '@playwright/test';
import { E2E_CONTENT_TITLE, E2E_STEPS, login, openTab, requireAccount } from './helpers';

/** Aplikacija si zapomni korak, zato pred testom pridemo nazaj na korak 1. */
async function resetToFirstStep(page: Page) {
  await expect(page.getByText(/Step \d+ of \d+/)).toBeVisible();
  await page.waitForTimeout(1500); // počakamo, da se naloži shranjeni napredek
  const previous = page.getByRole('button', { name: 'Previous' });
  while (await previous.isVisible()) await previous.click();
  await expect(page.getByText(`Step 1 of ${E2E_STEPS.length}`)).toBeVisible();
}

// TS-03: Uporabnik poišče vsebino, jo opravi po korakih, všečka in shrani (F12).
// Predpogoj: TS-02-A je ustvaril vsebino z naslovom E2E_CONTENT_TITLE.
test.describe('TS-03 Uporabnik poišče in opravi vsebino', () => {
  test.beforeEach(async ({ page }) => {
    requireAccount('user');
    await login(page, 'user');
    await openTab(page, 'Explore');
    await page.getByPlaceholder('Search by title, therapist, category...').fill(E2E_CONTENT_TITLE);
    await page.getByText(E2E_CONTENT_TITLE).first().click();
    await expect(page.getByRole('heading', { name: E2E_CONTENT_TITLE })).toBeVisible();
    await resetToFirstStep(page);
  });

  test('TS-03-A: koraki se prikažejo in sejo je mogoče zaključiti', async ({ page }) => {
    for (let i = 0; i < E2E_STEPS.length; i++) {
      await expect(page.getByText(`Step ${i + 1} of ${E2E_STEPS.length}`)).toBeVisible();
      await expect(page.getByText(E2E_STEPS[i].title)).toBeVisible();
      const last = i === E2E_STEPS.length - 1;
      await page.getByRole('button', { name: last ? 'Finish' : 'Next', exact: true }).click();
    }
    await expect(page.getByText('You finished this session')).toBeVisible();
  });

  test('TS-03-B: Previous se vrne na prejšnji korak', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText(`Step 2 of ${E2E_STEPS.length}`)).toBeVisible();
    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(page.getByText(`Step 1 of ${E2E_STEPS.length}`)).toBeVisible();
  });

  test('TS-03-C: všeček se vklopi in izklopi', async ({ page }) => {
    const heart = page.locator('button:has(svg.lucide-heart)').first();
    await heart.click();
    await expect(heart.locator('svg')).toHaveClass(/fill-red-500/);
    await heart.click();
    await expect(heart.locator('svg')).not.toHaveClass(/fill-red-500/);
  });

   test('TS-03-D: vsebino je mogoče shraniti', async ({ page }) => {
    await page.locator('button:has(svg.lucide-bookmark-plus)').first().click();
    await expect(page.getByRole('heading', { name: 'Save content' })).toBeVisible();

    const toggle = page.locator('button:has(p:text-is("Save without collection"))');
    await expect(toggle).toBeVisible();
    await page.waitForTimeout(1500); // nalaganje zbirk
    // Če možnost ni označena, jo označimo (privzeto jo aplikacija označi sama).
    if (!(await toggle.locator('svg.lucide-check').isVisible())) {
      await toggle.click();
    }
    await expect(toggle.locator('svg.lucide-check')).toBeVisible();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Save content' })).toBeHidden();
    await expect(page.locator('button:has(svg.lucide-bookmark)').first()).toBeVisible();
  });
});
