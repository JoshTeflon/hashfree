import { describe, expect, it, vi } from 'vitest';

import { createSectionNav } from '../../src/core';
import { makeElement, stubIntersectionObserver } from './utils';

describe('createSectionNav – instance', () => {
  it('returns a valid instance with destroy() and navigateTo()', () => {
    stubIntersectionObserver();

    const instance = createSectionNav({ sections: [] });

    expect(typeof instance.destroy).toBe('function');
    expect(typeof instance.navigateTo).toBe('function');
  });

  it('resolves sections from a CSS selector string', () => {
    const { observeSpy } = stubIntersectionObserver();

    const a = makeElement('a');
    const b = makeElement('b');
    a.setAttribute('data-section', '');
    b.setAttribute('data-section', '');

    createSectionNav({ sections: '[data-section]' });

    expect(observeSpy).toHaveBeenCalledWith(a);
    expect(observeSpy).toHaveBeenCalledWith(b);
  });

  it('resolves sections from a NodeList', () => {
    const { observeSpy } = stubIntersectionObserver();

    const el = makeElement('nodelist-section');
    el.setAttribute('data-section', '');
    const nodeList = document.querySelectorAll('[data-section]');

    createSectionNav({ sections: nodeList });

    expect(observeSpy).toHaveBeenCalledWith(el);
  });

  it('resolves sections from a plain Element array', () => {
    const { observeSpy } = stubIntersectionObserver();

    const els = [makeElement('x'), makeElement('y')];
    createSectionNav({ sections: els });

    els.forEach(el => expect(observeSpy).toHaveBeenCalledWith(el));
  });

  it('defaults to "[data-section]" selector when no option is passed', () => {
    const { observeSpy } = stubIntersectionObserver();

    const el = makeElement('default-section');
    el.setAttribute('data-section', '');

    createSectionNav();

    expect(observeSpy).toHaveBeenCalledWith(el);
  });
});

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
