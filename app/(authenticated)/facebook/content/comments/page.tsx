'use client';

import { PageHeader } from '@/components/common/page-header';
import { CommentList } from '@/components/facebook/comment-list';

export default function FacebookCommentsPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">留言管理</h2>
        <CommentList />
      </div>
    </>
  );
}
