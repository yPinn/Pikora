'use client';

import { useState, useEffect, useCallback } from 'react';

import { Gift, Search, Loader2, X, Clipboard, AlertCircle } from 'lucide-react';

import { GiveawayPanel } from '@/components/facebook/giveaway-panel';
import {
  SELECTED_POST_ID_KEY,
  SELECTED_POST_MESSAGE_KEY,
  SELECTED_POST_URL_KEY,
} from '@/components/facebook/post-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookComment } from '@/lib/services/facebook';
import { apiPath } from '@/lib/utils';
import { extractPostIdFromUrl, parseFacebookErrorMessage } from '@/lib/utils/facebook';

export function GiveawayList() {
  const { activePage, isReady } = useFacebookPage();

  // 新抽獎：留言載入
  const [postUrl, setPostUrl] = useState('');
  const [postId, setPostId] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [comments, setComments] = useState<FacebookComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // 初始化：從 sessionStorage 讀取並清除
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUrl = sessionStorage.getItem(SELECTED_POST_URL_KEY);
    const savedId = sessionStorage.getItem(SELECTED_POST_ID_KEY);

    if (savedUrl) setPostUrl(savedUrl);
    if (savedId) setPostId(savedId);
    const savedMessage = sessionStorage.getItem(SELECTED_POST_MESSAGE_KEY);
    if (savedMessage) setPostMessage(savedMessage);

    // 讀取後清除
    sessionStorage.removeItem(SELECTED_POST_URL_KEY);
    sessionStorage.removeItem(SELECTED_POST_ID_KEY);
    sessionStorage.removeItem(SELECTED_POST_MESSAGE_KEY);
  }, []);

  // 當 postId 有值且有 activePage 時自動載入留言（並同步貼文名稱）
  useEffect(() => {
    if (!postId || !activePage?.id) return;

    const controller = new AbortController();

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError(null);

      try {
        const commentsParams = new URLSearchParams({
          postId,
          pageId: activePage.id,
          fetchAll: 'true',
        });
        const postParams = new URLSearchParams({ postId, pageId: activePage.id });

        const [commentsRes, postRes] = await Promise.all([
          fetch(apiPath(`/api/facebook/comments?${commentsParams}`), {
            signal: controller.signal,
          }),
          fetch(apiPath(`/api/facebook/posts?${postParams}`), { signal: controller.signal }),
        ]);

        const commentsData = await commentsRes.json();
        if (!commentsRes.ok) {
          throw new Error(commentsData.error || '取得留言失敗');
        }
        setComments(commentsData.data || []);

        if (postRes.ok) {
          const postData = await postRes.json();
          const message: string = postData.data?.message ?? '';
          if (message) setPostMessage(message);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const message = err instanceof Error ? err.message : '未知錯誤';
        setCommentsError(parseFacebookErrorMessage(message));
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
    return () => controller.abort();
  }, [postId, activePage?.id]);

  // 從 URL 解析並設定 postId（實際載入由 useEffect 處理）
  const fetchComments = useCallback(() => {
    if (!postUrl.trim()) return;

    const extracted = extractPostIdFromUrl(postUrl, activePage?.id);
    const targetPostId = extracted || postUrl;

    setPostId(targetPostId);
  }, [activePage?.id, postUrl]);

  // 清除抽獎狀態
  const clearGiveaway = () => {
    setPostUrl('');
    setPostId('');
    setComments([]);
    setCommentsError(null);
  };

  if (!isReady) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-body flex items-center gap-2 font-medium">
        <Gift className="h-4 w-4" />
        建立新抽獎
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            className="pr-16"
            placeholder="貼入貼文 URL..."
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchComments()}
          />
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-0.5">
            {postUrl && (
              <Button
                className="text-muted-foreground hover:text-foreground"
                size="icon-sm"
                variant="ghost"
                onClick={clearGiveaway}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              className="text-muted-foreground hover:text-foreground"
              size="icon-sm"
              variant="ghost"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setPostUrl(text);
                } catch {
                  // 使用者拒絕剪貼簿存取，靜默忽略
                }
              }}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button disabled={!postUrl || commentsLoading} onClick={fetchComments}>
          {commentsLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          載入留言
        </Button>
      </div>

      {/* 錯誤訊息 */}
      {commentsError && (
        <div className="text-destructive text-body mt-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {commentsError}
        </div>
      )}

      {/* 留言已載入：顯示抽獎面板 */}
      {comments.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          <Separator />
          <GiveawayPanel
            comments={comments}
            pageId={activePage?.id}
            postId={postId}
            postMessage={postMessage}
            postUrl={postUrl}
          />
        </div>
      )}

      {/* 無留言提示 */}
      {postId && !commentsLoading && !commentsError && comments.length === 0 && (
        <p className="text-muted-foreground text-body mt-3 text-center">這則貼文尚未有任何留言</p>
      )}
    </Card>
  );
}
