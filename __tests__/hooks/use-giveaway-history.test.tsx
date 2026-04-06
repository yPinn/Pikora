import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFacebookPage } from '@/contexts/facebook-page-store';
import { useGiveawayHistory } from '@/hooks/use-giveaway-history';

// ── mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/contexts/facebook-page-store', () => ({
  useFacebookPage: vi.fn(),
}));

const mockUseFacebookPage = vi.mocked(useFacebookPage);

function setActivePage(id: string | null) {
  mockUseFacebookPage.mockReturnValue({
    activePage: id ? { id, name: `Page ${id}` } : null,
    pages: [],
    isReady: true,
    setActivePage: vi.fn(),
  });
}

function makeRecord(id: string) {
  return {
    id,
    pageId: 'p1',
    postId: 'post1',
    name: `Giveaway ${id}`,
    filters: {},
    status: 'completed',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    prizes: [],
    winners: [],
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useGiveawayHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('無 activePage 時 records 為空，不發出請求', async () => {
    setActivePage(null);
    const fetchSpy = vi.spyOn(global, 'fetch');

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.records).toEqual([]);
  });

  it('有 activePage 時載入記錄', async () => {
    setActivePage('p1');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [makeRecord('g1'), makeRecord('g2')] }),
    } as unknown as Response);

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.records).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('API 錯誤時設定 error', async () => {
    setActivePage('p1');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '取得失敗' }),
    } as unknown as Response);

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('取得失敗');
    expect(result.current.records).toEqual([]);
  });

  it('fetch 拋出例外時設定通用 error', async () => {
    setActivePage('p1');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('網路錯誤'));

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('取得失敗');
  });

  it('deleteRecord 成功時從列表移除', async () => {
    setActivePage('p1');
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [makeRecord('g1'), makeRecord('g2')] }),
      } as unknown as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as unknown as Response);

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.records).toHaveLength(2));

    let deleted = false;
    await act(async () => {
      deleted = await result.current.deleteRecord('g1');
    });

    expect(deleted).toBe(true);
    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].id).toBe('g2');
  });

  it('deleteRecord API 失敗時回傳 false，列表不變', async () => {
    setActivePage('p1');
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [makeRecord('g1')] }),
      } as unknown as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) } as unknown as Response);

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.records).toHaveLength(1));

    let deleted = true;
    await act(async () => {
      deleted = await result.current.deleteRecord('g1');
    });

    expect(deleted).toBe(false);
    expect(result.current.records).toHaveLength(1);
  });

  it('refresh 重新載入記錄', async () => {
    setActivePage('p1');
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [makeRecord('g1')] }),
    } as unknown as Response);

    const { result } = renderHook(() => useGiveawayHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
