'use client';

import { Bell } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Card } from '@/components/ui/card';

export default function FacebookNotifyPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">通知發送</h2>
        <Card className="flex flex-col items-center justify-center py-16">
          <Bell className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
          <p className="text-muted-foreground text-body">功能開發中</p>
        </Card>
      </div>
    </>
  );
}
