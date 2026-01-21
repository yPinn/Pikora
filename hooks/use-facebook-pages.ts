'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import type { FacebookPage } from '@/lib/services/facebook';

interface UseFacebookPagesReturn {
  pages: FacebookPage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook 用於取得用戶管理的 Facebook 粉絲專頁
 */
export function useFacebookPages(): UseFacebookPagesReturn {
  const { data: session, status } = useSession();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    // 等待 session 狀態確定
    if (status === 'loading') {
      return;
    }

    if (!session?.accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/facebook/pages', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '取得粉絲專頁失敗');
      }

      const { data } = await response.json();
      setPages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    isLoading,
    error,
    refetch: fetchPages,
  };
}
