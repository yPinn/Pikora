'use client';

import { useState, useCallback, useEffect } from 'react';

import { useFacebookPage } from '@/contexts/facebook-page-store';

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
  name?: string;
  filters: Record<string, unknown>;
  status: string;
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
      const res = await fetch(`/api/giveaway?pageId=${activePage.id}`);
      const data = await res.json();

      if (res.ok) {
        setRecords(data.data || []);
      } else {
        setError(data.error || '取得失敗');
      }
    } catch (err) {
      console.error('取得抽獎紀錄失敗:', err);
      setError('取得失敗');
    } finally {
      setIsLoading(false);
    }
  }, [activePage?.id]);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/giveaway/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('刪除抽獎紀錄失敗:', err);
      return false;
    }
  }, []);

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
