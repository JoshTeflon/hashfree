export interface SectionNavOptions {
  sections?: string | NodeListOf<Element> | Element[];
  rootMargin?: string;
  threshold?: number;
  updateStrategy?: 'push' | 'replace';
  onNavigate?: (sectionId: string) => void;
  basePath?: string;
};

export interface SectionNavInstance {
  destroy: () => void;
  navigate: (sectionId: string) => void;
};