'use client';

import { useEffect, useState, useCallback } from 'react';

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
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
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

  return (
    <a
      key={post.id}
      className="group bg-muted relative aspect-square overflow-hidden rounded-sm"
      href={post.permalink_url}
      rel="noopener noreferrer"
      target="_blank"
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
    </a>
  );
}

export function PostList() {
  const { activePage, isReady } = useFacebookPage();
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // 只有在掛載完成且有專頁 ID 和 Token 時才執行
    if (!isReady || !activePage?.id || !activePage?.access_token) return;

    const controller = new AbortController();
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/facebook/posts?pageId=${activePage?.id}&limit=12`, {
          headers: { Authorization: `Bearer ${activePage?.access_token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        setPosts(data.data || []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error(err);
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }

    fetchPosts();
    return () => controller.abort();
  }, [activePage?.id, activePage?.access_token, isReady]);

  if (!isReady || loading || !hasFetched) {
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
    <div className="border-border/50 bg-muted/30 grid grid-cols-4 gap-2 rounded-lg border p-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
