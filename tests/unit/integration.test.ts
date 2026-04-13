import { describe, expect, it, vi } from 'vitest';

import { createSectionNav } from '../../src/core';
import { makeElement, stubIntersectionObserver } from './utils';

describe('integration', () => {
  it('scroll triggers observer -> observer calls updateUrl -> URL is clean', () => {
    const { trigger } = stubIntersectionObserver();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const section = makeElement('about');
    createSectionNav({ sections: [section] });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.8 }]);

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'about' }, '', '/about');
    expect(replaceStateSpy.mock.calls[0]?.[2]).not.toContain('#');
  });

  it('anchor click -> preventDefault -> scrollIntoView -> observer fires -> URL updates', () => {
    const { trigger } = stubIntersectionObserver();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const section = makeElement('contact');
    section.scrollIntoView = vi.fn();

    const anchor = document.createElement('a');
    anchor.href = '#contact';
    document.body.appendChild(anchor);

    createSectionNav({ sections: [section] });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Simulate the observer firing after the scroll settles
    trigger([{ target: section, isIntersecting: true, intersectionRatio: 1.0 }]);

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'contact' }, '', '/contact');
    expect(replaceStateSpy.mock.calls[0]?.[2]).not.toContain('#');
  });

  it('popstate event fires -> library scrolls to the matching section', () => {
    stubIntersectionObserver();

    window.history.pushState({}, '', '/pricing');

    const section = makeElement('pricing');
    section.scrollIntoView = vi.fn();

    createSectionNav({ sections: [section] });

    // Clear the initial-load call so we can assert only the popstate call
    vi.mocked(section.scrollIntoView).mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('initial page load with /about path -> scrolls to #about section on mount', () => {
    stubIntersectionObserver();

    window.history.replaceState({}, '', '/about');

    const section = makeElement('about');
    section.scrollIntoView = vi.fn();

    createSectionNav({ sections: [section] });

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('multiple sections visible simultaneously -> highest ratio wins', () => {
    const { trigger } = stubIntersectionObserver();
    const onNavigate = vi.fn();

    const hero = makeElement('hero');
    const features = makeElement('features');

    createSectionNav({ sections: [hero, features], onNavigate });

    trigger([
      { target: hero, isIntersecting: true, intersectionRatio: 0.4 },
      { target: features, isIntersecting: true, intersectionRatio: 0.9 },
    ]);

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith('features');
  });

  it('onNavigate fires in the correct order across multiple scrolls', () => {
    const { trigger } = stubIntersectionObserver();
    const onNavigate = vi.fn();

    const a = makeElement('section-a');
    const b = makeElement('section-b');
    const c = makeElement('section-c');

    createSectionNav({ sections: [a, b, c], onNavigate });

    trigger([{ target: a, isIntersecting: true, intersectionRatio: 0.6 }]);
    trigger([{ target: b, isIntersecting: true, intersectionRatio: 0.6 }]);
    trigger([{ target: c, isIntersecting: true, intersectionRatio: 0.6 }]);

    expect(onNavigate.mock.calls).toEqual([['section-a'], ['section-b'], ['section-c']]);
  });

  it('threshold option actually changes observer configuration', () => {
    const { capturedOptions } = stubIntersectionObserver();

    createSectionNav({ sections: [], threshold: 0.25 });

    expect(capturedOptions()).toMatchObject({ threshold: 0.25 });
  });

  it('rootMargin option actually changes observer configuration', () => {
    const { capturedOptions } = stubIntersectionObserver();

    createSectionNav({ sections: [], rootMargin: '-64px 0px' });

    expect(capturedOptions()).toMatchObject({ rootMargin: '-64px 0px' });
  });
});
