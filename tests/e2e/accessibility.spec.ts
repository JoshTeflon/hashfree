import { expect, test } from 'playwright/test';

import { NavWindow } from './types';
import { scrollToSection, waitForPathname } from './utils';

test('aria-current="page" updates on nav links as sections change', async ({ page }) => {
  await page.goto('/');

  await scrollToSection(page, 'about');
  await waitForPathname(page, '/about');

  await expect(page.locator('nav a[href="#about"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('nav a[href="#home"]')).not.toHaveAttribute('aria-current');
  await expect(page.locator('nav a[href="#pricing"]')).not.toHaveAttribute('aria-current');
  await expect(page.locator('nav a[href="#contact"]')).not.toHaveAttribute('aria-current');

  await scrollToSection(page, 'pricing');
  await waitForPathname(page, '/pricing');

  await expect(page.locator('nav a[href="#pricing"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('nav a[href="#about"]')).not.toHaveAttribute('aria-current');
});

test('focus moves to the target section after programmatic navigateTo()', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    (window as unknown as NavWindow).__nav.navigateTo('contact');
  });

  await expect(page.locator('#contact')).toBeFocused();
});

test('prefers-reduced-motion: scrollIntoView is called with behavior "auto" not "smooth"', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as NavWindow;
    win.__scrollCalls = [];

    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions | boolean) {
      win.__scrollCalls.push(options);
      return original.call(this, options);
    };
  });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await page.evaluate(() => {
    (window as unknown as NavWindow).__nav.navigateTo('pricing');
  });

  const calls = await page.evaluate(() => (window as unknown as NavWindow).__scrollCalls);
  const navigateCall = calls[calls.length - 1];

  expect(navigateCall).toMatchObject({ behavior: 'auto' });
});
