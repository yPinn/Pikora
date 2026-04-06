import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFacebookPages } from '@/hooks/use-facebook-pages';

// ── mocks ─────────────────────────────────────────────────────────────────────

// next-auth/react: 控制 session 狀態
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

const mockUseSession = vi.mocked(useSession);

// ── helpers ───────────────────────────────────────────────────────────────────

type MockSessionReturn = ReturnType<typeof useSession>;

function mockSession(status: 'authenticated' | 'unauthenticated' | 'loading') {
  mockUseSession.mockReturnValue({
    status,
    data:
      status === 'authenticated'
        ? ({ user: { name: 'Test' }, expires: '9999' } as MockSessionReturn['data'])
        : null,
    update: vi.fn() as MockSessionReturn['update'],
  } as MockSessionReturn);
}

function makePagesResponse(pages = [{ id: 'p1', name: 'Page 1' }]) {
  return {
    ok: true,
    json: async () => ({ data: pages }),
  } as unknown as Response;
}

function makeErrorResponse(error = '取得粉絲專頁失敗') {
  return {
    ok: false,
    json: async () => ({ error }),
  } as unknown as Response;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useFacebookPages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('session 為 loading 時保持 isLoading=true，不發出請求', async () => {
    mockSession('loading');
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { result } = renderHook(() => useFacebookPages());

    // loading 狀態下不應呼叫 fetch
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
  });

  it('session 為 unauthenticated 時設定 isLoading=false，不發出請求', async () => {
    mockSession('unauthenticated');
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.pages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('session 為 authenticated 時取得頁面列表', async () => {
    mockSession('authenticated');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(makePagesResponse());

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pages).toHaveLength(1);
    expect(result.current.pages[0].id).toBe('p1');
    expect(result.current.error).toBeNull();
  });

  it('API 回傳錯誤時設定 error', async () => {
    mockSession('authenticated');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeErrorResponse('權限不足'));

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('權限不足');
    expect(result.current.pages).toEqual([]);
  });

  it('fetch 拋出例外時設定 error', async () => {
    mockSession('authenticated');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('網路錯誤'));

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('網路錯誤');
    expect(result.current.pages).toEqual([]);
  });

  it('API 回傳 data=null 時 pages 為空陣列', async () => {
    mockSession('authenticated');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    } as unknown as Response);

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pages).toEqual([]);
  });

  it('refetch 重新呼叫 API', async () => {
    mockSession('authenticated');
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(makePagesResponse([{ id: 'p2', name: 'Page 2' }]));

    const { result } = renderHook(() => useFacebookPages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.refetch();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
