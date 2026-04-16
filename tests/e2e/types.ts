export type NavWindow = Window & {
  __nav: { navigateTo: (sectionId: string) => void };
  __urlHistory: string[];
  __scrollCalls: (ScrollIntoViewOptions | boolean | undefined)[];
};