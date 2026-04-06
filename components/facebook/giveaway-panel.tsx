'use client';

import { useEffect, useState } from 'react';

import { Filter, Trophy, UserX } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGiveaway } from '@/hooks/use-giveaway';
import type { FacebookComment } from '@/lib/services/facebook';

import { BlacklistTab } from './giveaway/blacklist-tab';
import { FilterSetupCard } from './giveaway/filter-setup-card';
import { PrizeSetupCard } from './giveaway/prize-setup-card';
import { ResultPanel } from './giveaway/result-panel';
import { StatsDrawCard } from './giveaway/stats-draw-card';
import { TabBadge } from './giveaway/tab-badge';

interface GiveawayPanelProps {
  comments: FacebookComment[];
  postId: string;
  postUrl?: string;
  postMessage?: string;
  pageId?: string;
}

export function GiveawayPanel({
  comments,
  postId,
  postUrl,
  postMessage,
  pageId,
}: GiveawayPanelProps) {
  const {
    filters,
    setFilters,
    prizes,
    setPrizes,
    blacklist,
    addToBlacklist,
    removeFromBlacklist,
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
    fetchBlacklist,
    isSaving,
    isSaved,
    saveMode,
    save,
  } = useGiveaway({ comments, postId, postUrl });

  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  useEffect(() => {
    if (filters.require_reaction && !hasLoadedReactions && !isLoadingReactions) {
      fetchReactions();
    }
  }, [filters.require_reaction, hasLoadedReactions, isLoadingReactions, fetchReactions]);

  const handleDraw = () => {
    draw();
    setActiveTab('results');
  };

  const handleSave = async () => {
    try {
      const id = await save(postMessage || undefined);
      if (id) toast.success('抽獎結果已儲存！');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '儲存失敗，請重試');
    }
  };

  const totalPrizeCount = prizes.reduce((sum, p) => sum + p.quantity, 0);
  const isWaitingForReactions = !!(filters.require_reaction && !hasLoadedReactions);
  const canDraw = pool.length > 0 && totalPrizeCount > 0 && !isWaitingForReactions;

  return (
    <Tabs className="flex flex-col gap-4" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="settings">
          <Filter className="h-4 w-4" />
          設定
        </TabsTrigger>
        <TabsTrigger value="results">
          <Trophy className="h-4 w-4" />
          結果
          {results.length > 0 && <TabBadge count={results.length} />}
        </TabsTrigger>
        <TabsTrigger value="blacklist">
          <UserX className="h-4 w-4" />
          黑名單
          {blacklist.length > 0 && <TabBadge count={blacklist.length} />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <div className="grid gap-4 lg:grid-cols-2">
          <PrizeSetupCard prizes={prizes} onChangePrizes={setPrizes} />
          <FilterSetupCard
            fetchReactions={fetchReactions}
            filters={filters}
            isLoadingReactions={isLoadingReactions}
            reactions={reactions}
            onChangeFilters={setFilters}
          />
          <StatsDrawCard
            canDraw={canDraw}
            filters={filters}
            isDrawing={isDrawing}
            isWaitingForReactions={isWaitingForReactions}
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
          isSaved={isSaved}
          isSaving={isSaving}
          pageId={pageId}
          postUrl={postUrl}
          prizes={prizes}
          results={results}
          saveMode={saveMode}
          onAddToBlacklist={addToBlacklist}
          onDraw={draw}
          onRedraw={redraw}
          onSave={handleSave}
        />
      </TabsContent>

      <TabsContent value="blacklist">
        <BlacklistTab blacklist={blacklist} onRemoveFromBlacklist={removeFromBlacklist} />
      </TabsContent>
    </Tabs>
  );
}
