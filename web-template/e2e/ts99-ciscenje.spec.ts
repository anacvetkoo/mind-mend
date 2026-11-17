import { test } from '@playwright/test';
import { deleteE2eContent, login, requireAccount } from './helpers';

// Počisti testno vsebino, ustvarjeno v TS-02, da se podatki v Firestore ne kopičijo.
test('čiščenje: izbriše E2E vsebino', async ({ page }) => {
  requireAccount('therapist');
  await login(page, 'therapist');
  await deleteE2eContent(page);
});
