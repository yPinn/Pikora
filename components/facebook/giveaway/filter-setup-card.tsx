'use client';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { type LucideIcon, AtSign, Clock, Filter, Hash, Loader2, ThumbsUp } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { GiveawayFilters } from '@/lib/giveaway';
import type { FacebookReaction } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';

import { CardSectionHeader } from './card-section-header';

// file-local label with icon
function FilterLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <Label className="text-muted-foreground text-caption flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {children}
    </Label>
  );
}

interface FilterSetupCardProps {
  filters: GiveawayFilters;
  onChangeFilters: (filters: GiveawayFilters) => void;
  reactions: FacebookReaction[];
  isLoadingReactions: boolean;
  fetchReactions: () => void;
}

export function FilterSetupCard({
  filters,
  onChangeFilters,
  reactions,
  isLoadingReactions,
  fetchReactions,
}: FilterSetupCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardSectionHeader
        action={
          filters.require_reaction ? (
            <div className="text-caption flex items-center gap-2">
              {isLoadingReactions ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-muted-foreground">載入中...</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">{reactions.length} 反應</span>
                  <button
                    className="text-primary min-h-8 px-1 hover:underline"
                    onClick={fetchReactions}
                  >
                    更新
                  </button>
                </>
              )}
            </div>
          ) : undefined
        }
        icon={Filter}
        title="篩選條件"
      />

      <div className="space-y-3">
        {/* 時間範圍 */}
        <div className="space-y-1.5">
          <FilterLabel icon={Clock}>時間範圍</FilterLabel>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'text-body h-10 flex-1 justify-start text-left font-normal',
                    !filters.time_start && 'text-muted-foreground'
                  )}
                  variant="outline"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {filters.time_start
                    ? format(new Date(filters.time_start), 'yyyy/MM/dd')
                    : '開始日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  locale={zhTW}
                  mode="single"
                  selected={filters.time_start ? new Date(filters.time_start) : undefined}
                  onSelect={(date) =>
                    onChangeFilters({ ...filters, time_start: date ? date.toISOString() : '' })
                  }
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'text-body h-10 flex-1 justify-start text-left font-normal',
                    !filters.time_end && 'text-muted-foreground'
                  )}
                  variant="outline"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {filters.time_end ? format(new Date(filters.time_end), 'yyyy/MM/dd') : '結束日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  locale={zhTW}
                  mode="single"
                  selected={filters.time_end ? new Date(filters.time_end) : undefined}
                  onSelect={(date) =>
                    onChangeFilters({ ...filters, time_end: date ? date.toISOString() : '' })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 格式檢查 */}
        <div className="space-y-1.5">
          <FilterLabel icon={Hash}>留言格式（包含關鍵字）</FilterLabel>
          <Input
            className="text-body h-10"
            placeholder="例如：+1 或 我要參加"
            value={filters.pattern || ''}
            onChange={(e) => onChangeFilters({ ...filters, pattern: e.target.value })}
          />
        </div>

        {/* @mention 要求 */}
        <div className="space-y-1.5">
          <FilterLabel icon={AtSign}>最少 Tag 人數</FilterLabel>
          <Input
            className="text-body h-10"
            min={0}
            placeholder="0 = 不限制"
            type="number"
            value={filters.min_mentions || ''}
            onChange={(e) =>
              onChangeFilters({ ...filters, min_mentions: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={filters.require_reaction || false}
              id="require_reaction"
              onCheckedChange={(checked) =>
                onChangeFilters({ ...filters, require_reaction: checked === true })
              }
            />
            <Label
              className="text-body flex cursor-pointer items-center gap-1 font-normal"
              htmlFor="require_reaction"
            >
              <ThumbsUp className="h-3 w-3" />
              必須按讚/反應
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={filters.allow_duplicate || false}
              id="allow_duplicate"
              onCheckedChange={(checked) =>
                onChangeFilters({ ...filters, allow_duplicate: checked === true })
              }
            />
            <Label className="text-body cursor-pointer font-normal" htmlFor="allow_duplicate">
              允許重複參加
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={filters.allow_multi_win || false}
              id="allow_multi_win"
              onCheckedChange={(checked) =>
                onChangeFilters({ ...filters, allow_multi_win: checked === true })
              }
            />
            <Label className="text-body cursor-pointer font-normal" htmlFor="allow_multi_win">
              允許重複得獎
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
}
