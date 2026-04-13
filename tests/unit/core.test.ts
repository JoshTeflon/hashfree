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

describe('createSectionNav – anchor click handling', () => {
  it('clicking an anchor <a href="#about"> prevents default and scrolls without hash', () => {
    stubIntersectionObserver();

    const target = makeElement('about');
    target.scrollIntoView = vi.fn();
    const scrollSpy = vi.spyOn(target, 'scrollIntoView');

    const anchor = document.createElement('a');
    anchor.href = '#about';
    document.body.appendChild(anchor);

    createSectionNav({ sections: [] });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: anchor });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('clicking a non-anchor element does nothing', () => {
    stubIntersectionObserver();

    const btn = document.createElement('button');
    document.body.appendChild(btn);

    createSectionNav({ sections: [] });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('clicking an anchor pointing to a non-existent id does nothing', () => {
    stubIntersectionObserver();

    const anchor = document.createElement('a');
    anchor.href = '#does-not-exist';
    document.body.appendChild(anchor);

    createSectionNav({ sections: [] });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
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

describe('createSectionNav – destroy()', () => {
  it('disconnects the observer', () => {
    const { disconnectSpy } = stubIntersectionObserver();

    const instance = createSectionNav({ sections: [] });
    instance.destroy();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });

  it('removes the click event listener', async () => {
    // Reset module state so activeClickHandlerCount starts at 0
    vi.resetModules();
    const { createSectionNav: freshCreate } = await import('../../src/core');
    stubIntersectionObserver();
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener');

    const instance = freshCreate({ sections: [] });
    instance.destroy();

    expect(removeListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('calling destroy() twice does not throw', () => {
    const { disconnectSpy } = stubIntersectionObserver();

    const instance = createSectionNav({ sections: [] });
    instance.destroy();
    expect(() => instance.destroy()).not.toThrow();

    // observer should only be disconnected once
    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});

describe('createSectionNav – navigateTo()', () => {
  it('calls scrollIntoView on the correct element', () => {
    stubIntersectionObserver();

    const section = makeElement('target-section');
    section.scrollIntoView = vi.fn();

    createSectionNav({ sections: [] });
    createSectionNav({ sections: [] }).navigateTo('target-section');

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not throw with a non-existent id', () => {
    stubIntersectionObserver();

    const instance = createSectionNav({ sections: [] });

    expect(() => instance.navigateTo('ghost-section')).not.toThrow();
  });
});

describe('createSectionNav – callbacks and options forwarding', () => {
  it('onNavigate callback fires with the correct sectionId', () => {
    const { trigger } = stubIntersectionObserver();
    const onNavigate = vi.fn();

    const section = makeElement('pricing');
    createSectionNav({ sections: [section], onNavigate });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.7 }]);

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith('pricing');
  });

  it('updateStrategy option is forwarded to history correctly', () => {
    const { trigger } = stubIntersectionObserver();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    const section = makeElement('docs');
    createSectionNav({ sections: [section], updateStrategy: 'push' });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.5 }]);

    expect(pushStateSpy).toHaveBeenCalledWith({ sectionId: 'docs' }, '', '/docs');
  });

  it('basePath option is forwarded to history correctly', () => {
    const { trigger } = stubIntersectionObserver();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const section = makeElement('getting-started');
    createSectionNav({ sections: [section], basePath: '/v2' });

    trigger([{ target: section, isIntersecting: true, intersectionRatio: 0.5 }]);

    expect(replaceStateSpy).toHaveBeenCalledWith(
      { sectionId: 'getting-started' },
      '',
      '/v2/getting-started'
    );
  });
});
