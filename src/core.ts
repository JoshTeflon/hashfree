import { createSectionObserver } from './observer';
import { updateUrl } from './history';

import type { SectionNavInstance, SectionNavOptions } from './types';

type ScrollBehaviorResolver = () => ScrollBehavior;

const clickResolvers = new Set<ScrollBehaviorResolver>();

const handleAnchorClick = (event: MouseEvent): void => {
  if (clickResolvers.size === 0) return;

  const target = event.target;

  if (!(target instanceof Element)) return;

  const anchor = target.closest('a[href^="#"]');

  if (!anchor) return;

  const id = (anchor.getAttribute('href') ?? '').slice(1);
  const targetSection = document.getElementById(id);

  if (!targetSection) return;

  const resolve = clickResolvers.values().next().value as ScrollBehaviorResolver;

  event.preventDefault();
  targetSection.scrollIntoView({ behavior: resolve() });
};

export const createSectionNav = (
  options: SectionNavOptions = {}
): SectionNavInstance => {
  if (typeof document === 'undefined') {
    return { destroy: (): void => {}, navigateTo: (): void => {} };
  }

  const {
    sections = '[data-section]',
    rootMargin = '0px',
    threshold = 0.5,
    updateStrategy = 'replace',
    onNavigate,
    basePath = '',
    scrollBehavior,
  } = options;

  const resolveScrollBehavior = (): ScrollBehavior =>
    scrollBehavior ?? (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  const els: Element[] = typeof sections === 'string'
    ? Array.from(document.querySelectorAll(sections))
    : Array.from(sections);

  const scrollToPathSection = (): void => {
    const lastSegment = window.location.pathname
      .replace(/\/$/, '')
      .split('/')
      .pop() ?? '';

    if (!lastSegment) return;

    const target = document.getElementById(lastSegment);
    target?.scrollIntoView({ behavior: resolveScrollBehavior() });
  };

  if (clickResolvers.size === 0) {
    document.addEventListener('click', handleAnchorClick);
  }
  clickResolvers.add(resolveScrollBehavior);

  window.addEventListener('popstate', scrollToPathSection);

  scrollToPathSection();

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

      clickResolvers.delete(resolveScrollBehavior);
      if (clickResolvers.size === 0) {
        document.removeEventListener('click', handleAnchorClick);
      }
      window.removeEventListener('popstate', scrollToPathSection);
    },
    navigateTo: (sectionId: string): void => {
      const targetSection = document.getElementById(sectionId);

      if (!targetSection) return;

      targetSection.scrollIntoView({ behavior: resolveScrollBehavior() });
      targetSection.focus({ preventScroll: true });
    }
  };
};