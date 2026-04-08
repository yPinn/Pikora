'use client';

import { useState, useCallback, useEffect } from 'react';

import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { GiveawayFilters } from '@/lib/giveaway';
import { createLogger } from '@/lib/logger';
import { apiPath } from '@/lib/utils';

const logger = createLogger('use-giveaway-history');

// 中獎者資料
export interface GiveawayWinner {
  id: string;
  from_id: string;
  from_name: string;
  from_picture_url?: string;
  comment_id: string;
  comment_message?: string;
  comment_created_time?: string;
  isValid: boolean;
  notified_at?: string;
  comment_reply_id?: string;
  prize: {
    id: string;
    name: string;
    quantity: number;
  };
}

// 獎項資料
export interface GiveawayPrize {
  id: string;
  name: string;
  quantity: number;
  sort_order: number;
}

// 抽獎活動資料
export interface GiveawayRecord {
  id: string;
  pageId: string;
  postId: string;
  post_url?: string;
  post_image?: string;
  name?: string;
  filters: GiveawayFilters;
  status: 'DRAFT' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  prizes: GiveawayPrize[];
  winners: GiveawayWinner[];
}

interface UseGiveawayHistoryReturn {
  records: GiveawayRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteRecord: (id: string) => Promise<boolean>;
}

export function useGiveawayHistory(): UseGiveawayHistoryReturn {
  const { activePage } = useFacebookPage();
  const [records, setRecords] = useState<GiveawayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!activePage?.id) {
      setRecords([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ pageId: activePage.id });
      const res = await fetch(apiPath(`/api/giveaway?${params}`));
      const data = await res.json();

      if (res.ok) {
        setRecords(data.data || []);
      } else {
        setError(data.error || '取得失敗');
      }
    } catch (error) {
      logger.error('Failed to fetch giveaway history', error);
      setError('取得失敗');
    } finally {
      setIsLoading(false);
    }
  }, [activePage?.id]);

  const deleteRecord = useCallback(
    async (id: string): Promise<boolean> => {
      if (!activePage?.id) return false;
      try {
        const res = await fetch(
          apiPath(`/api/giveaway/${id}?${new URLSearchParams({ pageId: activePage.id })}`),
          { method: 'DELETE' }
        );

        if (res.ok) {
          setRecords((prev) => prev.filter((r) => r.id !== id));
          return true;
        }
        return false;
      } catch (error) {
        logger.error('Failed to delete giveaway record', error);
        return false;
      }
    },
    [activePage?.id]
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    refresh: fetchRecords,
    deleteRecord,
  };
}
