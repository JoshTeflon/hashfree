import { expect, type Page } from 'playwright/test';

export const waitForPathname = async (page: Page, expectedPath: string): Promise<void> => {
  await expect.poll(() => new URL(page.url()).pathname).toBe(expectedPath);
};

export const waitForSectionAtTop = async (page: Page, sectionId: string): Promise<void> => {
  await expect.poll(async () => {
    return page.locator(`#${sectionId}`).evaluate((el) => Math.abs(el.getBoundingClientRect().top));
  }).toBeLessThan(8);
};

export const scrollToSection = async (page: Page, sectionId: string): Promise<void> => {
  await page.locator(`#${sectionId}`).evaluate((el) => {
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
};
