'use client';

import { useMemo, useState } from 'react';

import { Ban, Loader2, Shuffle, Users } from 'lucide-react';
import { toast } from 'sonner';

import { PersonRow } from '@/components/common/person-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BlacklistEntry, DrawEntry, FilterStats, GiveawayFilters } from '@/lib/giveaway';

import { CardSectionHeader } from './card-section-header';
import { FacebookAvatar } from './facebook-avatar';

interface StatsDrawCardProps {
  stats: FilterStats;
  filters: GiveawayFilters;
  pool: DrawEntry[];
  pageId?: string;
  canDraw: boolean;
  isDrawing: boolean;
  isWaitingForReactions: boolean;
  onDraw: () => void;
  onAddToBlacklist: (entry: BlacklistEntry) => Promise<void>;
}

export function StatsDrawCard({
  stats,
  filters,
  pool,
  pageId,
  canDraw,
  isDrawing,
  isWaitingForReactions,
  onDraw,
  onAddToBlacklist,
}: StatsDrawCardProps) {
  const [poolSearch, setPoolSearch] = useState('');

  const poolUsers = useMemo(() => {
    const userMap = new Map<string, { entry: DrawEntry; count: number }>();
    pool.forEach((entry) => {
      const existing = userMap.get(entry.from_id);
      if (!existing) {
        userMap.set(entry.from_id, { entry, count: 1 });
      } else {
        existing.count++;
      }
    });
    return Array.from(userMap.values());
  }, [pool]);

  const filteredPoolUsers = useMemo(() => {
    if (!poolSearch) return poolUsers;
    const q = poolSearch.toLowerCase();
    return poolUsers.filter(({ entry }) => entry.from_name.toLowerCase().includes(q));
  }, [poolUsers, poolSearch]);

  return (
    <Card className="flex flex-col gap-3 p-4 lg:col-span-2">
      <CardSectionHeader
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={pool.length === 0} size="sm" variant="outline">
                <Users className="h-3 w-3" />
                查看獎池
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] max-w-lg flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle>
                  獎池人選 ({stats.unique_users} 人
                  {filters.allow_duplicate && `, ${stats.final_pool_size} 次機會`})
                </DialogTitle>
                <DialogDescription className="sr-only">
                  符合篩選條件的抽獎參加者名單
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-1 flex-col gap-3 overflow-hidden">
                <Input
                  className="h-10"
                  placeholder="搜尋姓名或留言..."
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                />
                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-2 pr-4">
                    {filteredPoolUsers.length === 0 ? (
                      <p className="text-muted-foreground text-body py-4 text-center">
                        {poolSearch ? '找不到符合的人選' : '獎池為空'}
                      </p>
                    ) : (
                      filteredPoolUsers.map(({ entry, count }) => (
                        <PersonRow
                          key={entry.from_id}
                          actions={
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => {
                                void onAddToBlacklist({
                                  from_id: entry.from_id,
                                  from_name: entry.from_name,
                                });
                                toast.success(`已將 ${entry.from_name} 加入黑名單`);
                              }}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          }
                          avatar={
                            <FacebookAvatar
                              name={entry.from_name}
                              pageId={pageId}
                              userId={entry.from_id}
                            />
                          }
                          name={
                            <p className="text-body font-medium">
                              {entry.from_name}
                              {count > 1 && (
                                <span className="text-muted-foreground text-caption ml-1 font-normal">
                                  ({count} {filters.allow_duplicate ? '次機會' : '則留言'})
                                </span>
                              )}
                            </p>
                          }
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        }
        icon={Users}
        title="參與者統計"
      />

      <div className="flex items-end justify-between gap-4">
        <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-4">
          <div>
            <p className="text-muted-foreground text-caption">總留言</p>
            <p className="text-xl font-semibold tabular-nums">{stats.total_comments}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-caption">通過篩選</p>
            <p className="text-xl font-semibold tabular-nums">{stats.after_blacklist_filter}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-caption">
              {filters.allow_duplicate ? '抽獎機會' : '參與人數'}
            </p>
            <p className="text-xl font-semibold tabular-nums">
              {filters.allow_duplicate ? (
                <>
                  {stats.final_pool_size}
                  <span className="text-muted-foreground text-caption ml-1 font-normal">
                    ({stats.unique_users} 人)
                  </span>
                </>
              ) : (
                stats.unique_users
              )}
            </p>
          </div>
        </div>

        <Button className="shrink-0" disabled={!canDraw || isDrawing} onClick={onDraw}>
          {isDrawing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          開始抽獎
        </Button>
      </div>

      {!canDraw && (
        <p className="text-destructive text-caption text-center">
          {isWaitingForReactions
            ? '正在載入反應資料...'
            : pool.length === 0
              ? '沒有符合條件的參與者'
              : null}
        </p>
      )}
    </Card>
  );
}
