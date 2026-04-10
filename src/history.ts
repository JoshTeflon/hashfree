import type { MethodOptions, StrategyOptions } from './types';

export const updateUrl = (
  sectionId: string,
  strategy: StrategyOptions = 'replace',
  basePath: string = '',
): void => {
  if (typeof history === 'undefined') return;

  const path = `${basePath}/${sectionId}`.replace(/\/+/g, '/');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const method: MethodOptions = strategy === 'push' ? 'pushState' : 'replaceState';

  history[method]({ sectionId }, '', cleanPath);
};