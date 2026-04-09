'use client';

import Image from 'next/image';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronRight, Gift, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import type { GiveawayRecord } from '@/hooks/use-giveaway-history';

interface GiveawayRecordHeaderProps {
  record: GiveawayRecord;
  isOpen: boolean;
  /** Badge elements rendered after name + id — e.g. status badge, notification badge */
  badges?: React.ReactNode;
  /** Icon-button actions on the right side */
  actions?: React.ReactNode;
  /** Override displayed winner count (default: record.winners.length) */
  winnerCount?: number;
}

export function GiveawayRecordHeader({
  record,
  isOpen,
  badges,
  actions,
  winnerCount,
}: GiveawayRecordHeaderProps) {
  const displayWinnerCount = winnerCount ?? record.winners.length;

  return (
    <div className="flex items-stretch gap-4">
      {record.post_image && (
        <div className="ring-border relative my-4 ml-4 size-24 shrink-0 self-center overflow-hidden rounded-lg ring-1">
          <Image fill unoptimized alt="" className="object-cover" src={record.post_image} />
        </div>
      )}

      <CollapsibleTrigger asChild>
        <Button
          className="flex h-auto min-w-0 flex-1 items-center justify-start gap-3 px-2 py-4 text-left hover:bg-transparent"
          variant="ghost"
        >
          <div className="text-muted-foreground shrink-0">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{record.name || '未命名抽獎'}</span>
              <span className="text-muted-foreground text-caption font-mono">
                #{record.id.slice(-6)}
              </span>
              {badges}
            </div>

            <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3 text-sm select-none">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
              </span>
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {record.prizes.length} 個獎項
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {displayWinnerCount} 位中獎者
              </span>
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>

      {actions && <div className="flex items-center gap-1 self-center pr-4">{actions}</div>}
    </div>
  );
}
