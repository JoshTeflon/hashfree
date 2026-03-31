import { createSectionObserver } from './observer';
import { updateUrl } from './history';

import type { ISectionNavInstance, ISectionNavOptions } from './types';

let activeClickHandlerCount = 0;

const handleAnchorClick = (event: MouseEvent): void => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const anchor = target.closest('a[href^="#"]');

  if (!anchor) return;

  const id = (anchor.getAttribute('href') ?? '').slice(1);
  const targetSection = document.getElementById(id);

  if (!targetSection) return;

  event.preventDefault();
  targetSection.scrollIntoView({ behavior: 'smooth' });
};

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

  if (activeClickHandlerCount === 0) {
    document.addEventListener('click', handleAnchorClick);
  }

  activeClickHandlerCount += 1;

  const observer = createSectionObserver(
    els,
    (id) => {
      updateUrl(id, updateStrategy, basePath);
      onNavigate?.(id);
    },
    { rootMargin, threshold }
  );

  let destroyed = false;

  return {
    destroy: (): void => {
      if (destroyed) return;

      destroyed = true;
      observer.disconnect();

      activeClickHandlerCount = Math.max(0, activeClickHandlerCount - 1);

      if (activeClickHandlerCount === 0) {
        document.removeEventListener('click', handleAnchorClick);
      }
    },
    navigateTo: (sectionId: string): void => {
      const targetSection = document.getElementById(sectionId);

      if (!targetSection) return;

      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
};