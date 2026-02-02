'use client';

import { PageHeader } from '@/components/common/page-header';
import { GiveawayList } from '@/components/facebook/giveaway-list';

export default function FacebookGiveawayPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">抽獎活動</h2>
        <GiveawayList />
      </div>
    </>
  );
}
