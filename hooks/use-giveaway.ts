'use client';

import { useState, useCallback, useMemo } from 'react';

import { useFacebookPage } from '@/contexts/facebook-page-store';
import {
  buildDrawPool,
  drawWinners,
  type GiveawayFilters,
  type DrawEntry,
  type PrizeInput,
  type DrawResult,
  type FilterStats,
  type BlacklistEntry,
} from '@/lib/giveaway';
import type { FacebookComment } from '@/lib/services/facebook';

interface UseGiveawayOptions {
  comments: FacebookComment[];
  postId: string;
  postUrl?: string;
}

interface UseGiveawayReturn {
  // 設定
  filters: GiveawayFilters;
  setFilters: (filters: GiveawayFilters) => void;
  prizes: PrizeInput[];
  setPrizes: (prizes: PrizeInput[]) => void;
  blacklist: BlacklistEntry[];

  // 抽獎池
  pool: DrawEntry[];
  stats: FilterStats;

  // 抽獎操作
  results: DrawResult[];
  isDrawing: boolean;
  draw: () => void;
  redraw: (prizeId: string) => void;
  reset: () => void;

  // 黑名單操作
  addToBlacklist: (entry: BlacklistEntry) => Promise<void>;
  removeFromBlacklist: (fromId: string) => Promise<void>;
  fetchBlacklist: () => Promise<void>;

  // 儲存
  isSaving: boolean;
  save: (name?: string) => Promise<string | null>;
}

export function useGiveaway({ comments, postId, postUrl }: UseGiveawayOptions): UseGiveawayReturn {
  const { activePage } = useFacebookPage();

  const [filters, setFilters] = useState<GiveawayFilters>({});
  const [prizes, setPrizes] = useState<PrizeInput[]>([{ name: '頭獎', quantity: 1 }]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 黑名單 Set (for filtering)
  const blacklistSet = useMemo(() => new Set(blacklist.map((b) => b.from_id)), [blacklist]);

  // 建立抽獎池
  const { pool, stats } = useMemo(
    () => buildDrawPool(comments, filters, blacklistSet),
    [comments, filters, blacklistSet]
  );

  // 執行抽獎
  const draw = useCallback(() => {
    setIsDrawing(true);
    const allResults: DrawResult[] = [];
    let currentPool = [...pool];
    const excludedUsers = new Set<string>();

    for (let i = 0; i < prizes.length; i++) {
      const prize = prizes[i];
      const { winners, remainingPool } = drawWinners(currentPool, prize.quantity, excludedUsers);

      for (const winner of winners) {
        allResults.push({
          prize_id: `prize_${i}`,
          prize_name: prize.name,
          winner,
        });
        excludedUsers.add(winner.from_id);
      }

      currentPool = remainingPool;
    }

    setResults(allResults);
    setIsDrawing(false);
  }, [pool, prizes]);

  // 重抽單一獎項
  const redraw = useCallback(
    (prizeId: string) => {
      const prizeIndex = parseInt(prizeId.replace('prize_', ''), 10);
      const prize = prizes[prizeIndex];
      if (!prize) return;

      // 取得其他獎項的中獎者 (需排除)
      const otherWinnerIds = new Set(
        results.filter((r) => r.prize_id !== prizeId).map((r) => r.winner.from_id)
      );

      // 重抽
      const { winners } = drawWinners(pool, prize.quantity, otherWinnerIds);

      // 更新結果
      setResults((prev) => {
        const filtered = prev.filter((r) => r.prize_id !== prizeId);
        const newResults = winners.map((w) => ({
          prize_id: prizeId,
          prize_name: prize.name,
          winner: w,
        }));
        return [...filtered, ...newResults].sort((a, b) => a.prize_id.localeCompare(b.prize_id));
      });
    },
    [pool, prizes, results]
  );

  // 重置
  const reset = useCallback(() => {
    setResults([]);
  }, []);

  // 取得黑名單
  const fetchBlacklist = useCallback(async () => {
    if (!activePage?.id) return;

    try {
      const res = await fetch(`/api/giveaway/blacklist?pageId=${activePage.id}`);
      const data = await res.json();
      if (res.ok) {
        setBlacklist(data.data || []);
      }
    } catch (error) {
      console.error('取得黑名單失敗:', error);
    }
  }, [activePage?.id]);

  // 新增黑名單
  const addToBlacklist = useCallback(
    async (entry: BlacklistEntry) => {
      if (!activePage?.id) return;

      try {
        const res = await fetch('/api/giveaway/blacklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: activePage.id, ...entry }),
        });

        if (res.ok) {
          setBlacklist((prev) => [...prev, entry]);
        }
      } catch (error) {
        console.error('新增黑名單失敗:', error);
      }
    },
    [activePage?.id]
  );

  // 移除黑名單
  const removeFromBlacklist = useCallback(
    async (fromId: string) => {
      if (!activePage?.id) return;

      try {
        const res = await fetch(
          `/api/giveaway/blacklist?pageId=${activePage.id}&fromId=${fromId}`,
          { method: 'DELETE' }
        );

        if (res.ok) {
          setBlacklist((prev) => prev.filter((b) => b.from_id !== fromId));
        }
      } catch (error) {
        console.error('移除黑名單失敗:', error);
      }
    },
    [activePage?.id]
  );

  // 儲存抽獎結果
  const save = useCallback(
    async (name?: string): Promise<string | null> => {
      if (!activePage?.id || results.length === 0) return null;

      setIsSaving(true);

      try {
        // 建立活動
        const createRes = await fetch('/api/giveaway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: activePage.id,
            postId,
            post_url: postUrl,
            name,
            filters,
            prizes,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error);

        const giveawayId = createData.data.id;
        const prizeMap = new Map<string, string>();
        createData.data.prizes.forEach((p: { id: string }, i: number) => {
          prizeMap.set(`prize_${i}`, p.id);
        });

        // 儲存中獎者
        const winners = results.map((r) => ({
          prize_id: prizeMap.get(r.prize_id),
          from_id: r.winner.from_id,
          from_name: r.winner.from_name,
          from_picture_url: r.winner.from_picture_url,
          comment_id: r.winner.comment_id,
          comment_message: r.winner.comment_message,
          comment_created_time: r.winner.comment_created_time,
        }));

        await fetch(`/api/giveaway/${giveawayId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winners }),
        });

        return giveawayId;
      } catch (error) {
        console.error('儲存失敗:', error);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [activePage?.id, postId, postUrl, filters, prizes, results]
  );

  return {
    filters,
    setFilters,
    prizes,
    setPrizes,
    blacklist,
    pool,
    stats,
    results,
    isDrawing,
    draw,
    redraw,
    reset,
    addToBlacklist,
    removeFromBlacklist,
    fetchBlacklist,
    isSaving,
    save,
  };
}
