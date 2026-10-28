import { defineConfig, devices } from '@playwright/test';

const rawBaseURL = process.env.BASE_URL;
if (!rawBaseURL) {
  throw new Error('BASE_URL is not set. Example: BASE_URL=https://example.com npm test');
}
// BASE_URL may include a path (e.g. https://user.github.io/site/). Tests navigate
// with relative URLs like './', which only keep that path if it ends in '/'.
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
