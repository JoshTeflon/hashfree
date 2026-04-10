import { describe, expect, it, vi } from 'vitest';

import { createSectionNav } from '../../src/core';

const makeSection = (id: string): HTMLElement => {
  const el = document.createElement('section');
  el.id = id;
  document.body.appendChild(el);
  return el;
};

const stubIntersectionObserver = (): {
  trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
} => {
  let capturedCallback: IntersectionObserverCallback;

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        capturedCallback = cb;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
  );

  return {
    trigger: (entries) => {
      capturedCallback(entries as IntersectionObserverEntry[], {} as IntersectionObserver);
    },
  };
};

describe('createSectionNav – URL update strategy', () => {
  it('uses replaceState by default', () => {
    const { trigger } = stubIntersectionObserver();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    const section = makeSection('intro');
    createSectionNav({ sections: [section] });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.6 }]);

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'intro' }, '', '/intro');
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it('uses pushState when strategy is "push"', () => {
    const { trigger } = stubIntersectionObserver();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const section = makeSection('features');
    createSectionNav({ sections: [section], updateStrategy: 'push' });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.6 }]);

    expect(pushStateSpy).toHaveBeenCalledWith({ sectionId: 'features' }, '', '/features');
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
