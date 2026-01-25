'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookPost } from '@/lib/services/facebook';

interface UseFacebookPostsOptions {
  /** 每次載入數量，預設 12 */
  limit?: number;
  /** 是否自動載入，預設 true */
  autoFetch?: boolean;
}

interface UseFacebookPostsReturn {
  posts: FacebookPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Hook 用於取得 Facebook 粉絲專頁的貼文列表（支援分頁）
 */
export function useFacebookPosts(options: UseFacebookPostsOptions = {}): UseFacebookPostsReturn {
  const { limit = 12, autoFetch = true } = options;
  const { activePage, isReady } = useFacebookPage();

  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      if (!activePage?.id || !activePage?.access_token) {
        setIsLoading(false);
        return;
      }

      // 取消先前的請求
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const isLoadMore = !!cursor;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const params = new URLSearchParams({
          pageId: activePage.id,
          limit: String(limit),
        });
        if (cursor) params.set('after', cursor);

        const res = await fetch(`/api/facebook/posts?${params}`, {
          headers: { Authorization: `Bearer ${activePage.access_token}` },
          signal: abortControllerRef.current.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '取得貼文失敗');
        }

        const newPosts = data.data || [];
        const nextCursor = data.paging?.cursors?.after || null;

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setAfterCursor(nextCursor);
        setHasMore(!!nextCursor && newPosts.length === limit);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message = err instanceof Error ? err.message : '未知錯誤';
        setError(message);
        if (!isLoadMore) {
          setPosts([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activePage?.id, activePage?.access_token, limit]
  );

  const refetch = useCallback(async () => {
    setAfterCursor(null);
    setHasMore(true);
    await fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !afterCursor) return;
    await fetchPosts(afterCursor);
  }, [fetchPosts, hasMore, isLoadingMore, afterCursor]);

  // 切換粉專時重置
  useEffect(() => {
    if (!isReady || !autoFetch) return;

    setPosts([]);
    setAfterCursor(null);
    setHasMore(true);
    fetchPosts();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isReady, autoFetch, activePage?.id, fetchPosts]);

  return {
    posts,
    isLoading: !isReady || isLoading,
    isLoadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  };
}
