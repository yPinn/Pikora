'use client';

import { PageHeader } from '@/components/common/page-header';
import { GiveawayList } from '@/components/facebook/giveaway-list';

export default function FacebookGiveawayPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h2 className="text-lg font-semibold">抽獎活動</h2>
        <GiveawayList />
      </div>
    </>
  );
}
