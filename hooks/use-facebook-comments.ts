import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { SELECTED_POST_ID_KEY, SELECTED_POST_URL_KEY } from '@/components/facebook/post-list';
import type { FacebookComment, FacebookPage } from '@/lib/services/facebook';

// 從 URL 解析 postId
function extractPostIdFromUrl(url: string, pageId?: string): string | null {
  if (!url) return null;

  // 已經是 pageId_postId 格式
  if (url.includes('_') && /^\d+_\d+$/.test(url)) {
    return url;
  }

  // https://www.facebook.com/{pageId}/posts/{postId}
  const postsMatch = url.match(/\/posts\/(\d+)/);
  if (postsMatch) {
    return pageId ? `${pageId}_${postsMatch[1]}` : postsMatch[1];
  }

  // https://www.facebook.com/permalink.php?story_fbid={postId}&id={pageId}
  const storyMatch = url.match(/story_fbid=(\d+)/);
  if (storyMatch) {
    return pageId ? `${pageId}_${storyMatch[1]}` : storyMatch[1];
  }

  return null;
}

// 解析錯誤訊息為友善提示
function parseErrorMessage(error: string): string {
  if (error.includes('does not exist') || error.includes('cannot be loaded')) {
    return '該貼文不存在、已被刪除，或沒有權限查看。';
  }
  if (error.includes('permission') || error.includes('Permission')) {
    return '權限不足，請確認已授權相關權限。';
  }
  if (error.includes('token') || error.includes('Token') || error.includes('Session')) {
    return '授權已過期，請重新登入。';
  }
  return '無法取得留言，請確認貼文 URL 是否正確。';
}

export function useFacebookComments(activePage: FacebookPage | null) {
  const [comments, setComments] = useState<FacebookComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [postImage, setPostImage] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_likes'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const prevPageIdRef = useRef<string | undefined>(undefined);

  // 初始化：從 sessionStorage 讀取並清除
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUrl = sessionStorage.getItem(SELECTED_POST_URL_KEY);
    const savedId = sessionStorage.getItem(SELECTED_POST_ID_KEY);

    if (savedUrl) setPostUrl(savedUrl);
    if (savedId) setPostId(savedId);

    // 讀取後清除
    sessionStorage.removeItem(SELECTED_POST_URL_KEY);
    sessionStorage.removeItem(SELECTED_POST_ID_KEY);
  }, []);

  // 切換粉專時清空狀態
  useEffect(() => {
    if (prevPageIdRef.current === undefined) {
      prevPageIdRef.current = activePage?.id;
      return;
    }

    if (prevPageIdRef.current !== activePage?.id) {
      prevPageIdRef.current = activePage?.id;
      setPostId('');
      setPostUrl('');
      setPostImage('');
      setComments([]);
      setError(null);
      setSearchQuery('');
    }
  }, [activePage?.id]);

  // 當 postId 變更且有效時自動抓取
  // 注意：不依賴 activePage?.id，避免切換專頁時用舊 postId 發請求
  useEffect(() => {
    if (postId && activePage?.access_token) {
      fetchCommentsInternal(postId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchCommentsInternal = useCallback(
    async (targetPostId: string) => {
      if (!activePage?.access_token || !targetPostId) return;

      setLoading(true);
      setError(null);

      try {
        const [commentsRes, postRes] = await Promise.all([
          fetch(`/api/facebook/comments?postId=${targetPostId}&fetchAll=true`, {
            headers: { Authorization: `Bearer ${activePage.access_token}` },
          }),
          fetch(`/api/facebook/posts?postId=${targetPostId}`, {
            headers: { Authorization: `Bearer ${activePage.access_token}` },
          }),
        ]);

        const commentsData = await commentsRes.json();
        if (!commentsRes.ok) {
          throw new Error(commentsData.error || '取得留言失敗');
        }

        setComments(commentsData.data || []);

        if (postRes.ok) {
          const postData = await postRes.json();
          setPostImage(postData.data?.full_picture || '');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知錯誤';
        setError(parseErrorMessage(message));
        setComments([]);
      } finally {
        setLoading(false);
      }
    },
    [activePage?.access_token]
  );

  // 對外的 fetchComments：處理 URL 解析
  const fetchComments = useCallback(
    (input: string) => {
      if (!input?.trim()) return; // 空輸入不處理

      const extracted = extractPostIdFromUrl(input, activePage?.id);
      const targetPostId = extracted || input;

      // 更新狀態
      setPostUrl(input);
      setPostId(targetPostId);
      // postId 變更會觸發 useEffect 自動 fetch
    },
    [activePage?.id]
  );

  // 重新整理：使用現有 postId
  const refresh = useCallback(() => {
    if (postId) {
      fetchCommentsInternal(postId);
    }
  }, [postId, fetchCommentsInternal]);

  const filteredComments = useMemo(() => {
    let list = comments;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = comments.filter(
        (c) =>
          c.message?.toLowerCase().includes(query) || c.from?.name?.toLowerCase().includes(query)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'most_likes') {
        return (b.like_count || 0) - (a.like_count || 0);
      }
      const diff = new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      return sortBy === 'newest' ? diff : -diff;
    });
  }, [comments, sortBy, searchQuery]);

  // 清除輸入與狀態
  const clearInput = useCallback(() => {
    setPostUrl('');
    setPostId('');
    setPostImage('');
    setComments([]);
    setError(null);
  }, []);

  return {
    state: {
      comments,
      loading,
      error,
      postId,
      postUrl,
      postImage,
      sortBy,
      searchQuery,
      filteredComments,
    },
    actions: {
      fetchComments,
      refresh,
      setSortBy,
      setSearchQuery,
      setError,
      setPostUrl,
      clearInput,
    },
  };
}
