'use client';

import { useState, useEffect, useCallback } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Gift,
  ExternalLink,
  Trash2,
  Search,
  Loader2,
  X,
  Clipboard,
  AlertCircle,
  History,
  ChevronDown,
} from 'lucide-react';

import { GiveawayPanel } from '@/components/facebook/giveaway-panel';
import { SELECTED_POST_ID_KEY, SELECTED_POST_URL_KEY } from '@/components/facebook/post-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookComment } from '@/lib/services/facebook';
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
    try {
      const res = await fetch(`/api/giveaway/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGiveaways((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  if (!isReady) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 新抽獎區塊 */}
      <Card className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
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

      {/* 歷史紀錄 - Collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="group hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors">
          <History className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground">歷史紀錄</span>
          {listLoading ? (
            <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
          ) : giveaways.length > 0 ? (
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{giveaways.length}</span>
          ) : null}
          <ChevronDown className="text-muted-foreground ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {listLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : giveaways.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">尚無抽獎紀錄</p>
          ) : (
            <div className="space-y-2">
              {giveaways.map((giveaway) => (
                <Card key={giveaway.id} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {giveaway.name || `#${giveaway.id.slice(-6)}`}
                        </span>
                        <Badge
                          className={
                            giveaway.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }
                          variant={giveaway.status === 'COMPLETED' ? 'default' : 'secondary'}
                        >
                          {giveaway.status === 'COMPLETED' ? '已完成' : '草稿'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatDistanceToNow(new Date(giveaway.createdAt), {
                          addSuffix: true,
                          locale: zhTW,
                        })}
                        {giveaway.winners.length > 0 && ` · ${giveaway.winners.length} 位中獎者`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {giveaway.post_url && (
                        <Button
                          className="h-7 w-7"
                          size="icon"
                          variant="ghost"
                          onClick={() => window.open(giveaway.post_url, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="h-7 w-7" size="icon" variant="ghost">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
                            <AlertDialogDescription>
                              此操作無法復原，抽獎紀錄將被永久刪除。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(giveaway.id)}>
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
