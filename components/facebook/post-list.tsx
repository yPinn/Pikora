'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import Image from 'next/image';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Share2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
  Images,
  Copy,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPosts } from '@/hooks/use-facebook-posts';
import type { FacebookPost } from '@/lib/services/facebook';

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

// 單一貼文卡片元件
function PostCard({ post }: { post: FacebookPost }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = getMediaImages(post);
  const hasMultipleImages = images.length > 1;
  const isVideo = isVideoPost(post);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    },
    [images.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    },
    [images.length]
  );

  // 處理卡片點擊：Ctrl+點擊跳轉，單擊複製 URL
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Ctrl/Cmd + 點擊：在新視窗開啟貼文
      if (e.ctrlKey || e.metaKey) {
        window.open(post.permalink_url, '_blank', 'noopener,noreferrer');
        return;
      }

      // 單擊：複製 URL 並存入 sessionStorage
      e.preventDefault();

      // 存入 sessionStorage 供其他頁面使用
      sessionStorage.setItem(SELECTED_POST_URL_KEY, post.permalink_url || '');
      sessionStorage.setItem(SELECTED_POST_ID_KEY, post.id);

      // 複製到剪貼簿
      navigator.clipboard.writeText(post.permalink_url || '').then(() => {
        toast.success('已複製 URL');
      });
    },
    [post.permalink_url, post.id]
  );

  return (
    <div
      key={post.id}
      className="group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-sm"
      role="button"
      tabIndex={0}
      title="點擊複製 URL｜Ctrl+點擊開啟貼文"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* 圖片顯示 */}
      {images.length > 0 ? (
        <Image
          fill
          alt="fb"
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 33vw, 300px"
          src={images[currentIndex]}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <FileText className="text-muted-foreground h-6 w-6" />
        </div>
      )}

      {/* 影片播放圖示 */}
      {isVideo && (
        <div className="absolute top-2 left-2 rounded-full bg-black/60 p-1.5">
          <Play className="h-3 w-3 fill-white text-white" />
        </div>
      )}

      {/* 多圖標示（右上角） */}
      {hasMultipleImages && !isVideo && (
        <div className="absolute top-2 right-2 rounded-full bg-black/60 p-2">
          <Images className="h-5 w-5 text-white" />
        </div>
      )}

      {/* 左右換頁按鈕（多圖時顯示） */}
      {hasMultipleImages && (
        <>
          <button
            aria-label="上一張"
            className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            type="button"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="下一張"
            className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            type="button"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* 圖片指示點 */}
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Hover 時顯示互動數據 */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-3 text-[10px]">
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
        <time className="mt-1 text-[9px] opacity-80">
          {formatDistanceToNow(new Date(post.created_time), { addSuffix: true, locale: zhTW })}
        </time>
      </div>

      {/* 左下角複製圖示提示 */}
      <div className="absolute bottom-2 left-2 z-20 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Copy className="h-3 w-3" />
      </div>
    </div>
  );
}

export function PostList() {
  const { posts, isLoading, isLoadingMore, hasMore, loadMore } = useFacebookPosts({ limit: 12 });
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer 自動載入更多
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoading) {
    return (
      <div className="border-border/50 bg-muted/30 grid grid-cols-4 gap-2 rounded-lg border p-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    );
  }

  if (posts.length === 0)
    return <p className="text-muted-foreground py-10 text-center text-sm">目前沒有貼文</p>;

  return (
    <div className="space-y-2">
      <div className="border-border/50 bg-muted/30 grid grid-cols-4 gap-2 rounded-lg border p-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* 滾動觸發區域 */}
      {hasMore && (
        <div ref={loaderRef} className="flex items-center justify-center py-4">
          {isLoadingMore && <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />}
        </div>
      )}
    </div>
  );
}
