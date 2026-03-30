import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFacebookComments } from '@/hooks/use-facebook-comments';
import type { FacebookPage } from '@/lib/services/facebook';

// ── mocks ────────────────────────────────────────────────────────────────────

// extractPostIdFromUrl: 直接回傳輸入（不解析 URL）
vi.mock('@/lib/utils/facebook', () => ({
  extractPostIdFromUrl: (_url: string) => null,
  parseFacebookErrorMessage: (msg: string) => msg,
  rebuildCommentTree: (arr: unknown[]) => arr,
}));

// sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// ── helpers ──────────────────────────────────────────────────────────────────

function makePage(id: string): FacebookPage {
  return { id, name: `Page ${id}` };
}

function makeCommentsResponse(
  data: unknown[] = [
    {
      id: 'c1',
      message: '留言',
      created_time: '2024-01-01T00:00:00Z',
      from: { id: 'u1', name: 'Alice' },
    },
  ]
) {
  return { ok: true, json: async () => ({ data }) };
}

function makePostResponse() {
  return {
    ok: true,
    json: async () => ({ data: { full_picture: 'https://example.com/img.jpg' } }),
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('useFacebookComments', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初始狀態：留言為空、無 loading', () => {
    const { result } = renderHook(() => useFacebookComments(makePage('p1')));
    expect(result.current.state.comments).toEqual([]);
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('fetchComments：呼叫後進入 loading 並最終取得留言', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeCommentsResponse() as unknown as Response)
      .mockResolvedValueOnce(makePostResponse() as unknown as Response);

    const { result } = renderHook(() => useFacebookComments(makePage('p1')));

    act(() => {
      result.current.actions.fetchComments('123456789');
    });

    await waitFor(() => expect(result.current.state.loading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.current.state.comments).toHaveLength(1);
    expect(result.current.state.error).toBeNull();
  });

  it('fetchComments：API 失敗時設定 error', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '取得留言失敗' }),
      } as unknown as Response)
      .mockResolvedValueOnce(makePostResponse() as unknown as Response);

    const { result } = renderHook(() => useFacebookComments(makePage('p1')));

    act(() => {
      result.current.actions.fetchComments('123456789');
    });

    await waitFor(() => expect(result.current.state.loading).toBe(false));

    expect(result.current.state.error).toBeTruthy();
    expect(result.current.state.comments).toEqual([]);
  });

  it('切換 activePage：清空 postId / comments / error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(makeCommentsResponse() as unknown as Response);

    const pageA = makePage('pA');
    const pageB = makePage('pB');

    const { result, rerender } = renderHook(({ page }) => useFacebookComments(page), {
      initialProps: { page: pageA },
    });

    act(() => {
      result.current.actions.fetchComments('post1');
    });
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    // 切換頁面
    rerender({ page: pageB });

    await waitFor(() => {
      expect(result.current.state.postId).toBe('');
      expect(result.current.state.comments).toEqual([]);
    });
  });

  it('切換 activePage 後不應以舊 postId 對新頁面發請求', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(makeCommentsResponse() as unknown as Response);

    const pageA = makePage('pA');
    const pageB = makePage('pB');

    const { result, rerender } = renderHook(({ page }) => useFacebookComments(page), {
      initialProps: { page: pageA },
    });

    act(() => {
      result.current.actions.fetchComments('post1');
    });
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    const callCountAfterFirst = fetchSpy.mock.calls.length;

    // 切換頁面：應清空 postId，不觸發新請求
    rerender({ page: pageB });
    await waitFor(() => expect(result.current.state.postId).toBe(''));

    // 無新的 fetch 呼叫
    expect(fetchSpy.mock.calls.length).toBe(callCountAfterFirst);
  });

  it('clearInput：重置所有狀態', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(makeCommentsResponse() as unknown as Response);

    const { result } = renderHook(() => useFacebookComments(makePage('p1')));

    act(() => {
      result.current.actions.fetchComments('post1');
    });
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    act(() => {
      result.current.actions.clearInput();
    });

    expect(result.current.state.postId).toBe('');
    expect(result.current.state.postUrl).toBe('');
    expect(result.current.state.comments).toEqual([]);
    expect(result.current.state.error).toBeNull();
  });

  it('searchQuery 篩選留言', async () => {
    const twoComments = [
      {
        id: 'c1',
        message: '抽獎',
        created_time: '2024-01-01T00:00:00Z',
        from: { id: 'u1', name: 'Alice' },
      },
      {
        id: 'c2',
        message: '不參加',
        created_time: '2024-01-01T00:00:00Z',
        from: { id: 'u2', name: 'Bob' },
      },
    ];
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeCommentsResponse(twoComments) as unknown as Response)
      .mockResolvedValueOnce(makePostResponse() as unknown as Response);

    const { result } = renderHook(() => useFacebookComments(makePage('p1')));

    act(() => {
      result.current.actions.fetchComments('post1');
    });
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    act(() => {
      result.current.actions.setSearchQuery('抽獎');
    });

    expect(result.current.state.filteredComments).toHaveLength(1);
    expect(result.current.state.filteredComments[0].message).toBe('抽獎');
  });

  it('activePage 為 null 時 fetchComments 不發出請求', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { result } = renderHook(() => useFacebookComments(null));

    act(() => {
      result.current.actions.fetchComments('post1');
    });

    // 等一個 tick 確保 effect 跑完
    await act(async () => {});

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
