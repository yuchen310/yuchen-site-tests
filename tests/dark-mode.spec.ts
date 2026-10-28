import { test, expect, type Page } from '@playwright/test';

// Tests for "## Issue #1: dark-mode toggle" in SPEC.md.
// The spec does not say whether the site starts light or dark, so each test
// records the starting state and checks that it flips.

const DARK = /(^|\s)dark(\s|$)/;

async function isDark(page: Page) {
  return page.evaluate(() => document.body.classList.contains('dark'));
}

async function expectDark(page: Page, dark: boolean) {
  const body = page.locator('body');
  if (dark) await expect(body).toHaveClass(DARK);
  else await expect(body).not.toHaveClass(DARK);
}

// SPEC.md:10 says "a button in the nav" without saying which one, so the test
// requires there to be exactly one. If the nav gets more buttons, the spec needs
// to say how to identify the toggle.
function toggle(page: Page) {
  return page.locator('nav').getByRole('button');
}

test('SPEC.md:10 - a button in the nav toggles a dark class on <body>', async ({ page }) => {
  await page.goto('./');
  await expect(toggle(page), 'expected exactly one button in <nav>').toHaveCount(1);

  const start = await isDark(page);
  await toggle(page).click();
  await expectDark(page, !start);
  await toggle(page).click();
  await expectDark(page, start);
});

// "Kept for the session" is read as: survives a reload in the same tab.
test('SPEC.md:11 - the dark-mode choice is kept for the session', async ({ page }) => {
  await page.goto('./');
  const start = await isDark(page);

  await toggle(page).click();
  await expectDark(page, !start);
  await page.reload();
  await expectDark(page, !start);

  await toggle(page).click();
  await expectDark(page, start);
  await page.reload();
  await expectDark(page, start);
});
