import { describe, expect, it, vi } from 'vitest';

import { updateUrl } from '../../src/history';

describe('updateUrl', () => {
  it('writes a clean path with no hash using replaceState by default', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    updateUrl('getting-started');

    expect(replaceStateSpy).toHaveBeenCalledWith(
      { sectionId: 'getting-started' },
      '',
      '/getting-started'
    );
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy.mock.calls[0]?.[2]).not.toContain('#');
  });

  it('normalizes basePath and keeps URL hashless with pushState strategy', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    updateUrl('api-reference', 'push', '/docs/');

    expect(pushStateSpy).toHaveBeenCalledWith(
      { sectionId: 'api-reference' },
      '',
      '/docs/api-reference'
    );
    expect(pushStateSpy.mock.calls[0]?.[2]).not.toContain('#');
  });

  it('handles basePath prefix correctly', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    updateUrl('about', 'replace', '/docs');

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'about' }, '', '/docs/about');
  });

  it('collapses double slashes', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    updateUrl('about', 'replace', '/');

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'about' }, '', '/about');
  });

  it('handles empty sectionId gracefully', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    updateUrl('');

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: '' }, '', '/');
  });

  it('handles basePath with trailing slash', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    updateUrl('about', 'replace', '/docs/');

    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'about' }, '', '/docs/about');
  });

  it('downgrades push to replace when URL already matches (dedup guard)', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    // Pre-set the URL to /pricing so the dedup guard activates
    window.history.replaceState({}, '', '/pricing');

    updateUrl('pricing', 'push');

    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalledWith({ sectionId: 'pricing' }, '', '/pricing');
  });

  it('still uses pushState when URL does not yet match the section', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    window.history.replaceState({}, '', '/home');

    updateUrl('about', 'push');

    expect(pushStateSpy).toHaveBeenCalledWith({ sectionId: 'about' }, '', '/about');
  });
});
