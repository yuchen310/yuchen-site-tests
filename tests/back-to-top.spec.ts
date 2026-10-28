import { test, expect, type Page } from '@playwright/test';

// Tests for "## Issue #4: back-to-top button" in SPEC.md.
//
// The spec does not say how to identify the button (no id, label or text).
// Interpretation: it is the one element with role "button" whose accessible
// name contains the word "top" (e.g. "Back to top", "Scroll to top"). A link
// (<a href="#top">) or an icon-only button with no label will not be found. The
// spec should name the button's label or id so this does not depend on a guess.
//
// "Hidden" is read as not visible to the user: absent, display:none,
// visibility:hidden, or opacity 0. Playwright alone counts opacity 0 as visible,
// so opacity is checked separately.

type State = 'hidden' | 'shown' | 'ambiguous';

function backToTop(page: Page) {
  return page.getByRole('button', { name: /\btop\b/i });
}

async function buttonState(page: Page): Promise<State> {
  const matches = backToTop(page);
  const count = await matches.count();
  if (count > 1) return 'ambiguous';
  if (count === 0 || !(await matches.isVisible())) return 'hidden';
  const opacity = await matches.evaluate((el) => getComputedStyle(el).opacity);
  return Number(opacity) === 0 ? 'hidden' : 'shown';
}

function expectButton(page: Page, state: State) {
  return expect
    .poll(() => buttonState(page), { message: `back-to-top button should be ${state}` })
    .toBe(state);
}

// "Scrolled past the hero section" is read as: the bottom edge of #hero is above
// the top of the viewport.
async function scrollPastHero(page: Page) {
  const target = await page.locator('#hero').evaluate(
    (hero) => Math.ceil(hero.getBoundingClientRect().bottom + window.scrollY) + 1,
  );
  await scrollTo(page, target);
}

async function scrollTo(page: Page, y: number) {
  // 'instant' so a CSS scroll-behavior: smooth on the page does not slow the test.
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await expect
    .poll(() => page.evaluate(() => window.scrollY), {
      message: `page should scroll to y=${y} (is it tall enough?)`,
    })
    .toBeGreaterThanOrEqual(y);
}

test('SPEC.md:14 - the back-to-top button appears after scrolling past the hero section', async ({ page }) => {
  await page.goto('./');
  await scrollPastHero(page);
  await expectButton(page, 'shown');
});

// Line 15 also says the button "appears after scrolling past #hero"; that part is
// the same requirement as line 14 and is covered by the test above.

// "Hidden at the top of the page" is read as hidden whenever scrollY is 0: on
// first load, and again after scrolling down and back up. Checking that it shows
// in between proves the button exists, so the hidden checks are not passing
// just because there is no button at all.
test('SPEC.md:15 - the back-to-top button is hidden at the top of the page', async ({ page }) => {
  await page.goto('./');
  await expectButton(page, 'hidden');

  await scrollPastHero(page);
  await expectButton(page, 'shown');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expectButton(page, 'hidden');
});

// "Returns the page to the top" is read as window.scrollY reaching 0. Smooth
// scrolling is allowed to take up to the default expect timeout.
test('SPEC.md:15 - clicking the back-to-top button returns the page to the top', async ({ page }) => {
  await page.goto('./');
  await scrollPastHero(page);
  await expectButton(page, 'shown');

  await backToTop(page).click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { message: 'page should be back at the top' })
    .toBe(0);
});
