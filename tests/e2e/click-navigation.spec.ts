import { expect, test } from 'playwright/test';

import { waitForPathname, waitForSectionAtTop } from './utils';
import { NavWindow } from './types';

test('clicking <a href="#contact"> navigates without hash appearing even momentarily', async ({ page }) => {
  await page.goto('/');

  // Intercept all history state changes to capture every URL that appears
  await page.evaluate(() => {
    const win = window as unknown as NavWindow;
    win.__urlHistory = [window.location.href];

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState(...args);
      win.__urlHistory.push(window.location.href);
    };

    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState(...args);
      win.__urlHistory.push(window.location.href);
    };

    window.addEventListener('hashchange', () => {
      win.__urlHistory.push(window.location.href);
    });
  });

  await page.click('nav a[href="#contact"]');
  await waitForPathname(page, '/contact');

  const urlHistory = await page.evaluate(() => (window as unknown as NavWindow).__urlHistory);

  for (const url of urlHistory) {
    expect(url, `URL "${url}" should not contain a hash`).not.toContain('#');
  }
});

test('clicking a nav link updates the active URL path', async ({ page }) => {
  await page.goto('/');

  await page.click('nav a[href="#about"]');
  await waitForPathname(page, '/about');

  const url = new URL(page.url());
  expect(url.pathname).toBe('/about');
  expect(url.hash).toBe('');
});

test('programmatic navigateTo("team") scrolls correctly and updates URL', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    (window as unknown as NavWindow).__nav.navigateTo('team');
  });

  await waitForPathname(page, '/team');
  await waitForSectionAtTop(page, 'team');
});
