export type StrategyOptions = 'push' | 'replace';

export type MethodOptions = 'pushState' | 'replaceState';

export interface ISectionNavOptions {
  sections?: string | NodeListOf<Element> | Element[];
  rootMargin?: string;
  threshold?: number;
  updateStrategy?: StrategyOptions;
  onNavigate?: (sectionId: string) => void;
  basePath?: string;
};

export interface ISectionNavInstance {
  destroy: () => void;
  navigate: (sectionId: string) => void;
};