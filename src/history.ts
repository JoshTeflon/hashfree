import { MethodOptions, StrategyOptions } from "./types";

export const updateUrl = (
  sectionId: string,
  strategy: StrategyOptions = 'replace',
  basePath: string = '',
) => {
  const path = `${basePath}/${sectionId}`;
  const cleanPath = path.replace(/\/+/g, '/');

  const method: MethodOptions = strategy === 'push' ? 'pushState' : 'replaceState';

  history[method]({ sectionId }, '', cleanPath);
};