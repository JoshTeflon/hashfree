import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSectionObserver } from '../../src/observer';
import { makeElement, stubIntersectionObserver } from './utils';
import { IntersectionObserverStub } from './types';

let stub: IntersectionObserverStub;

beforeEach(() => {
  stub = stubIntersectionObserver();
});

const entry = (
  target: Element,
  isIntersecting: boolean,
  intersectionRatio = 0.5
): IntersectionObserverEntry =>
  ({ target, isIntersecting, intersectionRatio }) as IntersectionObserverEntry;

const fire = (entries: IntersectionObserverEntry[]): void => {
  stub.trigger(entries);
};

describe('createSectionObserver', () => {
  it('creates an IntersectionObserver with the right options', () => {
    const options = { rootMargin: '-10px', threshold: 0.75 };
    createSectionObserver([], vi.fn(), options);

    expect(stub.capturedOptions()).toEqual(options);
  });

  it('observes all passed elements', () => {
    const els = [makeElement('a'), makeElement('b'), makeElement('c')];
    createSectionObserver(els, vi.fn(), {});

    expect(stub.observeSpy).toHaveBeenCalledTimes(3);
    els.forEach(el => expect(stub.observeSpy).toHaveBeenCalledWith(el));
  });

  it('calls onVisible with the correct section id when intersecting', () => {
    const onVisible = vi.fn();
    const el = makeElement('hero');
    createSectionObserver([el], onVisible, {});

    fire([entry(el, true, 0.6)]);

    expect(onVisible).toHaveBeenCalledOnce();
    expect(onVisible).toHaveBeenCalledWith('hero');
  });

  it('picks the entry with the highest intersectionRatio when multiple are visible', () => {
    const onVisible = vi.fn();
    const low = makeElement('low-ratio');
    const high = makeElement('high-ratio');
    createSectionObserver([low, high], onVisible, {});

    fire([entry(low, true, 0.3), entry(high, true, 0.9)]);

    expect(onVisible).toHaveBeenCalledWith('high-ratio');
  });

  it('does NOT call onVisible when no entry is intersecting', () => {
    const onVisible = vi.fn();
    const el = makeElement('hidden');
    createSectionObserver([el], onVisible, {});

    fire([entry(el, false, 0)]);

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('ignores elements with no id attribute', () => {
    const onVisible = vi.fn();
    const el = makeElement('');
    createSectionObserver([el], onVisible, {});

    fire([entry(el, true, 0.8)]);

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('disconnect() stops all observations', () => {
    const el = makeElement('footer');
    const observer = createSectionObserver([el], vi.fn(), {});

    observer.disconnect();

    expect(stub.disconnectSpy).toHaveBeenCalledOnce();
  });
});
