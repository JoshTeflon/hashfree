export type StrategyOptions = 'push' | 'replace';

export type MethodOptions = 'pushState' | 'replaceState';

export interface SectionNavOptions {
  sections?: string | NodeListOf<Element> | Element[];
  rootMargin?: string;
  threshold?: number | number[];
  updateStrategy?: StrategyOptions;
  onNavigate?: (sectionId: string) => void;
  basePath?: string;
  scrollBehavior?: ScrollBehavior;
};

export interface SectionNavInstance {
  destroy: () => void;
  navigateTo: (sectionId: string) => void;
};