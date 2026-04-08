'use client';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { type LucideIcon, AtSign, Clock, Filter, Hash, ThumbsUp } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { GiveawayFilters } from '@/lib/giveaway';
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
}

export function FilterSetupCard({ filters, onChangeFilters }: FilterSetupCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardSectionHeader icon={Filter} title="篩選條件" />

      <div className="flex flex-col gap-3">
        {/* 時間範圍 + Tag 人數同行 */}
        <div className="flex gap-2">
          {/* 時間範圍 */}
          <div className="flex flex-1 flex-col gap-1.5">
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
                    {filters.time_end
                      ? format(new Date(filters.time_end), 'yyyy/MM/dd')
                      : '結束日期'}
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

          {/* 最少 Tag 人數 — API 不回傳 message_tags，無法判斷 */}
          <div className="flex w-20 flex-col gap-1.5 opacity-40">
            <FilterLabel icon={AtSign}>Tag</FilterLabel>
            <Input
              readOnly
              className="text-body h-10 w-20 cursor-not-allowed"
              placeholder="—"
              title="匿名模式不支援"
              type="text"
              value=""
            />
          </div>
        </div>

        {/* 格式檢查 */}
        <div className="flex flex-col gap-1.5">
          <FilterLabel icon={Hash}>留言格式（包含關鍵字）</FilterLabel>
          <Input
            className="text-body h-10"
            placeholder="例如：+1 或 我要參加"
            value={filters.pattern || ''}
            onChange={(e) => onChangeFilters({ ...filters, pattern: e.target.value })}
          />
        </div>

        {/* Checkboxes — 以下功能需要身份識別，匿名模式下不支援 */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2 opacity-40">
            <Checkbox disabled id="require_reaction" />
            <Label
              className="text-body flex cursor-not-allowed items-center gap-1 font-normal"
              htmlFor="require_reaction"
            >
              <ThumbsUp className="h-3 w-3" />
              必須按讚/反應
              <span className="text-caption text-muted-foreground">（匿名模式不支援）</span>
            </Label>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <Checkbox disabled id="allow_duplicate" />
            <Label className="text-body cursor-not-allowed font-normal" htmlFor="allow_duplicate">
              允許重複參加
              <span className="text-caption text-muted-foreground ml-1">（匿名模式不支援）</span>
            </Label>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <Checkbox disabled id="allow_multi_win" />
            <Label className="text-body cursor-not-allowed font-normal" htmlFor="allow_multi_win">
              允許重複得獎
              <span className="text-caption text-muted-foreground ml-1">（匿名模式不支援）</span>
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
}
