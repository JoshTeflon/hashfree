import { describe, expect, it, vi } from 'vitest';

import { createSectionNav } from '../../src/core';
import { makeElement, stubIntersectionObserver } from './utils';

describe('createSectionNav – URL update strategy', () => {
  it('uses replaceState by default', () => {
    const { trigger } = stubIntersectionObserver();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    const section = makeElement('intro');
    createSectionNav({ sections: [section] });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.6 }]);

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'intro' }, '', '/intro');
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it('uses pushState when strategy is "push"', () => {
    const { trigger } = stubIntersectionObserver();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const section = makeElement('features');
    createSectionNav({ sections: [section], updateStrategy: 'push' });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.6 }]);

    expect(pushStateSpy).toHaveBeenCalledWith({ sectionId: 'features' }, '', '/features');
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
