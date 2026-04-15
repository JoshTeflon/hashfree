import { expect, test, type Page } from 'playwright/test';

const scrollToSection = async (page: Page, sectionId: string): Promise<void> => {
  await page.locator(`#${sectionId}`).evaluate((el) => {
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
};

const waitForPathname = async (page: Page, expectedPath: string): Promise<void> => {
  await expect.poll(() => new URL(page.url()).pathname).toBe(expectedPath);
};

const waitForSectionAtTop = async (page: Page, sectionId: string): Promise<void> => {
  await expect.poll(async () => {
    return page.locator(`#${sectionId}`).evaluate((el) => Math.abs(el.getBoundingClientRect().top));
  }).toBeLessThan(8);
};

test('scrolling to a section updates URL to /sectionId, never /#sectionId', async ({ page }) => {
  await page.goto('/');

  await scrollToSection(page, 'about');
  await waitForPathname(page, '/about');

  expect(page.url()).not.toContain('/#about');
  expect(page.url()).not.toContain('#about');
});

test('URL updates without a full page reload', async ({ page }) => {
  await page.goto('/');

  const markerBefore = await page.evaluate(() => (window as Window & { __fixtureMarker?: string }).__fixtureMarker);

  await scrollToSection(page, 'pricing');
  await waitForPathname(page, '/pricing');

  const markerAfter = await page.evaluate(() => (window as Window & { __fixtureMarker?: string }).__fixtureMarker);

  expect(markerAfter).toBe(markerBefore);
});

test('browser back button scrolls back to the previous section', async ({ page }) => {
  await page.goto('/home');

  await scrollToSection(page, 'about');
  await waitForPathname(page, '/about');

  await scrollToSection(page, 'pricing');
  await waitForPathname(page, '/pricing');

  await page.goBack();

  await waitForPathname(page, '/about');
  await waitForSectionAtTop(page, 'about');
});

test('browser forward button scrolls forward to the correct section', async ({ page }) => {
  await page.goto('/home');

  await scrollToSection(page, 'about');
  await waitForPathname(page, '/about');

  await scrollToSection(page, 'pricing');
  await waitForPathname(page, '/pricing');

  await page.goBack();
  await waitForPathname(page, '/about');

  await page.goForward();

  await waitForPathname(page, '/pricing');
  await waitForSectionAtTop(page, 'pricing');
});

test('direct navigation to /about on page load scrolls to the about section', async ({ page }) => {
  await page.goto('/about');

  await waitForPathname(page, '/about');
  await waitForSectionAtTop(page, 'about');
});

test('refreshing the page on /about keeps the user on the about section', async ({ page }) => {
  await page.goto('/about');

  await waitForPathname(page, '/about');
  await waitForSectionAtTop(page, 'about');

  await page.reload();

  await waitForPathname(page, '/about');
  await waitForSectionAtTop(page, 'about');
});
