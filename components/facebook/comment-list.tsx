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
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import { useFacebookComments } from '@/hooks/use-facebook-comments';
import type { FacebookComment } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';

import { FacebookAvatar } from './facebook-avatar';

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
    <h3 className={cn('text-heading font-medium', variant === 'error' && 'text-destructive')}>
      {title}
    </h3>
    <p className="text-muted-foreground text-body mt-2 max-w-xs leading-relaxed">{desc}</p>
  </div>
);

// --- 原子組件：留言單項目 (Facebook 風格) ---
const CommentItem = ({ comment, pageId }: { comment: FacebookComment; pageId?: string }) => {
  const hasReplies = comment.comments?.data && comment.comments.data.length > 0;
  const displayName = comment.from?.name ?? `使用者 #${comment.id.slice(-4)}`;

  return (
    <div className="relative py-1">
      <div className="relative flex items-start gap-2">
        {hasReplies && <div className="bg-border absolute top-8 bottom-0 left-3.75 w-0.5" />}
        <div className="shrink-0">
          <FacebookAvatar
            name={displayName}
            pageId={pageId}
            pictureUrl={comment.from?.picture?.data?.url}
            userId={comment.from?.id ?? `anon_${comment.id}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="bg-muted inline-block max-w-full rounded-2xl px-3 py-1.5">
            <p className="text-caption font-semibold">{displayName}</p>
            <p className="text-sm wrap-break-word whitespace-pre-wrap">{comment.message}</p>
          </div>
          {comment.attachment?.media?.image?.src && (
            <div className="relative mt-1 h-36 w-56">
              <Image
                fill
                alt="Attachment"
                className="rounded-lg object-cover"
                sizes="224px"
                src={comment.attachment.media.image.src}
              />
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2 px-1 pt-0.5 text-[11px]">
            <span>
              {formatDistanceToNow(new Date(comment.created_time), {
                addSuffix: false,
                locale: zhTW,
              })}
            </span>
            {(comment.like_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-2.5" />
                {comment.like_count}
              </span>
            )}
            {(comment.comment_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="size-2.5" />
                {comment.comment_count}
              </span>
            )}
          </div>
        </div>
      </div>
      {hasReplies && (
        <div>
          {comment.comments?.data.map((reply, index) => {
            const isLast = index === (comment.comments?.data.length ?? 0) - 1;
            return (
              <div key={reply.id} className="relative">
                {/* 垂直線上段（連接到水平線） */}
                <div className="bg-border absolute top-0 left-3.75 h-5 w-0.5" />
                {/* 垂直線下段（非最後一個才顯示） */}
                {!isLast && <div className="bg-border absolute top-5 bottom-0 left-3.75 w-0.5" />}
                {/* 水平連接線 */}
                <div className="bg-border absolute top-5 left-3.75 h-0.5 w-5" />
                <div className="pl-10">
                  <CommentItem comment={reply} pageId={pageId} />
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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled={!state.postImage} size="icon-md" variant="outline">
              <ImageIcon />
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
                className="text-muted-foreground hover:text-foreground"
                size="icon-sm"
                variant="ghost"
                onClick={actions.clearInput}
              >
                <X />
              </Button>
            )}
            <Button
              className="text-muted-foreground hover:text-foreground"
              size="icon-sm"
              variant="ghost"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  actions.setPostUrl(text);
                } catch {
                  // 使用者拒絕剪貼簿存取，靜默忽略
                }
              }}
            >
              <Clipboard />
            </Button>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={!state.postUrl}
              size="icon-md"
              variant="outline"
              onClick={() => window.open(state.postUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink />
            </Button>
          </TooltipTrigger>
          <TooltipContent>原始貼文</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={!state.postId}
              size="icon-md"
              variant="outline"
              onClick={actions.refresh}
            >
              <RefreshCw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重新整理</TooltipContent>
        </Tooltip>
        <Button onClick={() => actions.fetchComments(state.postUrl)}>
          <Search />
          查詢
        </Button>
      </div>

      {state.loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : state.comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <ArrowUpDown className="size-3" />
                  排序
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={state.sortBy}
                  onValueChange={(v) => actions.setSortBy(v as typeof state.sortBy)}
                >
                  <DropdownMenuRadioItem value="newest">
                    <Clock className="size-3.5" />
                    最新優先
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    <History className="size-3.5" />
                    最早優先
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="most_likes">
                    <Flame className="size-3.5" />
                    熱門優先
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted-foreground text-caption">
              共 {state.filteredComments.length} 則留言
              {state.filteredComments.length !== state.comments.length &&
                ` (全部 ${state.comments.length} 則)`}
            </span>
            <Input
              className="text-caption ml-auto h-8 max-w-48 min-w-32"
              placeholder="搜尋內容..."
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 px-2">
            {state.paginatedComments.map((c) => (
              <CommentItem key={c.id} comment={c} pageId={activePage?.id} />
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
                <ChevronLeft />
              </Button>
              <span className="text-muted-foreground text-body">
                第 {state.currentPage} / {state.totalPages} 頁
              </span>
              <Button
                disabled={state.currentPage === state.totalPages}
                size="sm"
                variant="outline"
                onClick={() => actions.setCurrentPage(state.currentPage + 1)}
              >
                <ChevronRight />
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
