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
import { createLogger } from '@/lib/logger';
import type { FacebookComment, FacebookReaction } from '@/lib/services/facebook';
import { apiPath } from '@/lib/utils';

const logger = createLogger('use-giveaway');

interface UseGiveawayOptions {
  comments: FacebookComment[];
  postId: string;
  postUrl?: string;
  postImage?: string;
}

export type SaveMode = 'new' | 'replace' | 'saved';

interface UseGiveawayReturn {
  // 設定
  filters: GiveawayFilters;
  setFilters: (filters: GiveawayFilters) => void;
  prizes: PrizeInput[];
  setPrizes: (prizes: PrizeInput[]) => void;
  blacklist: BlacklistEntry[];

  // 反應資料
  reactions: FacebookReaction[];
  isLoadingReactions: boolean;
  hasLoadedReactions: boolean;
  fetchReactions: () => Promise<void>;

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
  isSaved: boolean;
  saveMode: SaveMode; // 'new' = 建立新紀錄, 'replace' = 取代現有, 'saved' = 已儲存無變更
  save: (name?: string) => Promise<string | null>;
}

export function useGiveaway({
  comments,
  postId,
  postUrl,
  postImage,
}: UseGiveawayOptions): UseGiveawayReturn {
  const { activePage } = useFacebookPage();

  const [filters, setFilters] = useState<GiveawayFilters>({});
  const [prizes, setPrizes] = useState<PrizeInput[]>([
    { id: crypto.randomUUID(), name: '頭獎', quantity: 1 },
  ]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [reactions, setReactions] = useState<FacebookReaction[]>([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);
  const [hasLoadedReactions, setHasLoadedReactions] = useState(false);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  // 重抽後結果已變更，需要重新儲存（取代舊記錄）
  const [isDirty, setIsDirty] = useState(false);

  // 黑名單 Set (for filtering)
  const blacklistSet = useMemo(() => new Set(blacklist.map((b) => b.from_id)), [blacklist]);

  // 反應者 ID Set (for filtering)
  const reactorIds = useMemo(() => new Set(reactions.map((r) => r.id)), [reactions]);

  // 建立抽獎池（僅頂層留言）
  const { pool, stats } = useMemo(
    () =>
      buildDrawPool(
        comments,
        filters,
        blacklistSet,
        filters.require_reaction ? reactorIds : undefined
      ),
    [comments, filters, blacklistSet, reactorIds]
  );

  // 執行抽獎
  const draw = useCallback(() => {
    setIsDrawing(true);
    // setTimeout(0) 讓 isDrawing=true 先渲染，再執行同步的抽獎運算
    setTimeout(() => {
      const allResults: DrawResult[] = [];
      const allowDuplicate = filters.allow_duplicate || false;
      const allowMultiWin = filters.allow_multi_win || false;

      // allow_multi_win：每個獎項皆從完整 pool 重新抽，不跨獎項排除用戶
      // 否則：依序抽，上一獎項中獎者排除在後續獎項之外
      let currentPool = [...pool];
      const excludedUsers = new Set<string>();

      for (const prize of prizes) {
        const { winners, remainingPool } = drawWinners(
          allowMultiWin ? pool : currentPool,
          prize.quantity,
          allowMultiWin ? new Set() : excludedUsers,
          allowDuplicate,
          allowMultiWin
        );

        for (const winner of winners) {
          allResults.push({ prize_id: prize.id, prize_name: prize.name, winner });
          if (!allowMultiWin) excludedUsers.add(winner.from_id);
        }

        if (!allowMultiWin) currentPool = remainingPool;
      }

      setResults(allResults);
      setIsDrawing(false);
      setSavedId(null);
      setIsDirty(false);
    }, 0);
  }, [pool, prizes, filters.allow_duplicate, filters.allow_multi_win]);

  // 重抽單一獎項
  const redraw = useCallback(
    (prizeId: string) => {
      const prize = prizes.find((p) => p.id === prizeId);
      if (!prize) return;

      const allowMultiWin = filters.allow_multi_win || false;

      // 透過 functional updater 讀取 prev results，避免 results 進入 deps 破壞 memoization
      setResults((prev) => {
        // allow_multi_win：不排除任何人；否則排除其他獎項的中獎者
        const otherWinnerIds = allowMultiWin
          ? new Set<string>()
          : new Set(prev.filter((r) => r.prize_id !== prizeId).map((r) => r.winner.from_id));

        const { winners } = drawWinners(
          pool,
          prize.quantity,
          otherWinnerIds,
          filters.allow_duplicate || false,
          allowMultiWin
        );

        const filtered = prev.filter((r) => r.prize_id !== prizeId);
        const newResults = winners.map((w) => ({
          prize_id: prizeId,
          prize_name: prize.name,
          winner: w,
        }));
        return [...filtered, ...newResults].sort((a, b) => {
          const ia = prizes.findIndex((p) => p.id === a.prize_id);
          const ib = prizes.findIndex((p) => p.id === b.prize_id);
          return ia - ib;
        });
      });
      setIsDirty(true);
    },
    [pool, prizes, filters.allow_duplicate, filters.allow_multi_win]
  );

  // 重置
  const reset = useCallback(() => {
    setResults([]);
    setSavedId(null);
    setIsDirty(false);
  }, []);

  // 取得黑名單
  const fetchBlacklist = useCallback(async () => {
    if (!activePage?.id) return;

    try {
      const res = await fetch(
        apiPath(`/api/giveaway/blacklist?${new URLSearchParams({ pageId: activePage.id })}`)
      );
      const data = await res.json();
      if (res.ok) {
        setBlacklist(data.data || []);
      }
    } catch (error) {
      logger.error('Failed to fetch blacklist', error);
    }
  }, [activePage?.id]);

  // 取得反應者列表
  const fetchReactions = useCallback(async () => {
    if (!activePage?.id || !postId) return;

    setIsLoadingReactions(true);
    try {
      const reactionsParams = new URLSearchParams({
        postId,
        pageId: activePage.id,
        fetchAll: 'true',
      });
      const res = await fetch(apiPath(`/api/facebook/reactions?${reactionsParams}`));
      const data = await res.json();
      if (res.ok) {
        setReactions(data.data || []);
        setHasLoadedReactions(true);
      }
    } catch (error) {
      logger.error('Failed to fetch reactions', error);
      setHasLoadedReactions(true); // 即使失敗也標記為已嘗試
    } finally {
      setIsLoadingReactions(false);
    }
  }, [activePage?.id, postId]);

  // 新增黑名單
  const addToBlacklist = useCallback(
    async (entry: BlacklistEntry) => {
      if (!activePage?.id) return;

      try {
        const res = await fetch(apiPath('/api/giveaway/blacklist'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: activePage.id, ...entry }),
        });

        if (res.ok) {
          setBlacklist((prev) => [...prev, entry]);
        }
      } catch (error) {
        logger.error('Failed to add to blacklist', error);
      }
    },
    [activePage?.id]
  );

  // 移除黑名單
  const removeFromBlacklist = useCallback(
    async (fromId: string) => {
      if (!activePage?.id) return;

      try {
        const deleteParams = new URLSearchParams({ pageId: activePage.id, from_id: fromId });
        const res = await fetch(apiPath(`/api/giveaway/blacklist?${deleteParams}`), {
          method: 'DELETE',
        });

        if (res.ok) {
          setBlacklist((prev) => prev.filter((b) => b.from_id !== fromId));
        }
      } catch (error) {
        logger.error('Failed to remove from blacklist', error);
      }
    },
    [activePage?.id]
  );

  // 儲存抽獎結果
  const save = useCallback(
    async (name?: string): Promise<string | null> => {
      if (!activePage?.id || results.length === 0) return null;
      // 已儲存且結果未變動，直接回傳
      if (savedId && !isDirty) return savedId;

      setIsSaving(true);

      // 重抽後再存：先刪舊記錄，以同一次行為取代
      if (savedId && isDirty) {
        await fetch(
          apiPath(
            `/api/giveaway/${savedId}?${new URLSearchParams({ pageId: activePage?.id ?? '' })}`
          ),
          { method: 'DELETE' }
        ).catch(() => null);
        setSavedId(null);
      }

      try {
        // 建立活動
        const createRes = await fetch(apiPath('/api/giveaway'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: activePage.id,
            postId,
            post_url: postUrl,
            post_image: postImage,
            name,
            filters,
            prizes,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error);

        const giveawayId = createData.data.id;
        // 建立從本地 prize UUID 到資料庫 prize id 的映射（順序與送出 prizes 陣列相同）
        const prizeMap = new Map<string, string>();
        prizes.forEach((localPrize, i) => {
          prizeMap.set(localPrize.id, createData.data.prizes[i].id);
        });

        // 儲存中獎者
        const winners = results.map((r) => {
          const dbPrizeId = prizeMap.get(r.prize_id);
          if (!dbPrizeId) throw new Error('獎項映射失敗：請重試');
          return {
            prize_id: dbPrizeId,
            from_id: r.winner.from_id,
            from_name: r.winner.from_name,
            from_picture_url: r.winner.from_picture_url,
            comment_id: r.winner.comment_id,
            comment_message: r.winner.comment_message,
            comment_created_time: r.winner.comment_created_time,
          };
        });

        const patchRes = await fetch(apiPath(`/api/giveaway/${giveawayId}`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winners, pageId: activePage?.id }),
        });
        const patchData = await patchRes.json();
        if (!patchRes.ok) {
          // PATCH 失敗：清理剛建立的 giveaway 避免留下空殼資料
          await fetch(apiPath(`/api/giveaway/${giveawayId}`), { method: 'DELETE' }).catch((e) =>
            logger.warn('Cleanup DELETE failed after PATCH error', e)
          );
          throw new Error(patchData.error || '儲存中獎者失敗');
        }

        setSavedId(giveawayId);
        setIsDirty(false);
        return giveawayId;
      } catch (error) {
        logger.error('Failed to save giveaway', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [activePage?.id, postId, postUrl, postImage, filters, prizes, results, savedId, isDirty]
  );

  return {
    filters,
    setFilters,
    prizes,
    setPrizes,
    blacklist,
    reactions,
    isLoadingReactions,
    hasLoadedReactions,
    fetchReactions,
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
    isSaved: savedId !== null && !isDirty,
    saveMode: (savedId !== null && !isDirty
      ? 'saved'
      : savedId !== null && isDirty
        ? 'replace'
        : 'new') as SaveMode,
    save,
  };
}
