import { defineConfig, devices } from '@playwright/test';

// Naslov aplikacije: privzeto lokalni Vite strežnik, ki ga Playwright zažene sam.
// Za test proti objavljeni aplikaciji nastavi BASE_URL (npr. https://mindmend-a8839.web.app).
const baseURL = process.env.BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  // Testi si delijo testne račune in podatke v Firestore, zato tečejo zaporedno.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  // Rezultati: izpis v terminalu, HTML poročilo in JUnit XML za cevovod.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-report', open: 'never' }],
    ['junit', { outputFile: 'e2e-results/junit.xml' }],
  ],
  outputDir: 'e2e-results/artifacts',
  use: {
    baseURL,
    headless: true,
    // Aplikacija je zasnovana za telefon (max-w-md), zato je okno ozko.
    viewport: { width: 430, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 430, height: 900 } } }],
  // Če BASE_URL ni nastavljen, se aplikacija zažene lokalno (brez grafičnega vmesnika).
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --port 5173 --strictPort',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
