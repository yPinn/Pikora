'use client';

import { useState, useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';
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
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGiveaway } from '@/hooks/use-giveaway';
import type { FacebookComment } from '@/lib/services/facebook';

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

  const [activeTab, setActiveTab] = useState<'settings' | 'results'>('settings');

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

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
      alert('抽獎結果已儲存！');
    }
  };

  const totalPrizeCount = prizes.reduce((sum, p) => sum + p.quantity, 0);
  const canDraw = pool.length > 0 && totalPrizeCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Tab 切換 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
        >
          <Filter className="mr-2 h-4 w-4" />
          設定
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
        >
          <Trophy className="mr-2 h-4 w-4" />
          結果
          {results.length > 0 && (
            <span className="bg-primary-foreground text-primary ml-2 rounded-full px-1.5 text-xs">
              {results.length}
            </span>
          )}
        </Button>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 左欄：獎項設定 */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-medium">
                <Gift className="h-4 w-4" />
                獎項設定
              </h3>
              <Button size="sm" variant="ghost" onClick={addPrize}>
                <Plus className="mr-1 h-3 w-3" />
                新增
              </Button>
            </div>

            <div className="space-y-2">
              {prizes.map((prize, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="獎項名稱"
                    value={prize.name}
                    onChange={(e) => updatePrize(i, 'name', e.target.value)}
                  />
                  <Input
                    className="w-20"
                    min={1}
                    type="number"
                    value={prize.quantity}
                    onChange={(e) => updatePrize(i, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <Button
                    disabled={prizes.length <= 1}
                    size="icon"
                    variant="ghost"
                    onClick={() => removePrize(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mt-3 text-xs">共 {totalPrizeCount} 個名額</p>
          </Card>

          {/* 右欄：篩選條件 */}
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Filter className="h-4 w-4" />
              篩選條件
            </h3>

            <div className="space-y-4">
              {/* 時間範圍 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  時間範圍
                </Label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="開始"
                    type="datetime-local"
                    value={filters.time_start || ''}
                    onChange={(e) => setFilters({ ...filters, time_start: e.target.value })}
                  />
                  <Input
                    className="flex-1"
                    placeholder="結束"
                    type="datetime-local"
                    value={filters.time_end || ''}
                    onChange={(e) => setFilters({ ...filters, time_end: e.target.value })}
                  />
                </div>
              </div>

              {/* 格式檢查 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <Hash className="h-3 w-3" />
                  留言格式 (包含關鍵字)
                </Label>
                <Input
                  placeholder="例如：+1 或 我要參加"
                  value={filters.pattern || ''}
                  onChange={(e) => setFilters({ ...filters, pattern: e.target.value })}
                />
              </div>

              {/* @mention 要求 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs">
                  <AtSign className="h-3 w-3" />
                  最少 Tag 人數
                </Label>
                <Input
                  min={0}
                  placeholder="0 = 不限制"
                  type="number"
                  value={filters.min_mentions || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, min_mentions: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              {/* 重複參加 */}
              <div className="flex items-center gap-2">
                <input
                  checked={filters.allow_duplicate || false}
                  className="h-4 w-4"
                  id="allow-duplicate"
                  type="checkbox"
                  onChange={(e) => setFilters({ ...filters, allow_duplicate: e.target.checked })}
                />
                <Label className="text-sm" htmlFor="allow-duplicate">
                  允許同一人多次參加（每則留言算一次機會）
                </Label>
              </div>
            </div>
          </Card>

          {/* 統計資訊 */}
          <Card className="p-4 lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Users className="h-4 w-4" />
              參與者統計
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">總留言數</p>
                <p className="text-lg font-semibold">{stats.total_comments}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">符合條件</p>
                <p className="text-lg font-semibold">{stats.after_blacklist_filter}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">抽獎池大小</p>
                <p className="text-lg font-semibold">{stats.final_pool_size}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">不重複用戶</p>
                <p className="text-lg font-semibold">{stats.unique_users}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" disabled={!canDraw || isDrawing} onClick={handleDraw}>
                {isDrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shuffle className="mr-2 h-4 w-4" />
                )}
                開始抽獎
              </Button>
            </div>

            {!canDraw && pool.length === 0 && (
              <p className="text-destructive mt-2 text-center text-xs">沒有符合條件的參與者</p>
            )}
          </Card>
        </div>
      ) : (
        /* 結果頁 */
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
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(result.winner.comment_created_time), {
                              addSuffix: true,
                              locale: zhTW,
                            })}
                          </span>
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
      )}
    </div>
  );
}
