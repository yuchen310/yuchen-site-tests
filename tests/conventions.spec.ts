import { test, expect } from '@playwright/test';

// Tests for "## Conventions" in SPEC.md.

test('SPEC.md:4 - sections #hero #about #skills #projects #repos #contact all exist', async ({ page }) => {
  await page.goto('./');
  for (const id of ['hero', 'about', 'skills', 'projects', 'repos', 'contact']) {
    await expect.soft(page.locator(`#${id}`), `#${id} should exist`).toBeAttached();
  }
});

test.describe('at 375px wide', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('SPEC.md:5 - no horizontal scroll at a viewport width of 375px', async ({ page }) => {
    await page.goto('./');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, 'page content is wider than the viewport').toBeLessThanOrEqual(clientWidth);
  });
});

// SPEC.md:6 does not define what a "card" is, whose repos are listed, or what the
// "plain message" says, so this only checks what both outcomes have in common:
// #repos ends up showing some text. It cannot tell cards from a message, and a
// stuck "Loading..." placeholder would also pass.
test('SPEC.md:6 - #repos shows repo cards or a plain message', async ({ page }) => {
  await page.goto('./');
  const repos = page.locator('#repos');
  await expect(repos).toBeVisible();
  await expect(repos).not.toHaveText(/^\s*$/);
});

test('SPEC.md:7 - #hero and #contact contain links to email, GitHub and LinkedIn', async ({ page }) => {
  await page.goto('./');
  for (const id of ['hero', 'contact']) {
    const section = page.locator(`#${id}`);
    await expect.soft(section.locator('a[href^="mailto:"]'), `#${id} email link`).not.toHaveCount(0);
    await expect.soft(section.locator('a[href*="github.com"]'), `#${id} GitHub link`).not.toHaveCount(0);
    await expect.soft(section.locator('a[href*="linkedin.com"]'), `#${id} LinkedIn link`).not.toHaveCount(0);
  }
});
