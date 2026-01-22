'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, FileText } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useFacebookPage } from '@/contexts/facebook-page-store';
import type { FacebookPost } from '@/lib/services/facebook';

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
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    );
  }

  if (posts.length === 0)
    return <p className="text-muted-foreground py-10 text-center text-sm">目前沒有貼文</p>;

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <a
          key={post.id}
          className="group bg-muted relative aspect-square overflow-hidden rounded-sm"
          href={post.permalink_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {post.full_picture ? (
            <Image
              fill
              alt="fb"
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 300px"
              src={post.full_picture}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="text-muted-foreground h-6 w-6" />
            </div>
          )}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
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
      ))}
    </div>
  );
}
