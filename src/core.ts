import { createSectionObserver } from './observer';
import { updateUrl } from './history';

import { ISectionNavInstance, ISectionNavOptions } from './types';

export const createSectionNav = (
  options: ISectionNavOptions = {}
): ISectionNavInstance => {
  const {
    sections = '[data-section]',
    rootMargin = '0px',
    threshold = 0.5,
    updateStrategy = 'replace',
    onNavigate,
    basePath = '',
  } = options;

  // resolve elements
  const els: Element[] = typeof sections === 'string'
    ? Array.from(document.querySelectorAll(sections))
    : Array.from(sections);

  // intercept anchor clicks to prevent hash appearing momentarily in the URL
  const handleAnchorClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const anchor = target.closest('a[href^="#"]');

    if (!anchor) return;

    const id = (anchor.getAttribute('href') ?? '').slice(1);
    const targetSection = document.getElementById(id);

    if (!targetSection) return;

    event.preventDefault();
    targetSection.scrollIntoView({ behavior: 'smooth' });
  };

  document.addEventListener('click', handleAnchorClick);

  const observer = createSectionObserver(
    els,
    (id) => {
      updateUrl(id, updateStrategy, basePath);
      onNavigate?.(id);
    },
    { rootMargin, threshold }
  );

  return {
    destroy: () => {
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
    },
    navigateTo: (sectionId: string) => {
      const targetSection = document.getElementById(sectionId);

      if (!targetSection) return;

      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
};