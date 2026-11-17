import { expect, test, type Page } from '@playwright/test';

// Testni računi se preberejo iz okolja, v kodi ni gesel.
export const accounts = {
  user: { email: process.env.E2E_USER_EMAIL, password: process.env.E2E_USER_PASSWORD },
  therapist: { email: process.env.E2E_THERAPIST_EMAIL, password: process.env.E2E_THERAPIST_PASSWORD },
};

type Role = keyof typeof accounts;

/** Preskoči test, če račun za vlogo ni nastavljen (npr. v cevovodu brez skrivnosti). */
export function requireAccount(role: Role) {
  const a = accounts[role];
  test.skip(!a.email || !a.password, `Nastavi E2E_${role.toUpperCase()}_EMAIL in E2E_${role.toUpperCase()}_PASSWORD`);
}

/** Odpre aplikacijo mimo uvodnega zaslona in vodiča (to je stanje po prvem obisku). */
export async function openApp(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenWelcome', 'true');
    localStorage.setItem('hasSeenTutorial', 'true');
  });
  await page.goto('/');
  // Uvodni zaslon (splash) traja 3 s, nato se pokaže prijava.
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible({ timeout: 20_000 });
}

/** Prijava z e-pošto in geslom prek uporabniškega vmesnika. */
export async function login(page: Page, role: Role) {
  const { email, password } = accounts[role];
  await openApp(page);
  await page.getByPlaceholder('Email').fill(email!);
  await page.getByPlaceholder('Password').fill(password!);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  // Po uspešni prijavi prijavni zaslon izgine.
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeHidden({ timeout: 30_000 });
}

/** Klik na zavihek spodnje navigacije po napisu. */
export async function openTab(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

// Naslov vsebine, ki jo ustvari TS-02 in uporabi TS-03. Po testih jo izbriše ts99-ciscenje.
export const E2E_CONTENT_TITLE = 'E2E avtomatski test vsebine';
export const E2E_STEPS = [
  { title: 'Sedi udobno', description: 'Poišči miren prostor.' },
  { title: 'Globok vdih', description: 'Vdihni skozi nos, štej do štiri.' },
  { title: 'Počasen izdih', description: 'Izdihni skozi usta, štej do šest.' },
];

/** Na seznamu My Content izbriše vse elemente z E2E naslovom (potrdilno okno sprejme samodejno). */
export async function deleteE2eContent(page: Page) {
  page.on('dialog', (d) => d.accept());
  await openTab(page, 'My Content');
  await expect(page.getByRole('heading', { name: 'My Content' })).toBeVisible();
  await expect(page.getByText('Loading content...')).toBeHidden({ timeout: 30_000 });
  for (let i = 0; i < 10; i++) {
    const card = page.locator('div.relative.bg-card', { hasText: E2E_CONTENT_TITLE }).first();
    if (!(await card.isVisible().catch(() => false))) break;
    await card.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Loading content...')).toBeHidden({ timeout: 30_000 });
  }
}
