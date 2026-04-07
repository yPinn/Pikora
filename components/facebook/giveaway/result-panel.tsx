'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Loader2, RefreshCw, Save, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SaveMode } from '@/hooks/use-giveaway';
import type { BlacklistEntry, DrawResult, PrizeInput } from '@/lib/giveaway';

import { WinnerCard } from './winner-card';

interface ResultPanelProps {
  results: DrawResult[];
  prizes: PrizeInput[];
  pageId?: string;
  postUrl?: string;
  giveawayName: string;
  isSaving: boolean;
  isSaved: boolean;
  saveMode: SaveMode;
  onDraw: () => void;
  onRedraw: (prizeId: string) => void;
  onSave: () => void;
  onGiveawayNameChange: (name: string) => void;
  onAddToBlacklist: (entry: BlacklistEntry) => Promise<void>;
}

export function ResultPanel({
  results,
  prizes,
  pageId,
  postUrl,
  giveawayName,
  isSaving,
  isSaved,
  saveMode,
  onDraw,
  onRedraw,
  onSave,
  onGiveawayNameChange,
  onAddToBlacklist,
}: ResultPanelProps) {
  const [resultsRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-body flex items-center gap-2 font-medium">
          <Trophy className="h-4 w-4" />
          抽獎結果
        </h3>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onDraw}>
                <RefreshCw data-icon="inline-start" />
                再抽一輪
              </Button>
            </TooltipTrigger>
            <TooltipContent>重新隨機抽出所有獎項，儲存後將建立全新紀錄</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={results.length === 0 || isSaving || isSaved}
                size="sm"
                variant={isSaved ? 'secondary' : saveMode === 'replace' ? 'outline' : 'default'}
                onClick={onSave}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {isSaved ? '已儲存' : saveMode === 'replace' ? '更新紀錄' : '儲存'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {saveMode === 'replace' ? '局部重抽後儲存將取代現有紀錄' : '儲存為新紀錄'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Label className="text-caption text-muted-foreground shrink-0" htmlFor="giveaway-name">
            活動名稱
          </Label>
          <Input
            className="h-8 text-sm"
            id="giveaway-name"
            maxLength={200}
            placeholder="未命名抽獎"
            value={giveawayName}
            onChange={(e) => onGiveawayNameChange(e.target.value)}
          />
        </div>
      )}

      {results.length === 0 ? (
        <p className="text-muted-foreground text-body py-8 text-center">尚未進行抽獎</p>
      ) : (
        <div ref={resultsRef} className="flex flex-col gap-4">
          {prizes.map((prize) => {
            const prizeResults = results.filter((r) => r.prize_id === prize.id);

            return (
              <div key={prize.id}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-body flex items-center gap-2 font-medium">
                    {prize.name}
                    <span className="text-muted-foreground text-caption font-normal">
                      {prizeResults.length}/{prize.quantity} 名
                    </span>
                    {prizeResults.length < prize.quantity && (
                      <Badge className="bg-warning/15 text-warning border-0">
                        {prize.quantity - prizeResults.length} 空缺
                      </Badge>
                    )}
                  </h4>
                  <Button size="sm" variant="ghost" onClick={() => onRedraw(prize.id)}>
                    <RefreshCw data-icon="inline-start" />
                    重抽
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {prizeResults.map((result, i) => (
                    <WinnerCard
                      key={result.winner.comment_id}
                      index={i}
                      pageId={pageId}
                      postUrl={postUrl}
                      result={result}
                      onAddToBlacklist={(entry) => {
                        void onAddToBlacklist(entry);
                        toast.success(`已將 ${entry.from_name} 加入黑名單`);
                      }}
                    />
                  ))}

                  {Array.from({ length: prize.quantity - prizeResults.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="border-muted-foreground/20 text-muted-foreground flex items-center gap-3 rounded-lg border border-dashed px-3 py-2"
                    >
                      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                        <Users className="h-4 w-4 opacity-40" />
                      </div>
                      <p className="text-caption">空缺 #{prizeResults.length + i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
