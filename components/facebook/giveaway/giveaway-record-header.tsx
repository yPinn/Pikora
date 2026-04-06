'use client';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronRight, Gift, Users } from 'lucide-react';

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
    <div className="flex items-center gap-3 px-4 py-3">
      <CollapsibleTrigger asChild>
        <button className="hover:bg-muted/50 active:bg-muted focus-visible:ring-ring/50 -mx-2 -my-1 flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-left outline-none focus-visible:ring-[3px]">
          <div className="text-muted-foreground shrink-0">
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{record.name || '未命名抽獎'}</span>
              <span className="text-muted-foreground text-caption font-mono">
                #{record.id.slice(-6)}
              </span>
              {badges}
            </div>

            <div className="text-muted-foreground text-caption mt-1 flex flex-wrap items-center gap-3">
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
        </button>
      </CollapsibleTrigger>

      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}
