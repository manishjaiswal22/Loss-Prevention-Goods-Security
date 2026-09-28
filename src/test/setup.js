import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically unmount and cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// Mock window.print
if (typeof window !== 'undefined') {
  window.print = vi.fn();

  // Mock window.scrollTo
  window.scrollTo = vi.fn();

  // Mock matchMedia
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock Element.prototype.scrollIntoView
  if (window.HTMLElement) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }

  // Mock global fetch for relative /api/ endpoints in Node/jsdom
  const originalFetch = global.fetch;
  global.fetch = vi.fn(async (url, options) => {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          TotalTags: 100,
          Checkout: 30,
          Loss: 12,
          PotentialLoss: 4250,
        }),
      };
    }
    return typeof originalFetch === 'function' ? originalFetch(url, options) : Promise.resolve({ ok: true, json: async () => ({}) });
  });
}
