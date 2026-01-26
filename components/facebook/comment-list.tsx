'use client';

import Image from 'next/image';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Search,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clipboard,
  ArrowUpDown,
  Image as ImageIcon,
  MessageCircle,
  ThumbsUp,
  Clock,
  History,
  Flame,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import { useFacebookComments } from '@/hooks/use-facebook-comments';
import type { FacebookComment } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';

// --- 原子組件：狀態顯示 ---
interface StatusViewProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  variant?: 'default' | 'error';
}

const StatusView = ({ icon: Icon, title, desc, variant = 'default' }: StatusViewProps) => (
  <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
    <Icon
      className={cn(
        'mb-4 h-12 w-12 opacity-60',
        variant === 'error' ? 'text-destructive' : 'text-muted-foreground'
      )}
    />
    <h3 className={cn('text-lg font-medium', variant === 'error' && 'text-destructive')}>
      {title}
    </h3>
    <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">{desc}</p>
  </div>
);

// --- 原子組件：留言單項目 ---
const CommentItem = ({ comment }: { comment: FacebookComment }) => {
  const hasReplies = comment.comments?.data && comment.comments.data.length > 0;

  return (
    <div className="hover:bg-accent/5 border-b px-4 py-3 transition-colors last:border-0">
      <div className="relative flex gap-3">
        {hasReplies && <div className="bg-border absolute top-9 bottom-0 left-4 w-0.5" />}
        <Avatar className="relative z-10 h-9 w-9 shrink-0">
          <AvatarImage alt={comment.from?.name} src={comment.from?.picture?.data?.url} />
          <AvatarFallback className="text-sm font-bold" delayMs={300}>
            {comment.from?.name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{comment.from?.name}</span>
            <span className="text-muted-foreground ml-2 text-xs">
              {formatDistanceToNow(new Date(comment.created_time), {
                addSuffix: true,
                locale: zhTW,
              })}
            </span>
          </p>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {comment.message}
          </p>
          {comment.attachment?.media?.image?.src && (
            <div className="relative mt-2 h-36 w-56">
              <Image
                fill
                alt="Attachment"
                className="rounded-md border object-cover"
                sizes="224px"
                src={comment.attachment.media.image.src}
              />
            </div>
          )}
          <div className="text-muted-foreground mt-1.5 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {comment.like_count || 0}
            </span>
            {comment.comment_count !== undefined && comment.comment_count > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {comment.comment_count} 則回覆
              </span>
            )}
          </div>
        </div>
      </div>
      {hasReplies && (
        <div className="relative">
          {comment.comments!.data.map((reply, index) => {
            const isLast = index === comment.comments!.data.length - 1;
            return (
              <div key={reply.id} className="relative">
                {/* 垂直線（上半段） */}
                <div className="bg-border absolute top-0 left-4 h-8 w-0.5" />
                {/* 水平連接線 */}
                <div className="bg-border absolute top-8 left-4 h-0.5 w-8" />
                {/* 垂直線（下半段，非最後一個才顯示） */}
                {!isLast && <div className="bg-border absolute top-8 bottom-0 left-4 w-0.5" />}
                <div className="pl-8">
                  <CommentItem comment={reply} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- 主組件 ---
export function CommentList() {
  const { activePage, isReady } = useFacebookPage();
  const { state, actions } = useFacebookComments(activePage);

  if (!isReady)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled={!state.postImage} size="icon" variant="outline">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          {state.postImage && (
            <TooltipContent className="border-none p-0">
              <div className="relative h-48 w-48 overflow-hidden rounded-md">
                <Image
                  fill
                  unoptimized
                  alt="Preview"
                  className="object-cover"
                  src={state.postImage}
                />
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        <div className="relative flex-1">
          <Input
            className="pr-16"
            placeholder="貼入連結查詢留言..."
            value={state.postUrl}
            onChange={(e) => actions.setPostUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && actions.fetchComments(state.postUrl)}
          />
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-0.5">
            {state.postUrl && (
              <Button
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                size="icon"
                variant="ghost"
                onClick={actions.clearInput}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              size="icon"
              variant="ghost"
              onClick={async () => actions.setPostUrl(await navigator.clipboard.readText())}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          disabled={!state.postUrl}
          title="原始貼文"
          variant="outline"
          onClick={() => window.open(state.postUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          disabled={!state.postId}
          title="重新整理"
          variant="outline"
          onClick={actions.refresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={() => actions.fetchComments(state.postUrl)}>
          <Search className="mr-2 h-4 w-4" />
          查詢
        </Button>
      </div>

      {state.loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : state.comments.length > 0 ? (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <ArrowUpDown className="mr-2 h-3 w-3" />
                  排序
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  className={state.sortBy === 'newest' ? 'bg-accent' : ''}
                  onClick={() => actions.setSortBy('newest')}
                >
                  <Clock className="h-3.5 w-3.5" />
                  最新優先
                  {state.sortBy === 'newest' && <Check className="ml-2 h-3.5 w-3.5" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={state.sortBy === 'oldest' ? 'bg-accent' : ''}
                  onClick={() => actions.setSortBy('oldest')}
                >
                  <History className="h-3.5 w-3.5" />
                  最早優先
                  {state.sortBy === 'oldest' && <Check className="ml-2 h-3.5 w-3.5" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={state.sortBy === 'most_likes' ? 'bg-accent' : ''}
                  onClick={() => actions.setSortBy('most_likes')}
                >
                  <Flame className="h-3.5 w-3.5" />
                  熱門優先
                  {state.sortBy === 'most_likes' && <Check className="ml-2 h-3.5 w-3.5" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted-foreground text-xs">
              共 {state.filteredComments.length} 則留言
              {state.filteredComments.length !== state.comments.length &&
                ` (全部 ${state.comments.length} 則)`}
            </span>
            <Input
              className="ml-auto h-8 w-48 text-xs"
              placeholder="搜尋內容..."
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-card rounded-lg border shadow-sm">
            {state.paginatedComments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </div>
          {state.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                disabled={state.currentPage === 1}
                size="sm"
                variant="outline"
                onClick={() => actions.setCurrentPage(state.currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground text-sm">
                第 {state.currentPage} / {state.totalPages} 頁
              </span>
              <Button
                disabled={state.currentPage === state.totalPages}
                size="sm"
                variant="outline"
                onClick={() => actions.setCurrentPage(state.currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : state.error ? (
        <StatusView desc={state.error} icon={AlertCircle} title="載入失敗" variant="error" />
      ) : !state.postId ? (
        <StatusView
          desc="從列表點擊貼文卡片，或直接在此貼上 URL。"
          icon={Search}
          title="請選擇貼文"
        />
      ) : (
        <StatusView desc="這則貼文尚未有任何留言。" icon={MessageCircle} title="目前無留言" />
      )}
    </div>
  );
}
