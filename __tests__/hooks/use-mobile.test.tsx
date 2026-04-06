import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/hooks/use-mobile';

// ── matchMedia mock ───────────────────────────────────────────────────────────

type MediaQueryListener = () => void;

function createMatchMediaMock(matches: boolean) {
  const listeners: MediaQueryListener[] = [];
  const mql = {
    matches,
    addEventListener: vi.fn((_event: string, cb: MediaQueryListener) => {
      listeners.push(cb);
    }),
    removeEventListener: vi.fn((_event: string, cb: MediaQueryListener) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    _listeners: listeners,
  };
  return mql;
}

function installMatchMedia(mql: ReturnType<typeof createMatchMediaMock>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(() => mql),
  });
}

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('視窗寬度小於 768px 時回傳 true', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    installMatchMedia(createMatchMediaMock(true));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('視窗寬度等於 768px 時回傳 false', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    installMatchMedia(createMatchMediaMock(false));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('視窗寬度大於 768px 時回傳 false', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    });
    installMatchMedia(createMatchMediaMock(false));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('使用正確的 media query 字串', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const mql = createMatchMediaMock(true);
    const matchMediaFn = vi.fn(() => mql);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaFn,
    });

    renderHook(() => useIsMobile());
    expect(matchMediaFn).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('unmount 時移除 listener', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const mql = createMatchMediaMock(true);
    installMatchMedia(mql);

    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalled();
  });
});
