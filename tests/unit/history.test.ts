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
});
