'use client';

import { useState, useEffect, useCallback } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Gift,
  Trophy,
  ExternalLink,
  Trash2,
  Search,
  Loader2,
  X,
  Clipboard,
  AlertCircle,
} from 'lucide-react';

import { GiveawayPanel } from '@/components/facebook/giveaway-panel';
import { SELECTED_POST_ID_KEY, SELECTED_POST_URL_KEY } from '@/components/facebook/post-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookComment } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';
import { extractPostIdFromUrl, parseFacebookErrorMessage } from '@/lib/utils/facebook';

interface GiveawayRecord {
  id: string;
  name?: string;
  postId: string;
  post_url?: string;
  status: 'DRAFT' | 'COMPLETED';
  createdAt: string;
  prizes: { id: string; name: string; quantity: number }[];
  winners: {
    id: string;
    from_id: string;
    from_name: string;
    from_picture_url?: string;
    comment_message: string;
    prize: { name: string };
  }[];
}

export function GiveawayList() {
  const { activePage, isReady } = useFacebookPage();

  // 歷史紀錄
  const [giveaways, setGiveaways] = useState<GiveawayRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // 新抽獎：留言載入
  const [postUrl, setPostUrl] = useState('');
  const [postId, setPostId] = useState('');
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

    // 讀取後清除
    sessionStorage.removeItem(SELECTED_POST_URL_KEY);
    sessionStorage.removeItem(SELECTED_POST_ID_KEY);
  }, []);

  // 當 postId 有值且有 access_token 時自動載入留言
  useEffect(() => {
    if (!postId || !activePage?.access_token) return;

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError(null);

      try {
        const res = await fetch(`/api/facebook/comments?postId=${postId}&fetchAll=true`, {
          headers: { Authorization: `Bearer ${activePage.access_token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || '取得留言失敗');
        }

        setComments(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知錯誤';
        setCommentsError(parseFacebookErrorMessage(message));
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [postId, activePage?.access_token]);

  // 取得歷史紀錄
  const fetchGiveaways = useCallback(async () => {
    if (!activePage?.id) return;

    setListLoading(true);
    try {
      const res = await fetch(`/api/giveaway?pageId=${activePage.id}`);
      const data = await res.json();
      if (res.ok) {
        setGiveaways(data.data || []);
      }
    } catch (error) {
      console.error('取得抽獎列表失敗:', error);
    } finally {
      setListLoading(false);
    }
  }, [activePage?.id]);

  useEffect(() => {
    if (isReady && activePage?.id) {
      fetchGiveaways();
    }
  }, [isReady, activePage?.id, fetchGiveaways]);

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

  // 刪除歷史紀錄
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個抽獎紀錄嗎？')) return;

    try {
      const res = await fetch(`/api/giveaway/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGiveaways((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  if (!isReady || listLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 新抽獎區塊 */}
      <Card className="p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
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
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                  size="icon"
                  variant="ghost"
                  onClick={clearGiveaway}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                size="icon"
                variant="ghost"
                onClick={async () => setPostUrl(await navigator.clipboard.readText())}
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
          <div className="text-destructive mt-3 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {commentsError}
          </div>
        )}

        {/* 留言已載入：顯示抽獎面板 */}
        {comments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <GiveawayPanel comments={comments} postId={postId} postUrl={postUrl} />
          </div>
        )}

        {/* 無留言提示 */}
        {postId && !commentsLoading && !commentsError && comments.length === 0 && (
          <p className="text-muted-foreground mt-3 text-center text-sm">這則貼文尚未有任何留言</p>
        )}
      </Card>

      {/* 歷史紀錄 */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">歷史紀錄</h3>

        {giveaways.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12">
            <Trophy className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground text-sm">尚無抽獎紀錄</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {giveaways.map((giveaway) => (
              <Card key={giveaway.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {giveaway.name || `抽獎活動 #${giveaway.id.slice(-6)}`}
                      </h4>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          giveaway.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        )}
                      >
                        {giveaway.status === 'COMPLETED' ? '已完成' : '草稿'}
                      </span>
                    </div>

                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDistanceToNow(new Date(giveaway.createdAt), {
                        addSuffix: true,
                        locale: zhTW,
                      })}
                      {' · '}
                      {giveaway.prizes.map((p) => `${p.name} x${p.quantity}`).join('、')}
                    </p>

                    {giveaway.winners.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {giveaway.winners.slice(0, 5).map((w) => (
                          <div
                            key={w.id}
                            className="bg-muted flex items-center gap-2 rounded-full py-1 pr-3 pl-1"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={w.from_picture_url} />
                              <AvatarFallback className="text-xs">{w.from_name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">
                              {w.from_name}
                              <span className="text-muted-foreground ml-1">({w.prize.name})</span>
                            </span>
                          </div>
                        ))}
                        {giveaway.winners.length > 5 && (
                          <span className="text-muted-foreground self-center text-xs">
                            +{giveaway.winners.length - 5} 人
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {giveaway.post_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(giveaway.post_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(giveaway.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
