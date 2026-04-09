'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import Image from 'next/image';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Images,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import { useFacebookPosts } from '@/hooks/use-facebook-posts';
import { ANIM, scaleInItem, staggerContainer } from '@/lib/animation';
import type { FacebookPost } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';
import momonga2 from '@/public/images/Momonga_2.jpg';

// 從貼文中提取所有媒體圖片
function getMediaImages(post: FacebookPost): string[] {
  const images: string[] = [];

  // 檢查 attachments 中的 subattachments（多圖貼文）
  const attachment = post.attachments?.data?.[0];
  if (attachment?.subattachments?.data) {
    for (const sub of attachment.subattachments.data) {
      if (sub.media?.image?.src) {
        images.push(sub.media.image.src);
      }
    }
  }

  // 如果沒有 subattachments，使用 full_picture
  if (images.length === 0 && post.full_picture) {
    images.push(post.full_picture);
  }

  return images;
}

// 判斷貼文是否為影片類型
function isVideoPost(post: FacebookPost): boolean {
  const attachment = post.attachments?.data?.[0];
  if (!attachment) return false;

  return (
    attachment.type === 'video_inline' ||
    attachment.type === 'video_autoplay' ||
    attachment.media_type === 'video'
  );
}

// Session storage key for selected post
export const SELECTED_POST_URL_KEY = 'pikora_selected_post_url';
export const SELECTED_POST_ID_KEY = 'pikora_selected_post_id';
export const SELECTED_POST_MESSAGE_KEY = 'pikora_selected_post_message';

// 單一貼文卡片元件
function PostCard({
  post,
  priority = false,
  isSelected = false,
  onSelect,
}: {
  post: FacebookPost;
  priority?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const images = getMediaImages(post);
  const hasMultipleImages = images.length > 1;
  const isVideo = isVideoPost(post);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
    },
    [images.length]
  );

  // 選取貼文：複製 URL 並存入 sessionStorage
  const selectPost = useCallback(() => {
    sessionStorage.setItem(SELECTED_POST_URL_KEY, post.permalink_url || '');
    sessionStorage.setItem(SELECTED_POST_ID_KEY, post.id);
    sessionStorage.setItem(SELECTED_POST_MESSAGE_KEY, post.message?.slice(0, 50) || '');
    onSelect?.(post.id);
    navigator.clipboard.writeText(post.permalink_url || '').then(() => {
      toast.success('已複製 URL');
    });
  }, [post.permalink_url, post.id, post.message, onSelect]);

  // 處理卡片點擊：Ctrl+點擊跳轉，單擊選取
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        window.open(post.permalink_url, '_blank', 'noopener,noreferrer');
        return;
      }
      e.preventDefault();
      selectPost();
    },
    [post.permalink_url, selectPost]
  );

  return (
    <motion.div
      className={cn(
        'group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-sm',
        isSelected && 'ring-primary ring-2 ring-offset-1'
      )}
      role="button"
      tabIndex={0}
      variants={scaleInItem}
      whileTap={{ scale: ANIM.scale.tap }}
      onBlur={() => setShowOverlay(false)}
      onClick={handleCardClick}
      onFocus={() => setShowOverlay(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPost();
        }
      }}
      onPointerEnter={() => setShowOverlay(true)}
      onPointerLeave={() => setShowOverlay(false)}
    >
      {/* 圖片顯示：所有圖片同時 render，CSS 控制顯示，避免換頁時才發請求 */}
      {images.length > 0 ? (
        <div className="absolute inset-0">
          {images.map((src, idx) => (
            <motion.div
              key={src}
              animate={{ opacity: idx === currentIndex ? 1 : 0 }}
              className="absolute inset-0"
              initial={false}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Image
                fill
                alt={idx === 0 && post.message ? post.message.slice(0, 60) : ''}
                className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                loading={priority && idx === 0 ? 'eager' : 'lazy'}
                priority={priority && idx === 0}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                src={src}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="relative h-full overflow-hidden">
          {/* 背景圖片（模糊+低對比） */}
          <Image
            fill
            priority
            alt=""
            className="object-cover opacity-75 blur-[2px] saturate-0 dark:opacity-75"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            src={momonga2}
          />
          {/* 覆蓋層 */}
          <div className="absolute inset-0 bg-linear-to-br from-slate-200/70 to-slate-300/70 dark:from-slate-800/80 dark:to-slate-900/80" />
        </div>
      )}

      {/* 影片播放圖示 */}
      {isVideo && (
        <div className="absolute top-2 left-2 z-20 flex size-9 items-center justify-center rounded-full border border-white/40 bg-black/50">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      )}

      {/* 多圖標示（右上角） */}
      {hasMultipleImages && !isVideo && (
        <div className="absolute top-2 right-2 z-20 flex size-9 items-center justify-center rounded-full border border-white/40 bg-black/50">
          <Images className="h-4 w-4 text-white" />
        </div>
      )}

      {/* 左右換頁按鈕（多圖時顯示，首/末圖隱藏對應方向） */}
      {hasMultipleImages && currentIndex > 0 && (
        <Button
          aria-label="上一張"
          className={cn(
            'absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/50 text-white transition-opacity hover:bg-black/70 hover:text-white motion-reduce:transition-none',
            showOverlay ? 'opacity-100' : 'opacity-0'
          )}
          size="icon-sm"
          variant="ghost"
          onClick={handlePrev}
          onPointerDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {hasMultipleImages && currentIndex < images.length - 1 && (
        <Button
          aria-label="下一張"
          className={cn(
            'absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/50 text-white transition-opacity hover:bg-black/70 hover:text-white motion-reduce:transition-none',
            showOverlay ? 'opacity-100' : 'opacity-0'
          )}
          size="icon-sm"
          variant="ghost"
          onClick={handleNext}
          onPointerDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* 圖片指示點 */}
      {hasMultipleImages && (
        <div
          className={cn(
            'absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1 transition-opacity motion-reduce:transition-none',
            showOverlay ? 'opacity-100' : 'opacity-0'
          )}
        >
          {images.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                idx === currentIndex ? 'bg-white' : 'bg-white/50'
              )}
            />
          ))}
        </div>
      )}

      {/* Hover / Focus / Touch 時顯示互動數據與文字預覽 */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/50 to-transparent p-2 text-white transition-opacity motion-reduce:transition-none',
          showOverlay ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* 貼文文字預覽 */}
        {post.message && (
          <p className="text-caption mb-1.5 line-clamp-2 leading-tight opacity-90">
            {post.message}
          </p>
        )}
        <div className="text-caption flex gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 fill-white" />
            {post.reactions?.summary?.total_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3 fill-white" />
            {post.comments?.summary?.total_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {post.shares?.count || 0}
          </span>
        </div>
        <time className="text-caption mt-1 opacity-80">
          {formatDistanceToNow(new Date(post.created_time), { addSuffix: true, locale: zhTW })}
        </time>
      </div>

      {/* 右下角：開啟原始貼文 */}
      {post.permalink_url && (
        <a
          aria-label="開啟原始貼文"
          className={cn(
            'absolute right-2 bottom-2 z-20 flex size-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white transition-opacity motion-reduce:transition-none',
            showOverlay ? 'opacity-100' : 'opacity-0'
          )}
          href={post.permalink_url}
          rel="noopener noreferrer"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </motion.div>
  );
}

export function PostList() {
  const { activePage } = useFacebookPage();
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, error, refetch } = useFacebookPosts({
    limit: 12,
  });
  const loaderRef = useRef<HTMLDivElement>(null);
  // stable ref：避免 loadMore 參考變動時不必要地重建 IntersectionObserver
  const loadMoreRef = useRef(loadMore);
  useLayoutEffect(() => {
    loadMoreRef.current = loadMore;
  });

  // 追蹤目前選取的貼文 ID，供卡片顯示 ring 樣式
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SELECTED_POST_ID_KEY);
  });

  // Intersection Observer 自動載入更多
  // 依賴 isLoading：初始載入時 loaderRef.current 為 null（顯示骨架），
  // 等 isLoading 變 false 後 div 才出現，此時重跑 effect 才能 observe
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  if (isLoading) {
    return (
      <div className="border-border/50 bg-muted/30 grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    );
  }

  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-muted-foreground text-body">{error}</p>
        <Button variant="link" onClick={refetch}>
          重試
        </Button>
      </div>
    );

  if (!activePage)
    return <p className="text-muted-foreground text-body py-10 text-center">尚未選取粉絲專頁</p>;

  if (posts.length === 0)
    return <p className="text-muted-foreground text-body py-10 text-center">目前沒有貼文</p>;

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        animate="show"
        className="border-border/50 bg-muted/30 grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-3 lg:grid-cols-4"
        initial="hidden"
        variants={staggerContainer}
      >
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            isSelected={selectedPostId === post.id}
            post={post}
            priority={index < 2}
            onSelect={setSelectedPostId}
          />
        ))}
      </motion.div>

      {/* 滾動觸發區域 */}
      {hasMore && (
        <div ref={loaderRef} className="flex items-center justify-center py-4">
          {isLoadingMore && <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />}
        </div>
      )}
    </div>
  );
}
