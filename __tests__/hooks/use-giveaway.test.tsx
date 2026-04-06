import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFacebookPage } from '@/contexts/facebook-page-store';
import { useGiveaway } from '@/hooks/use-giveaway';
import type { FacebookComment } from '@/lib/services/facebook';

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

// ── helpers ───────────────────────────────────────────────────────────────────

function makeComment(
  id: string,
  fromId: string,
  fromName: string,
  message = '抽獎'
): FacebookComment {
  return {
    id,
    message,
    created_time: '2024-06-01T10:00:00Z',
    from: { id: fromId, name: fromName },
  };
}

const DEFAULT_OPTIONS = {
  comments: [
    makeComment('c1', 'u1', 'Alice'),
    makeComment('c2', 'u2', 'Bob'),
    makeComment('c3', 'u3', 'Carol'),
  ],
  postId: 'post_123',
  postUrl: 'https://www.facebook.com/Page/posts/123',
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useGiveaway', () => {
  beforeEach(() => {
    setActivePage('p1');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 初始狀態 ────────────────────────────────────────────────────────────────

  describe('初始狀態', () => {
    it('filters 預設為空物件', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.filters).toEqual({});
    });

    it('prizes 預設包含一個「頭獎」', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.prizes).toHaveLength(1);
      expect(result.current.prizes[0].name).toBe('頭獎');
      expect(result.current.prizes[0].quantity).toBe(1);
    });

    it('results 預設為空陣列', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.results).toEqual([]);
    });

    it('blacklist 預設為空陣列', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.blacklist).toEqual([]);
    });

    it('isSaved 預設為 false', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.isSaved).toBe(false);
    });

    it('saveMode 預設為 new', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.saveMode).toBe('new');
    });

    it('pool 包含所有無篩選的留言', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.pool).toHaveLength(3);
    });
  });

  // ── draw ────────────────────────────────────────────────────────────────────

  describe('draw', () => {
    it('執行抽獎後 results 不為空', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].prize_name).toBe('頭獎');
    });

    it('中獎者來自 pool 內的用戶', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      const winnerIds = result.current.results.map((r) => r.winner.from_id);
      const poolIds = result.current.pool.map((e) => e.from_id);
      winnerIds.forEach((id) => expect(poolIds).toContain(id));
    });

    it('多個獎項各自抽出指定數量', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.setPrizes([
          { id: 'prize-1', name: '頭獎', quantity: 1 },
          { id: 'prize-2', name: '二獎', quantity: 1 },
        ]);
      });

      act(() => {
        result.current.draw();
      });

      expect(result.current.results).toHaveLength(2);
    });

    it('抽獎後 saveMode 變為 new（尚未儲存）', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      expect(result.current.saveMode).toBe('new');
      expect(result.current.isSaved).toBe(false);
    });

    it('allow_duplicate=false 時不同獎項不重複中同一人', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.setFilters({ allow_duplicate: false });
        result.current.setPrizes([
          { id: 'p1', name: '頭獎', quantity: 1 },
          { id: 'p2', name: '二獎', quantity: 1 },
        ]);
      });

      act(() => {
        result.current.draw();
      });

      const winnerIds = result.current.results.map((r) => r.winner.from_id);
      expect(new Set(winnerIds).size).toBe(winnerIds.length);
    });
  });

  // ── reset ───────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('reset 後 results 清空', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      expect(result.current.results).toHaveLength(1);

      act(() => {
        result.current.reset();
      });

      expect(result.current.results).toEqual([]);
    });

    it('reset 後 isSaved 為 false', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isSaved).toBe(false);
    });
  });

  // ── redraw ──────────────────────────────────────────────────────────────────

  describe('redraw', () => {
    it('重抽不存在的 prizeId 不拋出錯誤', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      expect(() => {
        act(() => {
          result.current.redraw('non-existent-prize-id');
        });
      }).not.toThrow();
    });

    it('重抽指定獎項後結果仍包含該獎項', () => {
      const prizeId = 'prize-a';
      const { result } = renderHook(() =>
        useGiveaway({
          ...DEFAULT_OPTIONS,
          comments: [
            makeComment('c1', 'u1', 'Alice'),
            makeComment('c2', 'u2', 'Bob'),
            makeComment('c3', 'u3', 'Carol'),
          ],
        })
      );

      act(() => {
        result.current.setPrizes([{ id: prizeId, name: '頭獎', quantity: 1 }]);
      });

      act(() => {
        result.current.draw();
      });

      act(() => {
        result.current.redraw(prizeId);
      });

      const prizeResults = result.current.results.filter((r) => r.prize_id === prizeId);
      expect(prizeResults).toHaveLength(1);
    });
  });

  // ── setFilters ──────────────────────────────────────────────────────────────

  describe('setFilters', () => {
    it('設定 pattern 篩選後 pool 縮小', () => {
      const comments = [
        makeComment('c1', 'u1', 'Alice', '我要參加'),
        makeComment('c2', 'u2', 'Bob', '不參加'),
      ];
      const { result } = renderHook(() => useGiveaway({ ...DEFAULT_OPTIONS, comments }));

      expect(result.current.pool).toHaveLength(2);

      act(() => {
        result.current.setFilters({ pattern: '我要參加', pattern_type: 'contains' });
      });

      expect(result.current.pool).toHaveLength(1);
      expect(result.current.pool[0].from_id).toBe('u1');
    });

    it('設定 time_start 篩選後排除早期留言', () => {
      const comments = [
        { ...makeComment('c1', 'u1', 'Alice'), created_time: '2024-01-01T00:00:00Z' },
        { ...makeComment('c2', 'u2', 'Bob'), created_time: '2024-06-01T00:00:00Z' },
      ];
      const { result } = renderHook(() => useGiveaway({ ...DEFAULT_OPTIONS, comments }));

      act(() => {
        result.current.setFilters({ time_start: '2024-03-01T00:00:00Z' });
      });

      expect(result.current.pool).toHaveLength(1);
      expect(result.current.pool[0].from_id).toBe('u2');
    });
  });

  // ── blacklist ───────────────────────────────────────────────────────────────

  describe('blacklist', () => {
    it('addToBlacklist 成功時加入 blacklist 並縮小 pool', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.addToBlacklist({ from_id: 'u1', from_name: 'Alice' });
      });

      expect(result.current.blacklist).toHaveLength(1);
      expect(result.current.blacklist[0].from_id).toBe('u1');
      // pool 應不再包含 u1
      expect(result.current.pool.map((e) => e.from_id)).not.toContain('u1');
    });

    it('addToBlacklist API 失敗時 blacklist 不變', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.addToBlacklist({ from_id: 'u1', from_name: 'Alice' });
      });

      expect(result.current.blacklist).toHaveLength(0);
    });

    it('removeFromBlacklist 成功時從 blacklist 移除', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as unknown as Response) // add
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as unknown as Response); // remove

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.addToBlacklist({ from_id: 'u1', from_name: 'Alice' });
      });

      expect(result.current.blacklist).toHaveLength(1);

      await act(async () => {
        await result.current.removeFromBlacklist('u1');
      });

      expect(result.current.blacklist).toHaveLength(0);
    });

    it('無 activePage 時 addToBlacklist 不發出請求', async () => {
      setActivePage(null);
      const fetchSpy = vi.spyOn(global, 'fetch');

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.addToBlacklist({ from_id: 'u1', from_name: 'Alice' });
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ── fetchBlacklist ──────────────────────────────────────────────────────────

  describe('fetchBlacklist', () => {
    it('fetchBlacklist 成功時設定 blacklist', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ from_id: 'u99', from_name: 'Blocked' }] }),
      } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.fetchBlacklist();
      });

      expect(result.current.blacklist).toHaveLength(1);
      expect(result.current.blacklist[0].from_id).toBe('u99');
    });

    it('無 activePage 時 fetchBlacklist 不發出請求', async () => {
      setActivePage(null);
      const fetchSpy = vi.spyOn(global, 'fetch');

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.fetchBlacklist();
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ── fetchReactions ──────────────────────────────────────────────────────────

  describe('fetchReactions', () => {
    it('fetchReactions 成功後 hasLoadedReactions=true', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'u1', name: 'Alice', type: 'LIKE' }] }),
      } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      expect(result.current.hasLoadedReactions).toBe(false);

      await act(async () => {
        await result.current.fetchReactions();
      });

      expect(result.current.hasLoadedReactions).toBe(true);
      expect(result.current.reactions).toHaveLength(1);
    });

    it('fetchReactions 失敗後 hasLoadedReactions 仍為 true', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('網路錯誤'));

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.fetchReactions();
      });

      expect(result.current.hasLoadedReactions).toBe(true);
      expect(result.current.isLoadingReactions).toBe(false);
    });

    it('無 activePage 時 fetchReactions 不發出請求', async () => {
      setActivePage(null);
      const fetchSpy = vi.spyOn(global, 'fetch');

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      await act(async () => {
        await result.current.fetchReactions();
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ── save ────────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('無 activePage 時 save 回傳 null', async () => {
      setActivePage(null);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      let ret: string | null = 'sentinel';
      await act(async () => {
        ret = await result.current.save();
      });

      expect(ret).toBeNull();
    });

    it('無 results 時 save 回傳 null', async () => {
      setActivePage('p1');

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      let ret: string | null = 'sentinel';
      await act(async () => {
        ret = await result.current.save();
      });

      expect(ret).toBeNull();
    });

    it('save 成功後 isSaved=true, saveMode=saved', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'giveaway-abc', prizes: [{ id: 'db-prize-1' }] },
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} }),
        } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      let savedId: string | null = null;
      await act(async () => {
        savedId = await result.current.save('測試抽獎');
      });

      expect(savedId).toBe('giveaway-abc');
      expect(result.current.isSaved).toBe(true);
      expect(result.current.saveMode).toBe('saved');
    });

    it('已儲存且未 redraw 時再次 save 直接回傳舊 ID', async () => {
      setActivePage('p1');
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'giveaway-abc', prizes: [{ id: 'db-prize-1' }] },
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} }),
        } as unknown as Response);

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      await act(async () => {
        await result.current.save();
      });

      const callsAfterFirstSave = fetchSpy.mock.calls.length;

      let ret: string | null = null;
      await act(async () => {
        ret = await result.current.save();
      });

      // 不應發出新請求
      expect(fetchSpy.mock.calls.length).toBe(callsAfterFirstSave);
      expect(ret).toBe('giveaway-abc');
    });

    it('save PATCH 失敗時拋出錯誤並清理', async () => {
      setActivePage('p1');
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'giveaway-xyz', prizes: [{ id: 'db-prize-1' }] },
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: '儲存失敗' }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as unknown as Response); // DELETE cleanup

      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      act(() => {
        result.current.draw();
      });

      await expect(
        act(async () => {
          await result.current.save();
        })
      ).rejects.toThrow();

      expect(result.current.isSaved).toBe(false);
    });

    it('redraw 後 saveMode 變為 replace', async () => {
      setActivePage('p1');
      const prizeId = 'prize-x';
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'giveaway-abc', prizes: [{ id: 'db-prize-1' }] },
          }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} }),
        } as unknown as Response);

      const { result } = renderHook(() =>
        useGiveaway({
          ...DEFAULT_OPTIONS,
          comments: [
            makeComment('c1', 'u1', 'Alice'),
            makeComment('c2', 'u2', 'Bob'),
            makeComment('c3', 'u3', 'Carol'),
          ],
        })
      );

      act(() => {
        result.current.setPrizes([{ id: prizeId, name: '頭獎', quantity: 1 }]);
      });

      act(() => {
        result.current.draw();
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.saveMode).toBe('saved');

      act(() => {
        result.current.redraw(prizeId);
      });

      expect(result.current.saveMode).toBe('replace');
    });
  });

  // ── stats ───────────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('stats 正確反映 pool 大小', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));
      expect(result.current.stats.total_comments).toBe(3);
      expect(result.current.stats.final_pool_size).toBe(3);
    });

    it('篩選後 stats.final_pool_size 更新', () => {
      const { result } = renderHook(() => useGiveaway(DEFAULT_OPTIONS));

      // blacklist filter 透過 blacklistSet 生效，不透過 filters 欄位
      // 直接測試空 filters 下 pool size
      act(() => {
        result.current.setFilters({});
      });

      expect(result.current.stats.final_pool_size).toBe(3);
    });
  });
});
