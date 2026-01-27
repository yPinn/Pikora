'use client';

import { useState, useEffect } from 'react';

import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Gift,
  Filter,
  Users,
  Trophy,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Shuffle,
  Clock,
  Hash,
  AtSign,
  Loader2,
  ThumbsUp,
  ExternalLink,
  CalendarIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGiveaway } from '@/hooks/use-giveaway';
import type { FacebookComment } from '@/lib/services/facebook';
import { cn } from '@/lib/utils';

interface GiveawayPanelProps {
  comments: FacebookComment[];
  postId: string;
  postUrl?: string;
}

export function GiveawayPanel({ comments, postId, postUrl }: GiveawayPanelProps) {
  const {
    filters,
    setFilters,
    prizes,
    setPrizes,
    reactions,
    isLoadingReactions,
    hasLoadedReactions,
    fetchReactions,
    pool,
    stats,
    results,
    isDrawing,
    draw,
    redraw,
    reset,
    fetchBlacklist,
    isSaving,
    save,
  } = useGiveaway({ comments, postId, postUrl });

  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  // 當勾選「必須按讚」時，自動載入反應者
  useEffect(() => {
    if (filters.require_reaction && !hasLoadedReactions && !isLoadingReactions) {
      fetchReactions();
    }
  }, [filters.require_reaction, hasLoadedReactions, isLoadingReactions, fetchReactions]);

  // 新增獎項
  const addPrize = () => {
    setPrizes([...prizes, { name: `${prizes.length + 1} 獎`, quantity: 1 }]);
  };

  // 更新獎項
  const updatePrize = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  // 刪除獎項
  const removePrize = (index: number) => {
    if (prizes.length <= 1) return;
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  // 執行抽獎
  const handleDraw = () => {
    draw();
    setActiveTab('results');
  };

  // 儲存結果
  const handleSave = async () => {
    const id = await save();
    if (id) {
      toast.success('抽獎結果已儲存！');
    }
  };

  const totalPrizeCount = prizes.reduce((sum, p) => sum + p.quantity, 0);
  // 當要求按讚但反應資料尚未載入時，不允許抽獎
  const isWaitingForReactions = filters.require_reaction && !hasLoadedReactions;
  const canDraw = pool.length > 0 && totalPrizeCount > 0 && !isWaitingForReactions;

  return (
    <Tabs className="flex flex-col gap-4" value={activeTab} onValueChange={setActiveTab}>
      {/* Tab 切換 */}
      <TabsList className="w-fit">
        <TabsTrigger value="settings">
          <Filter className="mr-2 h-4 w-4" />
          設定
        </TabsTrigger>
        <TabsTrigger value="results">
          <Trophy className="mr-2 h-4 w-4" />
          結果
          {results.length > 0 && (
            <span className="bg-primary-foreground text-primary ml-2 rounded-full px-1.5 text-xs">
              {results.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 左欄：獎項設定 */}
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4" />
                獎項設定
              </h3>
              <Button className="h-7 px-2 text-xs" size="sm" variant="ghost" onClick={addPrize}>
                <Plus className="mr-1 h-3 w-3" />
                新增
              </Button>
            </div>

            <div className="space-y-2">
              {prizes.map((prize, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="h-8 flex-1 text-sm"
                    placeholder="獎項名稱"
                    value={prize.name}
                    onChange={(e) => updatePrize(i, 'name', e.target.value)}
                  />
                  <Input
                    className="h-8 w-16 text-sm"
                    min={1}
                    type="number"
                    value={prize.quantity}
                    onChange={(e) => updatePrize(i, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <Button
                    className="h-7 w-7"
                    disabled={prizes.length <= 1}
                    size="icon"
                    variant="ghost"
                    onClick={() => removePrize(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">共 {totalPrizeCount} 個名額</p>
          </Card>

          {/* 右欄：篩選條件 */}
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                篩選條件
              </h3>
              {filters.require_reaction && (
                <div className="flex items-center gap-2 text-xs">
                  {isLoadingReactions ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-muted-foreground">載入中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">{reactions.length} 反應</span>
                      <button className="text-primary hover:underline" onClick={fetchReactions}>
                        更新
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* 時間範圍 */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  時間範圍
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'h-8 flex-1 justify-start text-left text-sm font-normal',
                          !filters.time_start && 'text-muted-foreground'
                        )}
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                          setFilters({
                            ...filters,
                            time_start: date ? date.toISOString() : '',
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'h-8 flex-1 justify-start text-left text-sm font-normal',
                          !filters.time_end && 'text-muted-foreground'
                        )}
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                          setFilters({
                            ...filters,
                            time_end: date ? date.toISOString() : '',
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* 格式檢查 */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Hash className="h-3 w-3" />
                  留言格式（包含關鍵字）
                </Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="例如：+1 或 我要參加"
                  value={filters.pattern || ''}
                  onChange={(e) => setFilters({ ...filters, pattern: e.target.value })}
                />
              </div>

              {/* @mention 要求 */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <AtSign className="h-3 w-3" />
                  最少 Tag 人數
                </Label>
                <Input
                  className="h-8 text-sm"
                  min={0}
                  placeholder="0 = 不限制"
                  type="number"
                  value={filters.min_mentions || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, min_mentions: parseInt(e.target.value) || 0 })
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
                      setFilters({ ...filters, require_reaction: checked === true })
                    }
                  />
                  <Label
                    className="flex cursor-pointer items-center gap-1 text-sm font-normal"
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
                      setFilters({ ...filters, allow_duplicate: checked === true })
                    }
                  />
                  <Label className="cursor-pointer text-sm font-normal" htmlFor="allow_duplicate">
                    允許重複參加
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* 統計資訊 + 抽獎按鈕 */}
          <Card className="flex flex-col gap-3 p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                參與者統計
              </h3>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="grid flex-1 grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">總留言</p>
                  <p className="text-xl font-semibold tabular-nums">{stats.total_comments}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">通過篩選</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {stats.after_blacklist_filter}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {filters.allow_duplicate ? '抽獎機會' : '參與人數'}
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {filters.allow_duplicate ? (
                      <>
                        {stats.final_pool_size}
                        <span className="text-muted-foreground ml-1 text-xs font-normal">
                          ({stats.unique_users} 人)
                        </span>
                      </>
                    ) : (
                      stats.unique_users
                    )}
                  </p>
                </div>
              </div>

              <Button className="shrink-0" disabled={!canDraw || isDrawing} onClick={handleDraw}>
                {isDrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shuffle className="mr-2 h-4 w-4" />
                )}
                開始抽獎
              </Button>
            </div>

            {!canDraw && (
              <p className="text-destructive text-center text-xs">
                {isWaitingForReactions
                  ? '正在載入反應資料...'
                  : pool.length === 0
                    ? '沒有符合條件的參與者'
                    : null}
              </p>
            )}
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="results">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-medium">
              <Trophy className="h-4 w-4" />
              抽獎結果
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reset}>
                <RefreshCw className="mr-1 h-3 w-3" />
                重置
              </Button>
              <Button disabled={results.length === 0 || isSaving} size="sm" onClick={handleSave}>
                {isSaving ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3 w-3" />
                )}
                儲存
              </Button>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">尚未進行抽獎</p>
          ) : (
            <div className="space-y-4">
              {prizes.map((prize, prizeIndex) => {
                const prizeResults = results.filter((r) => r.prize_id === `prize_${prizeIndex}`);

                return (
                  <div key={prizeIndex}>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">{prize.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => redraw(`prize_${prizeIndex}`)}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        重抽
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {prizeResults.map((result, i) => (
                        <div key={i} className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.winner.from_picture_url} />
                            <AvatarFallback>{result.winner.from_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{result.winner.from_name}</p>
                            <p className="text-muted-foreground truncate text-xs">
                              {result.winner.comment_message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              {formatDistanceToNow(new Date(result.winner.comment_created_time), {
                                addSuffix: true,
                                locale: zhTW,
                              })}
                            </span>
                            {result.winner.from_profile_url && (
                              <a
                                className="text-muted-foreground hover:text-primary"
                                href={result.winner.from_profile_url}
                                rel="noopener noreferrer"
                                target="_blank"
                                title="開啟個人頁面（可手動驗證分享）"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {prizeResults.length === 0 && (
                        <p className="text-muted-foreground text-center text-xs">
                          名額不足，無法抽出
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
