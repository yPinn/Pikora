'use client';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Ban } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ANIM, cardReveal } from '@/lib/animation';
import type { DrawResult } from '@/lib/giveaway';
import { isFacebookProfileUrl } from '@/lib/utils/facebook';

import { CommentLink } from './comment-link';
import { FacebookAvatar } from './facebook-avatar';

interface WinnerCardProps {
  result: DrawResult;
  index: number;
  pageId?: string;
  postUrl?: string;
  onAddToBlacklist: (entry: { from_id: string; from_name: string }) => void;
}

export function WinnerCard({ result, index, pageId, postUrl, onAddToBlacklist }: WinnerCardProps) {
  const { winner } = result;
  const hasProfileUrl = isFacebookProfileUrl(winner.from_profile_url);

  const avatar = (
    <FacebookAvatar name={winner.from_name} pageId={pageId} size="md" userId={winner.from_id} />
  );

  return (
    <motion.div
      animate={cardReveal.animate}
      className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2"
      exit={cardReveal.exit}
      initial={cardReveal.initial}
      transition={{ duration: ANIM.normal, delay: index * ANIM.staggerDelay, ease: ANIM.ease }}
    >
      {hasProfileUrl ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={winner.from_profile_url} rel="noopener noreferrer" target="_blank">
              {avatar}
            </a>
          </TooltipTrigger>
          <TooltipContent>查看個人頁面</TooltipContent>
        </Tooltip>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        {hasProfileUrl ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="hover:text-primary font-medium hover:underline"
                href={winner.from_profile_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {winner.from_name}
              </a>
            </TooltipTrigger>
            <TooltipContent>查看個人頁面</TooltipContent>
          </Tooltip>
        ) : (
          <p className="font-medium">{winner.from_name}</p>
        )}
        <p className="text-muted-foreground text-caption truncate">{winner.comment_message}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-caption">
          {formatDistanceToNow(new Date(winner.comment_created_time), {
            addSuffix: true,
            locale: zhTW,
          })}
        </span>
        {postUrl && <CommentLink commentId={winner.comment_id} postUrl={postUrl} />}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                onAddToBlacklist({ from_id: winner.from_id, from_name: winner.from_name })
              }
            >
              <Ban />
            </Button>
          </TooltipTrigger>
          <TooltipContent>加入黑名單</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
