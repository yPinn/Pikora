'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

/** 從貼文訊息中智能抓取活動名稱（優先斷句，最多 50 字）*/
function smartTruncateName(text: string): string {
  if (!text) return '';
  const firstLine = text.split('\n').find((l) => l.trim()) ?? text;
  if (firstLine.length <= 50) return firstLine.trim();
  const match = firstLine.slice(0, 50).match(/^.+?[。！？…]/);
  if (match) return match[0].trim();
  return firstLine.slice(0, 50).trim();
}

import { Filter, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGiveaway } from '@/hooks/use-giveaway';
import type { FacebookComment } from '@/lib/services/facebook';

import { FilterSetupCard } from './giveaway/filter-setup-card';
import { PrizeSetupCard } from './giveaway/prize-setup-card';
import { ResultPanel } from './giveaway/result-panel';
import { StatsDrawCard } from './giveaway/stats-draw-card';
import { TabBadge } from './giveaway/tab-badge';

interface GiveawayPanelProps {
  comments: FacebookComment[];
  postId: string;
  postUrl?: string;
  postImage?: string;
  postMessage?: string;
  pageId?: string;
}

export function GiveawayPanel({
  comments,
  postId,
  postUrl,
  postImage,
  postMessage,
  pageId,
}: GiveawayPanelProps) {
  const {
    filters,
    setFilters,
    prizes,
    setPrizes,
    addToBlacklist,
    pool,
    stats,
    results,
    isDrawing,
    draw,
    redraw,
    fetchBlacklist,
    isSaving,
    isSaved,
    saveMode,
    save,
  } = useGiveaway({ comments, postId, postUrl, postImage });

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [giveawayName, setGiveawayName] = useState(() => smartTruncateName(postMessage ?? ''));
  const [prevPostMessage, setPrevPostMessage] = useState(postMessage);
  if (prevPostMessage !== postMessage) {
    setPrevPostMessage(postMessage);
    setGiveawayName(smartTruncateName(postMessage ?? ''));
  }

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleDraw = () => {
    draw();
    setActiveTab('results');
  };

  const handleSave = async () => {
    try {
      const id = await save(giveawayName.trim() || undefined);
      if (id) {
        toast.success('抽獎結果已儲存！');
        router.push('/facebook/engage/winners');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '儲存失敗，請重試');
    }
  };

  const totalPrizeCount = prizes.reduce((sum, p) => sum + p.quantity, 0);
  const canDraw = pool.length > 0 && totalPrizeCount > 0;

  return (
    <Tabs className="flex flex-col gap-4" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="settings">
          <Filter data-icon="inline-start" />
          設定
        </TabsTrigger>
        <TabsTrigger value="results">
          <Trophy data-icon="inline-start" />
          結果
          {results.length > 0 && <TabBadge count={results.length} />}
        </TabsTrigger>
        {/* 黑名單 tab 在匿名模式下無效，暫時隱藏 */}
      </TabsList>

      <TabsContent value="settings">
        <div className="grid gap-4 lg:grid-cols-2">
          <PrizeSetupCard prizes={prizes} onChangePrizes={setPrizes} />
          <FilterSetupCard filters={filters} onChangeFilters={setFilters} />
          <StatsDrawCard
            canDraw={canDraw}
            filters={filters}
            isDrawing={isDrawing}
            pageId={pageId}
            pool={pool}
            stats={stats}
            onAddToBlacklist={addToBlacklist}
            onDraw={handleDraw}
          />
        </div>
      </TabsContent>

      <TabsContent value="results">
        <ResultPanel
          giveawayName={giveawayName}
          isSaved={isSaved}
          isSaving={isSaving}
          pageId={pageId}
          postUrl={postUrl}
          prizes={prizes}
          results={results}
          saveMode={saveMode}
          onAddToBlacklist={addToBlacklist}
          onDraw={draw}
          onGiveawayNameChange={setGiveawayName}
          onRedraw={redraw}
          onSave={handleSave}
        />
      </TabsContent>
    </Tabs>
  );
}
