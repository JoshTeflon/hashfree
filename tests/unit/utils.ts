import { vi } from 'vitest';

import { IntersectionObserverStub } from './types';

export const makeElement = (id: string): HTMLElement => {
  const el = document.createElement('section');
  if (id) el.id = id;
  document.body.appendChild(el);
  return el;
};

export const stubIntersectionObserver = (): IntersectionObserverStub => {
  let capturedCallback: IntersectionObserverCallback;
  let capturedOptions: IntersectionObserverInit | undefined;
  const observeSpy = vi.fn();
  const disconnectSpy = vi.fn();

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        capturedCallback = cb;
        capturedOptions = options;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
      unobserve = vi.fn();
    }
  );

  return {
    observeSpy,
    disconnectSpy,
    trigger: (entries) => {
      capturedCallback(entries as IntersectionObserverEntry[], {} as IntersectionObserver);
    },
    capturedOptions: () => capturedOptions,
  };
};
