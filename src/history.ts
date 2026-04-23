import type { MethodOptions, StrategyOptions } from './types';

export const updateUrl = (
  sectionId: string,
  strategy: StrategyOptions = 'replace',
  basePath: string = '',
): void => {
  if (typeof history === 'undefined') return;

  const path = `${basePath}/${sectionId}`.replace(/\/+/g, '/');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Avoid pushing a duplicate entry when the URL already points to this section
  // (e.g. an IO callback that races with scrollend after history navigation).
  const effectiveStrategy: StrategyOptions =
    strategy === 'push' && window.location.pathname === cleanPath ? 'replace' : strategy;

  const method: MethodOptions = effectiveStrategy === 'push' ? 'pushState' : 'replaceState';

  history[method]({ sectionId }, '', cleanPath);
};