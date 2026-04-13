import { vi } from 'vitest';

export interface IntersectionObserverStub {
  observeSpy: ReturnType<typeof vi.fn>;
  disconnectSpy: ReturnType<typeof vi.fn>;
  trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
  capturedOptions: () => IntersectionObserverInit | undefined;
};